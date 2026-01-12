import { User } from "../models/user/User";

/**
 * Helper to get the date boundary in IST (Indian Standard Time)
 * Returns a Date object representing midnight IST of the given date, represented in UTC.
 * Example:
 *   Input: 2024-01-12T00:30:00Z (Jan 12 00:30 UTC = Jan 12 06:00 IST) -> Returns 2024-01-12T00:00:00Z (representing Jan 12)
 *   Input: 2024-01-11T19:00:00Z (Jan 11 19:00 UTC = Jan 12 00:30 IST) -> Returns 2024-01-12T00:00:00Z (representing Jan 12)
 */
const getISTDate = (date: Date): Date => {
    // Get the date string in IST
    const istString = date.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
    const parts = istString.split("/").map(Number);
    const month = parts[0];
    const day = parts[1];
    const year = parts[2];

    if (month === undefined || day === undefined || year === undefined) {
        throw new Error(`Failed to parse IST date: ${istString}`);
    }

    // Return UTC midnight representing that specific IST date
    return new Date(Date.UTC(year, month - 1, day));
};


/**
 * Updates the user's streak when they solve a problem
 * @param userId - The ID of the user to update
 */
export const updateUserStreak = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const today = getISTDate(new Date());

    // If no last activity date, this is the first solve
    if (!user.lastActivity) {
        user.currentStreak = 1;
        if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
        }
        user.lastActivity = today;
        await user.save();
        return user;
    }

    const lastActivity = getISTDate(new Date(user.lastActivity));

    const daysDifference = Math.round(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference === 0) {
        // Already solved a problem today (in IST), streak stays same
        return user;
    } else if (daysDifference === 1) {
        // Consecutive day - increment streak
        user.currentStreak += 1;
        if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
        }
    } else {
        // Streak broken - reset to 1 (this is their first solve after a break)
        user.currentStreak = 1;
    }

    user.lastActivity = today;
    await user.save();
    return user;
};

/**
 * Checks if the user has missed a day and resets streak to 0 if they haven't solved today or yesterday (in IST)
 * @param userId - The ID of the user to check
 */
export const checkAndResetStreak = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) return null;

    // If they have a streak but no activity date, it's inconsistent - reset it.
    if (!user.lastActivity) {
        if (user.currentStreak > 0) {
            user.currentStreak = 0;
            await user.save();
        }
        return user;
    }

    const today = getISTDate(new Date());
    const lastActivity = getISTDate(new Date(user.lastActivity));

    const daysDifference = Math.round(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If they haven't solved anything today AND haven't solved anything yesterday
    // then the streak is definitely broken (reset to 0).
    // Today is allowed (diff 0), Yesterday is allowed (diff 1). Any more is a reset.
    if (daysDifference > 1) {
        user.currentStreak = 0;
        await user.save();
    }

    return user;
};

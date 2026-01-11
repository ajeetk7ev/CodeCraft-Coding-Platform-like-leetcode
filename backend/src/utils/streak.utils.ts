import { User } from "../models/user/User";

/**
 * Updates the user's streak when they solve a problem
 * @param userId - The ID of the user to update
 */
export const updateUserStreak = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    const lastActivity = new Date(user.lastActivity);
    lastActivity.setHours(0, 0, 0, 0);

    const daysDifference = Math.round(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference === 0) {
        // Already solved a problem today, streak stays same
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
 * Checks if the user has missed a day and resets streak to 0 if they haven't solved today or yesterday
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = new Date(user.lastActivity);
    lastActivity.setHours(0, 0, 0, 0);

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

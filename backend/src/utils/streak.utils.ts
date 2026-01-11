import { User } from "../models/user/User";

/**
 * Updates the user's streak based on their last activity date
 * @param userId - The ID of the user to update
 * @returns Updated user object with new streak values
 */
export const updateUserStreak = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

    // If no last activity date, this is the first login
    if (!user.lastActivityDate) {
        user.currentStreak = 1;
        user.longestStreak = 1;
        user.lastActivityDate = today;
        await user.save();
        return user;
    }

    const lastActivity = new Date(user.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    // Calculate difference in days
    const daysDifference = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference === 0) {
        // Same day - no update needed
        return user;
    } else if (daysDifference === 1) {
        // Consecutive day - increment streak
        user.currentStreak += 1;

        // Update longest streak if current exceeds it
        if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
        }
    } else {
        // Streak broken - reset to 1
        user.currentStreak = 1;
    }

    user.lastActivityDate = today;
    await user.save();

    return user;
};

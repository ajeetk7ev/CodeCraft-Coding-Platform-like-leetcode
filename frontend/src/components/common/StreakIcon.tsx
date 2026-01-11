import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/api";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakData {
    currentStreak: number;
    longestStreak: number;
}

export default function StreakIcon() {
    const [streakData, setStreakData] = useState<StreakData>({
        currentStreak: 0,
        longestStreak: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStreakData();
    }, []);

    const fetchStreakData = async () => {
        try {
            const response = await axios.get(`${API_URL}/user/streak`);
            if (response.data.success) {
                setStreakData(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch streak data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return null; // Or a loading skeleton
    }

    const getMessage = () => {
        const streak = streakData.currentStreak;
        if (streak === 0) return "Start your streak today!";
        if (streak === 1) return "Great start! Keep it going!";
        if (streak < 7) return "You're on fire! 🔥";
        if (streak < 30) return "Amazing streak! Keep going!";
        return "Legendary dedication! 🏆";
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 transition cursor-pointer">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-semibold text-orange-400">
                            {streakData.currentStreak}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 border border-gray-800 p-3">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-white font-semibold">
                                Current Streak: {streakData.currentStreak} days
                            </span>
                        </div>
                        <div className="text-sm text-gray-400">
                            Longest Streak: {streakData.longestStreak} days
                        </div>
                        <div className="text-sm text-orange-400 font-medium pt-1">
                            {getMessage()}
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

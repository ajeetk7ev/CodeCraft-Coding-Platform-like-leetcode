import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/api";
import Navbar from "@/components/common/Navbar";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal, Trophy } from "lucide-react";
import ScrollReveal from "@/components/common/ScrollReveal";

interface LeaderboardUser {
    _id: string;
    user: {
        _id: string;
        username: string;
        avatar?: string;
    };
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
}

export default function Leaderboard() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get(`${API_URL}/leaderboard`);
                if (res.data.success) {
                    setUsers(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
                setError("Failed to load leaderboard");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200">
            <Navbar />
            <div className="max-w-5xl mx-auto px-6 py-12">
                <ScrollReveal>
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4 inline-flex items-center gap-3">
                            <Trophy className="h-10 w-10 text-yellow-500" />
                            Global Leaderboard
                        </h1>
                        <p className="text-gray-400">See who's topping the charts in problem solving.</p>
                    </div>
                </ScrollReveal>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 py-10">{error}</div>
                ) : (
                    <ScrollReveal width="100%">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                            <div className="grid grid-cols-12 gap-4 p-4 text-sm font-semibold text-gray-500 border-b border-gray-800 bg-gray-900/50">
                                <div className="col-span-1 text-center">Rank</div>
                                <div className="col-span-5">User</div>
                                <div className="col-span-2 text-center text-white">Total</div>
                                <div className="col-span-4 grid grid-cols-3 text-center gap-2">
                                    <span className="text-green-500">Easy</span>
                                    <span className="text-yellow-500">Med</span>
                                    <span className="text-red-500">Hard</span>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-800">
                                {users.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">No users found. Be the first to solve a problem!</div>
                                ) : (
                                    users.map((entry, index) => (
                                        <div
                                            key={entry._id}
                                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-800/50 transition-colors duration-200"
                                        >
                                            <div className="col-span-1 text-center font-mono font-bold text-gray-400">
                                                {index + 1 === 1 ? <Medal className="h-6 w-6 text-yellow-500 mx-auto" /> :
                                                    index + 1 === 2 ? <Medal className="h-6 w-6 text-gray-300 mx-auto" /> :
                                                        index + 1 === 3 ? <Medal className="h-6 w-6 text-amber-600 mx-auto" /> :
                                                            `#${index + 1}`}
                                            </div>
                                            <div className="col-span-5">
                                                <Link to={`/profile/${entry.user.username}`} className="flex items-center gap-3 group">
                                                    <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-indigo-500 transition-all">
                                                        <AvatarImage src={entry.user.avatar} />
                                                        <AvatarFallback>{entry.user.username[0].toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-gray-200 group-hover:text-indigo-400 transition-colors">
                                                        {entry.user.username}
                                                    </span>
                                                </Link>
                                            </div>
                                            <div className="col-span-2 text-center font-bold text-white text-lg">
                                                {entry.totalSolved}
                                            </div>
                                            <div className="col-span-4 grid grid-cols-3 text-center gap-2 text-sm font-medium">
                                                <span className="text-green-400/80">{entry.easySolved}</span>
                                                <span className="text-yellow-400/80">{entry.mediumSolved}</span>
                                                <span className="text-red-400/80">{entry.hardSolved}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </ScrollReveal>
                )}
            </div>
        </div>
    );
}

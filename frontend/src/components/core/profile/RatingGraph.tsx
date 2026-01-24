import { useRef, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useProfileStore } from "@/stores/profileStore";
import { TrendingUp, Trophy } from "lucide-react";
import { motion, useInView } from "framer-motion";

const RatingGraph = () => {
    const { profile } = useProfileStore();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const data = useMemo(() => {
        if (!profile?.user?.ratingHistory || profile.user.ratingHistory.length === 0) {
            // Default initial point if no history
            return [{ date: new Date().toLocaleDateString(), rating: 1500 }];
        }
        return profile.user.ratingHistory.map((entry: any) => ({
            date: new Date(entry.date).toLocaleDateString(),
            rating: entry.rating,
            contestId: entry.contestId
        }));
    }, [profile]);

    // Calculate min/max for Y-axis domain padding
    const minRating = Math.min(...data.map((d: any) => d.rating));
    const maxRating = Math.max(...data.map((d: any) => d.rating));
    const padding = 50;

    if (!profile) return null;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="rounded-[2.5rem] bg-gray-950/40 border border-gray-800 p-8 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Trophy className="text-yellow-500" size={24} />
                        Rating Progression
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">Track your competitive journey</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono">
                    <TrendingUp size={16} />
                    {profile.user.rating || 1500}
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#4b5563"
                            tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 700 }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            domain={[minRating - padding, maxRating + padding]}
                            stroke="#4b5563"
                            tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 700 }}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#111827",
                                border: "1px solid #374151",
                                borderRadius: "1rem",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                                color: "#f3f4f6",
                                fontWeight: "bold",
                                fontSize: "12px",
                                padding: "12px"
                            }}
                            labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
                            itemStyle={{ color: "#818cf8" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="rating"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fill="url(#ratingGradient)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default RatingGraph;

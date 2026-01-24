import ProfileSidebar from "@/components/core/profile/ProfileSidebar";
import ProfileStats from "@/components/core/profile/ProfileStats";
import ActivityHeatmap from "@/components/core/profile/ActivityHeatmap";
import RecentSolved from "@/components/core/profile/RecentSolved";
import RatingGraph from "@/components/core/profile/RatingGraph";
import Navbar from "@/components/common/Navbar";
import { useProfileStore } from "@/stores/profileStore";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Profile() {
  const { profile, fetchProfile, isLoading } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-2xl h-12 w-12 border-t-2 border-indigo-500 mx-auto mb-6 shadow-lg shadow-indigo-500/20"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden">
      <Navbar />

      {/* Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[140px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 mt-12 px-4 md:px-8 pb-20 pt-16"
      >
        {/* LEFT SIDEBAR */}
        <div className="w-full md:w-[320px] lg:w-95 shrink-0">
          <ProfileSidebar />
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 space-y-8 min-w-0">
          <ProfileStats />
          <RatingGraph />
          <ActivityHeatmap submissions={profile.submissions} />
          <RecentSolved />
        </div>
      </motion.div>
    </div>
  );
}

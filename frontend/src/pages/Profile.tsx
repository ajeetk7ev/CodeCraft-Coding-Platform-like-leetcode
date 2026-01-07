import ProfileSidebar from "@/components/core/profile/ProfileSidebar";
import ProfileStats from "@/components/core/profile/ProfileStats";
import ActivityHeatmap from "@/components/core/profile/ActivityHeatmap";
import RecentSolved from "@/components/core/profile/RecentSolved";
import Navbar from "@/components/common/Navbar";
import { useProfileStore } from "@/stores/profileStore";
import { useEffect } from "react";

export default function Profile() {
  const { profile, fetchProfile, isLoading } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Navbar />

      <div className="max-w-7xl mx-auto flex gap-6 mt-8">
        {/* LEFT */}
        <div className="w-[30%]">
          <ProfileSidebar />
        </div>

        {/* RIGHT */}
        <div className="w-[65%] space-y-6">
          <ProfileStats />
          <ActivityHeatmap submissions={profile.submissions} />
          <RecentSolved />
        </div>
      </div>
    </div>
  );
}

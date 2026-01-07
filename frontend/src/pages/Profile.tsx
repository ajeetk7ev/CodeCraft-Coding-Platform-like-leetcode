import ProfileSidebar from "@/components/core/profile/ProfileSidebar";
import ProfileStats from "@/components/core/profile/ProfileStats";
import ActivityHeatmap from "@/components/core/profile/ActivityHeatmap";
import RecentSolved from "@/components/core/profile/RecentSolved";
import Navbar from "@/components/common/Navbar";
import { mockSubmissions } from "@/data/submission.mock";

export default function Profile() {
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
          <ActivityHeatmap submissions={mockSubmissions} />
          <RecentSolved />
        </div>
      </div>
    </div>
  );
}

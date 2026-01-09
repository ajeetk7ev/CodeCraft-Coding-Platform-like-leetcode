import { useProfileStore } from "@/stores/profileStore";

export default function ProfileStats() {
  const { profile } = useProfileStore();

  if (!profile) return null;

  const { stats } = profile;

  return (
    <div className="grid grid-cols-4 gap-4">
      {[
        { label: "Solved", value: stats.totalSolved },
        { label: "Easy", value: stats.easySolved, color: "text-green-400" },
        { label: "Medium", value: stats.mediumSolved, color: "text-yellow-400" },
        { label: "Hard", value: stats.hardSolved, color: "text-red-400" },
      ].map((item) => (
        <div
          key={item.label}
          className="bg-gray-900 border border-gray-800 rounded-lg p-4"
        >
          <p className="text-gray-400 text-sm">{item.label}</p>
          <p className={`text-2xl font-bold ${item.color || ""}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

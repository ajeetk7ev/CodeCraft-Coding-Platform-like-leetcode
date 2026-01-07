// src/components/profile/ProfileStats.tsx
import { stats } from "@/data/profile.mock";

export default function ProfileStats() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[
        { label: "Solved", value: stats.solved },
        { label: "Easy", value: stats.easy, color: "text-green-400" },
        { label: "Medium", value: stats.medium, color: "text-yellow-400" },
        { label: "Hard", value: stats.hard, color: "text-red-400" },
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

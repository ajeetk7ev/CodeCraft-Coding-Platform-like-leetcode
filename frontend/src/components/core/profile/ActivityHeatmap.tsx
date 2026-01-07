// src/components/profile/ActivityHeatmap.tsx
const days = Array.from({ length: 365 }, () =>
  Math.floor(Math.random() * 5)
);

export default function ActivityHeatmap() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Submission Activity</h3>

      <div className="grid grid-cols-52 gap-1">
        {days.map((level, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-sm ${
              level === 0
                ? "bg-gray-800"
                : level === 1
                ? "bg-green-900"
                : level === 2
                ? "bg-green-700"
                : level === 3
                ? "bg-green-500"
                : "bg-green-400"
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Green indicates successful submissions
      </p>
    </div>
  );
}

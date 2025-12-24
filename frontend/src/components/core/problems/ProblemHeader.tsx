export default function ProblemHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Problems</h1>
        <p className="text-gray-400 text-sm mt-1">
          Solve problems and prepare for interviews
        </p>
      </div>

      {/* Filters (future-ready) */}
      <div className="flex gap-3">
        <button className="px-3 py-1.5 rounded-md bg-gray-800 text-gray-300 text-sm hover:bg-gray-700">
          All
        </button>
        <button className="px-3 py-1.5 rounded-md bg-gray-800 text-green-400 text-sm">
          Easy
        </button>
        <button className="px-3 py-1.5 rounded-md bg-gray-800 text-yellow-400 text-sm">
          Medium
        </button>
        <button className="px-3 py-1.5 rounded-md bg-gray-800 text-red-400 text-sm">
          Hard
        </button>
      </div>
    </div>
  );
}

interface ProblemTabsProps {
  active: string;
  setActive: (tab: string) => void;
}

const tabs = ["Description", "Editorial", "Solutions", "Submissions"];

export default function ProblemTabs({ active, setActive }: ProblemTabsProps) {
  return (
    <div className="flex bg-gray-900/40 p-1 rounded-xl border border-gray-800/50">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all border border-transparent ${active === tab
              ? "bg-gray-800 text-white shadow-sm border-gray-700/50"
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
            }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

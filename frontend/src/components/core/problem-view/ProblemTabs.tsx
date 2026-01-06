interface ProblemTabsProps {
  active: string;
  setActive: (tab: string) => void;
}

const tabs = ["Description", "Editorial", "Solutions", "Submissions"];

export default function ProblemTabs({ active, setActive }: ProblemTabsProps) {
  return (
    <div className="flex gap-6 border-b border-gray-800 text-sm">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`pb-3 transition ${
            active === tab
              ? "text-indigo-400 border-b-2 border-indigo-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default function DifficultyBadge({
  difficulty,
}: {
  difficulty: string;
}) {
  const styles:Record<string, string> = {
    "easy": "text-green-400 bg-green-400/10",
    "medium": "text-yellow-400 bg-yellow-400/10",
    "hard": "text-red-400 bg-red-400/10",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

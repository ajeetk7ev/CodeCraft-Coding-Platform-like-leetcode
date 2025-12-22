import { Code2 } from "lucide-react";

export default function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center items-center gap-2 mb-3">
        <Code2 className="text-indigo-400 h-7 w-7" />
        <span className="text-xl font-bold tracking-tight text-gray-200">
          CodeArena
        </span>
      </div>

      <h1 className="text-2xl font-semibold text-gray-300">{title}</h1>
      <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>
    </div>
  );
}

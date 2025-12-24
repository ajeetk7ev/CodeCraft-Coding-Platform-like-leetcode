import { Link } from "react-router-dom";
import DifficultyBadge from "./DifficultyBadge";

type Problem = {
  _id: string;
  title: string;
  slug: string;
  difficulty: string;
  createdBy: {
    username: string;
  };
};

export default function ProblemTable({ data, page }: { data: Problem[], page:number }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-900 text-gray-400">
          <tr>
            
            <th className="px-6 py-4 font-medium">Title</th>
            <th className="px-6 py-4 font-medium">Difficulty</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-800">
          {data.map((problem, index) => (
            <tr
              key={problem._id}
              className="bg-gray-950 hover:bg-gray-900 transition"
            >
              

              <td className="px-6 py-4">
                <Link
                  to={`/problems/${problem.slug}`}
                  className="text-indigo-400 hover:underline font-medium"
                >
                 {10*(page-1)+index+1}. {problem.title}
                </Link>
              </td>

              <td className="px-6 py-4">
                <DifficultyBadge difficulty={problem.difficulty} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

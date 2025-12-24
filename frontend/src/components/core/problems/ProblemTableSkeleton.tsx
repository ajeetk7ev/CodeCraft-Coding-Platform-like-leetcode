import { Skeleton } from "@/components/ui/skeleton";

export default function ProblemTableSkeleton() {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-4">
              <Skeleton className="h-4 w-6 bg-gray-800" />
            </th>
            <th className="px-6 py-4">
              <Skeleton className="h-4 w-24 bg-gray-800" />
            </th>
            <th className="px-6 py-4">
              <Skeleton className="h-4 w-20 bg-gray-800" />
            </th>
            <th className="px-6 py-4">
              <Skeleton className="h-4 w-20 bg-gray-800" />
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-800">
          {[...Array(8)].map((_, i) => (
            <tr key={i} className="bg-gray-950">
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-6 bg-gray-800" />
              </td>

              <td className="px-6 py-4">
                <Skeleton className="h-4 w-48 bg-gray-800" />
              </td>

              <td className="px-6 py-4">
                <Skeleton className="h-6 w-20 rounded-full bg-gray-800" />
              </td>

              <td className="px-6 py-4">
                <Skeleton className="h-4 w-24 bg-gray-800" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function ProblemHeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <Skeleton className="h-6 w-40 bg-gray-800" />
        <Skeleton className="h-4 w-64 mt-2 bg-gray-800" />
      </div>

      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-8 w-16 rounded-md bg-gray-800"
          />
        ))}
      </div>
    </div>
  );
}

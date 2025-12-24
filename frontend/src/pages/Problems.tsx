import { useEffect, useState } from "react";
import ProblemHeader from "@/components/core/problems/ProblemHeader";
import ProblemTable from "@/components/core/problems/ProblemTable";
import ProblemHeaderSkeleton from "@/components/core/problems/ProblemSkeleton";
import ProblemTableSkeleton from "@/components/core/problems/ProblemTableSkeleton";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function Problems() {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<any[]>([]);

  const { token } = useAuthStore();

  const navigate = useNavigate();

  if (!token) {
    navigate("/login");
  }

  useEffect(() => {
    setTimeout(() => {
      setProblems([
        {
          _id: "6946ea5ca4538da0d5a82887",
          title: "Print Input String",
          slug: "print-input-string",
          difficulty: "easy",
          createdBy: { username: "ajeetk20" },
        },
        {
          _id: "6942cbd3754305dd93f0c1fb",
          title: "Valid Parentheses",
          slug: "valid-parentheses",
          difficulty: "easy",
          createdBy: { username: "ajeetk20" },
        },
        {
          _id: "6942cba9754305dd93f0c1de",
          title: "Reverse Integer",
          slug: "reverse-integer",
          difficulty: "medium",
          createdBy: { username: "ajeetk20" },
        },
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="bg-gray-950 min-h-screen text-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <>
            <ProblemHeaderSkeleton />
            <ProblemTableSkeleton />
          </>
        ) : (
          <>
            <ProblemHeader />
            <ProblemTable data={problems} />
          </>
        )}
      </div>
    </div>
  );
}

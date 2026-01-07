import { useEffect, useState } from "react";
import ProblemHeader from "@/components/core/problems/ProblemHeader";
import ProblemTable from "@/components/core/problems/ProblemTable";
import ProblemHeaderSkeleton from "@/components/core/problems/ProblemSkeleton";
import ProblemTableSkeleton from "@/components/core/problems/ProblemTableSkeleton";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import { API_URL } from "@/utils/api";
import Navbar from "@/components/common/Navbar";

export default function Problems() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<any[]>([]);

  // pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  /* ---------------- FETCH PROBLEMS ---------------- */
  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_URL}/problems?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setProblems(res.data.data);
          setTotalPages(res.data.pagination.pages);
        }
      } catch (error) {
        console.error("Failed to fetch problems", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProblems();
  }, [page, limit, token]);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-gray-950 min-h-screen text-gray-100">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <>
            <ProblemHeaderSkeleton />
            <ProblemTableSkeleton />
          </>
        ) : (
          <>
            <ProblemHeader />
            <ProblemTable data={problems} page={page} />

            {/* Pagination */}
            <div className="flex justify-center gap-3 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded bg-gray-800 disabled:opacity-50"
              >
                Prev
              </button>

              <span className="px-4 py-2 text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded bg-gray-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

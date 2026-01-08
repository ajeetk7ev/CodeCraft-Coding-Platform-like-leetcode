import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  FileText,
  Send,
  CheckCircle,
  Shield,
  Ban,
} from "lucide-react";
import { API_URL } from "../../utils/api";

interface Stats {
  totalProblems: number;
  totalUsers: number;
  totalSubmissions: number;
  totalAccepted: number;
  totalAdmins: number;
  totalBannedUsers: number;
}

const StatsCards = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_URL}/admin/stats`);
      setStats(res.data.data);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Authentication required. Please log in as admin.");
      } else {
        setError(err.response?.data?.message || "Failed to load statistics. Using demo data.");
        // fallback demo data
        setStats({
          totalProblems: 125,
          totalUsers: 1250,
          totalSubmissions: 8750,
          totalAccepted: 5420,
          totalAdmins: 5,
          totalBannedUsers: 12,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Problems",
      value: stats?.totalProblems,
      icon: FileText,
      accent: "text-indigo-400",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers,
      icon: Users,
      accent: "text-emerald-400",
    },
    {
      title: "Total Submissions",
      value: stats?.totalSubmissions,
      icon: Send,
      accent: "text-purple-400",
    },
    {
      title: "Accepted Solutions",
      value: stats?.totalAccepted,
      icon: CheckCircle,
      accent: "text-green-400",
    },
    {
      title: "Admins",
      value: stats?.totalAdmins,
      icon: Shield,
      accent: "text-orange-400",
    },
    {
      title: "Banned Users",
      value: stats?.totalBannedUsers,
      icon: Ban,
      accent: "text-red-400",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-slate-900 border border-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-900 border border-yellow-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-200">Using demo data</h3>
            <p className="text-sm text-yellow-300 mt-1">
              {error} - Showing sample statistics for demonstration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="
            relative overflow-hidden
            rounded-xl border border-slate-800 bg-slate-900
            p-6 transition-all duration-200
            hover:border-slate-700 hover:translate-y-[-2px]
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">{card.title}</p>
              <p className="mt-1 text-3xl font-bold text-slate-100">
                {card.value?.toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-slate-800 p-3">
              <card.icon className={`h-6 w-6 ${card.accent}`} />
            </div>
          </div>

          {/* subtle bottom divider */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>
      ))}
    </div>
  );
};

export default StatsCards;

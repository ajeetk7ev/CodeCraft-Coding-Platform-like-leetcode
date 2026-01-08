import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const ChartsSection = () => {
  const [submissionsData, setSubmissionsData] = useState<any[]>([]);
  const [acVsWaData, setAcVsWaData] = useState<any>(null);
  const [mostSolvedData, setMostSolvedData] = useState<any[]>([]);
  const [difficultyData, setDifficultyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [s, a, m, d] = await Promise.all([
        axios.get(`${API_URL}/admin/stats/submissions-per-day`),
        axios.get(`${API_URL}/admin/stats/ac-vs-wa`),
        axios.get(`${API_URL}/admin/stats/most-solved`),
        axios.get(`${API_URL}/admin/stats/difficulty-distribution`),
      ]);

      setSubmissionsData(s.data.data);
      setAcVsWaData(a.data.data);
      setMostSolvedData(m.data.data);
      setDifficultyData(d.data.data);
    } catch (err: any) {
      console.error("Error fetching chart data:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Authentication required. Please log in as admin.");
      } else {
        setError(err.response?.data?.message || "Failed to load chart data. Using demo data.");
        // mock fallback
        setSubmissionsData(
          [...Array(30)].map((_, i) => ({
            _id: `Day ${i + 1}`,
            count: Math.floor(Math.random() * 40) + 10,
          }))
        );
        setAcVsWaData({ accepted: 5400, wrongAnswer: 3300 });
        setMostSolvedData([
          { title: "Two Sum", count: 1200 },
          { title: "Add Two Numbers", count: 950 },
          { title: "Longest Substring", count: 850 },
        ]);
        setDifficultyData([
          { difficulty: "easy", count: 45 },
          { difficulty: "medium", count: 55 },
          { difficulty: "hard", count: 25 },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-80 rounded-xl border border-slate-800 bg-slate-900 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
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
                {error} - Showing sample charts for demonstration.
              </p>
            </div>
          </div>
        </div>
        {/* Still render charts with mock data */}
      </div>
    );
  }

  const pieData = [
    { name: "Accepted", value: acVsWaData.accepted, color: "#22C55E" },
    { name: "Wrong Answer", value: acVsWaData.wrongAnswer, color: "#EF4444" },
  ];

  const difficultyColors: any = {
    easy: "#22C55E",
    medium: "#F59E0B",
    hard: "#EF4444",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Submissions */}
      <ChartCard title="Submissions (Last 30 Days)">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={submissionsData}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="_id" tick={{ fontSize: 11 }} stroke="#94A3B8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#6366F1"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* AC vs WA */}
      <ChartCard title="AC vs WA Ratio">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {pieData.map((e, i) => (
                <Cell key={i} fill={e.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Most Solved */}
      <ChartCard title="Most Solved Problems">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={mostSolvedData}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="title" tick={{ fontSize: 11 }} stroke="#94A3B8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
            <Tooltip />
            <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Difficulty */}
      <ChartCard title="Difficulty Distribution">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={difficultyData}
              dataKey="count"
              outerRadius={80}
              label={({ payload }) =>
                `${payload.difficulty}: ${payload.count}`
              }
            >
              {difficultyData.map((d, i) => (
                <Cell key={i} fill={difficultyColors[d.difficulty]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default ChartsSection;

/* ---------------- Helper Card ---------------- */

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
    <h3 className="mb-4 text-sm font-semibold text-slate-300">
      {title}
    </h3>
    {children}
  </div>
);

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

interface SubmissionsPerDay {
  _id: string;
  count: number;
}

interface AcVsWaData {
  accepted: number;
  wrongAnswer: number;
  total: number;
}

interface MostSolvedProblem {
  problemId: string;
  title: string;
  slug: string;
  difficulty: string;
  count: number;
}

interface DifficultyData {
  difficulty: string;
  count: number;
  [key: string]: any; // Add index signature for recharts compatibility
}

interface PieDataItem {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

const ChartsSection = () => {
  const [submissionsData, setSubmissionsData] = useState<SubmissionsPerDay[]>([]);
  const [acVsWaData, setAcVsWaData] = useState<AcVsWaData | null>(null);
  const [mostSolvedData, setMostSolvedData] = useState<MostSolvedProblem[]>([]);
  const [difficultyData, setDifficultyData] = useState<DifficultyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const [
        submissionsRes,
        acVsWaRes,
        mostSolvedRes,
        difficultyRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/admin/stats/submissions-per-day`),
        axios.get(`${API_URL}/admin/stats/ac-vs-wa`),
        axios.get(`${API_URL}/admin/stats/most-solved`),
        axios.get(`${API_URL}/admin/stats/difficulty-distribution`),
      ]);

      setSubmissionsData(submissionsRes.data.data);
      setAcVsWaData(acVsWaRes.data.data);
      setMostSolvedData(mostSolvedRes.data.data);
      setDifficultyData(difficultyRes.data.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const pieData: PieDataItem[] = acVsWaData ? [
    { name: "Accepted", value: acVsWaData.accepted, color: "#10B981" },
    { name: "Wrong Answer", value: acVsWaData.wrongAnswer, color: "#EF4444" },
  ] : [];

  const difficultyColors = {
    easy: "#10B981",
    medium: "#F59E0B",
    hard: "#EF4444",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Submissions per day */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Submissions per Day (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={submissionsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="_id"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: "#3B82F6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AC vs WA Ratio */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          AC vs WA Ratio
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Most Solved Problems */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Most Solved Problems
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mostSolvedData.slice(0, 5)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="title"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Difficulty Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Difficulty Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={difficultyData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ payload }) => `${payload?.difficulty || 'Unknown'}: ${payload?.count || 0}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {difficultyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={difficultyColors[entry.difficulty as keyof typeof difficultyColors] || "#6B7280"}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartsSection;
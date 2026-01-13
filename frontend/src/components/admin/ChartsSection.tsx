import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/api";
import {
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
  AreaChart,
  Area,
} from "recharts";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import {
  BarChart3,
  Activity,
  Target,
  Layers,
  ChevronRight,
} from "lucide-react";

const ChartsSection = () => {
  const { token } = useAuthStore();
  const [submissionsData, setSubmissionsData] = useState<any[]>([]);
  const [acVsWaData, setAcVsWaData] = useState<any>(null);
  const [mostSolvedData, setMostSolvedData] = useState<any[]>([]);
  const [difficultyData, setDifficultyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      const [s, a, m, d] = await Promise.all([
        axios.get(`${API_URL}/admin/stats/submissions-per-day`, authHeaders),
        axios.get(`${API_URL}/admin/stats/ac-vs-wa`, authHeaders),
        axios.get(`${API_URL}/admin/stats/most-solved`, authHeaders),
        axios.get(`${API_URL}/admin/stats/difficulty-distribution`, authHeaders),
      ]);

      setSubmissionsData(s.data.data);
      setAcVsWaData(a.data.data);
      setMostSolvedData(m.data.data);
      setDifficultyData(d.data.data);
    } catch (err: any) {
      console.error("Error fetching chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-96 rounded-[2.5rem] border border-white/5 bg-slate-900/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const acWaPieData = acVsWaData ? [
    { name: "Accepted", value: acVsWaData.accepted, color: "#10b981" },
    { name: "Wrong Answer", value: acVsWaData.wrongAnswer, color: "#f43f5e" },
  ] : [];

  const difficultyColors: any = {
    easy: "#10b981",
    medium: "#6366f1",
    hard: "#f43f5e",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Submissions Trend */}
      <ChartCard
        title="Submission Velocity"
        subtitle="Daily platform activity (30d)"
        icon={<Activity className="w-5 h-5 text-indigo-400" />}
      >
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={submissionsData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="_id"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 800 }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Accuracy Breakdown */}
      <ChartCard
        title="Accuracy Analytics"
        subtitle="AC vs WA distribution ratio"
        icon={<Target className="w-5 h-5 text-emerald-400" />}
      >
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={acWaPieData}
              innerRadius={70}
              outerRadius={95}
              paddingAngle={8}
              dataKey="value"
              cx="50%"
              cy="50%"
              animationBegin={500}
              animationDuration={1500}
              stroke="none"
              label={({ name, percent }) =>
                percent !== undefined
                  ? `${name} ${(percent * 100).toFixed(0)}%`
                  : name
              }

            >
              {acWaPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Top Solved List */}
      <ChartCard
        title="Top Challenges"
        subtitle="Most solved problems by count"
        icon={<BarChart3 className="w-5 h-5 text-purple-400" />}
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={mostSolvedData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="title"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 700 }}
              width={100}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
            />
            <Bar
              dataKey="count"
              fill="#8b5cf6"
              radius={[0, 10, 10, 0]}
              barSize={20}
              animationDuration={2000}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Difficulty Spectrum */}
      <ChartCard
        title="Difficulty Spectrum"
        subtitle="Global content distribution"
        icon={<Layers className="w-5 h-5 text-rose-400" />}
      >
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={difficultyData}
              dataKey="count"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={12}
              cx="50%"
              cy="50%"
              stroke="none"
              animationBegin={1000}
              animationDuration={1500}
              label={({ payload }) => `${payload.difficulty.toUpperCase()}`}
            >
              {difficultyData.map((d, i) => (
                <Cell key={i} fill={difficultyColors[d.difficulty]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

const ChartCard = ({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group"
  >
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="p-3 Math.min rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">{title}</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>

    <div className="relative">
      {children}
    </div>

    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.div>
);

export default ChartsSection;

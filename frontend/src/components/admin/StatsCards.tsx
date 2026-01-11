import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  FileText,
  Send,
  CheckCircle,
  Shield,
  Ban,
  ArrowUpRight,
} from "lucide-react";
import { API_URL } from "../../utils/api";
import { useAuthStore } from "@/stores/authStore";
import AnimatedCounter from "@/components/common/AnimatedCounter";
import { motion } from "framer-motion";

interface Stats {
  totalProblems: number;
  totalUsers: number;
  totalSubmissions: number;
  totalAccepted: number;
  totalAdmins: number;
  totalBannedUsers: number;
}

const StatsCards = () => {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const res = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data.data);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      setErrorStatus(err.response?.data?.message || "Failed to load statistics.");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Active Problems",
      value: stats?.totalProblems || 0,
      icon: FileText,
      color: "indigo",
      description: "Total coding challenges",
    },
    {
      title: "Total Community",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "emerald",
      description: "Registered developers",
    },
    {
      title: "Solutions Sent",
      value: stats?.totalSubmissions || 0,
      icon: Send,
      color: "purple",
      description: "Total code submissions",
    },
    {
      title: "Succesful Runs",
      value: stats?.totalAccepted || 0,
      icon: CheckCircle,
      color: "teal",
      description: "Code passing all tests",
    },
    {
      title: "Active Admins",
      value: stats?.totalAdmins || 0,
      icon: Shield,
      color: "orange",
      description: "System administrators",
    },
    {
      title: "Restricted Access",
      value: stats?.totalBannedUsers || 0,
      icon: Ban,
      color: "rose",
      description: "Permanently banned",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-44 rounded-[2.5rem] bg-slate-900/50 border border-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cards.map((card, index) => (
        <StatCard key={card.title} card={card} index={index} />
      ))}
    </div>
  );
};

function StatCard({ card, index }: { card: any; index: number }) {
  const colors: any = {
    indigo: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400",
    teal: "from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-400",
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400",
    rose: "from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-400",
  };

  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative group bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl hover:shadow-${card.color}-500/10 transition-all duration-500 overflow-hidden`}
    >
      {/* Background Glow */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${colors[card.color]} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700`} />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors`}>
            <Icon className={`h-7 w-7 ${card.color === 'indigo' ? 'text-indigo-400' : card.color === 'emerald' ? 'text-emerald-400' : card.color === 'purple' ? 'text-purple-400' : card.color === 'teal' ? 'text-teal-400' : card.color === 'orange' ? 'text-orange-400' : 'text-rose-400'}`} />
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-500 group-hover:text-white transition-colors cursor-pointer">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{card.title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">
              <AnimatedCounter to={card.value} />
            </span>
            <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">+12.5%</span>
          </div>
          <p className="mt-3 text-[11px] font-bold text-slate-500 group-hover:text-slate-400 transition-colors uppercase tracking-widest leading-none">
            {card.description}
          </p>
        </div>
      </div>

      {/* Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

export default StatsCards;

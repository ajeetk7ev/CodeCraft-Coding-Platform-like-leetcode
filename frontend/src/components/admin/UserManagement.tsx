import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/api";
import {
  Search,
  Ban,
  Eye,
  UserCheck,
  Shield,
  User,
  Mail,
  Calendar,
  MoreVertical,
  FilterX,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface UserType {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  banned: boolean;
  createdAt: string;
  avatar?: string;
}

interface UserStats {
  user: UserType;
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
  };
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [banFilter, setBanFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, banFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append("limit", "1000");
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter) params.append("role", roleFilter);
      if (banFilter) params.append("banned", banFilter);

      const res = await axios.get(`${API_URL}/admin/users?${params}`);
      setUsers(res.data.data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Authentication required. Please log in as admin.");
      } else {
        setError(err.response?.data?.message || "Failed to load users. Using demo data.");
        // Mock data for development when API fails
        setUsers([
          { _id: '1', username: 'john_doe', fullName: 'John Doe', email: 'john@example.com', role: 'user', banned: false, createdAt: new Date().toISOString() },
          { _id: '2', username: 'jane_admin', fullName: 'Jane Smith', email: 'jane@example.com', role: 'admin', banned: false, createdAt: new Date().toISOString() },
          { _id: '3', username: 'banned_user', fullName: 'Bob Johnson', email: 'bob@example.com', role: 'user', banned: true, createdAt: new Date().toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (id: string, banned: boolean) => {
    try {
      await axios.patch(`${API_URL}/admin/users/${id}/ban`, { banned: !banned });
      toast.success(banned ? "User unbanned" : "User banned");
      fetchUsers();
    } catch (err: any) {
      toast.error("Action failed");
    }
  };

  const assignRole = async (id: string, role: "user" | "admin") => {
    try {
      await axios.patch(`${API_URL}/admin/users/${id}/role`, { role });
      toast.success("Role updated");
      fetchUsers();
    } catch (err: any) {
      toast.error("Failed to update role");
    }
  };

  const viewStats = async (id: string) => {
    try {
      const res = await axios.get(`${API_URL}/admin/users/${id}/stats`);
      setSelectedUser(res.data.data);
      setStatsOpen(true);
    } catch (err: any) {
      toast.error("Failed to fetch stats");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setBanFilter("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase flex items-center gap-4">
            User <span className="text-indigo-500">Management</span>
          </h1>
          <p className="text-slate-400 font-medium">Manage platform users, roles, and account status</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-200">{users.length} Total Users</span>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-4"
        >
          <div className="p-2 bg-amber-500/10 rounded-xl">
            <FilterX className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-200">System Note</h3>
            <p className="text-sm text-amber-400/80 mt-0.5">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Modern Filter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-900/30 p-4 rounded-3xl border border-slate-800/50 backdrop-blur-xl">
        <div className="lg:col-span-5 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email or username..."
            className="pl-12 bg-slate-950/50 border-slate-800 h-12 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-white"
          />
        </div>

        <div className="lg:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full h-12 rounded-2xl bg-slate-950/50 border border-slate-800 px-4 py-2 text-sm text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <select
            value={banFilter}
            onChange={(e) => setBanFilter(e.target.value)}
            className="w-full h-12 rounded-2xl bg-slate-950/50 border border-slate-800 px-4 py-2 text-sm text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="false">Active</option>
            <option value="true">Banned</option>
          </select>
        </div>

        <div className="lg:col-span-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetFilters}
            className="h-12 w-12 rounded-2xl hover:bg-slate-800 text-slate-400"
            title="Reset Filters"
          >
            <FilterX className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden xl:block rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden shadow-2xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs tracking-widest font-bold">
            <tr>
              <th className="px-8 py-5">User Profile</th>
              <th className="px-6 py-5">Access Level</th>
              <th className="px-6 py-5">Account Status</th>
              <th className="px-6 py-5">Registration</th>
              <th className="px-8 py-5 text-right">Settings</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/50">
            <AnimatePresence mode="popLayout">
              {users.map((u) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={u._id}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                        {u.avatar ? <img src={u.avatar} alt="" className="rounded-full object-cover h-full w-full" /> : u.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100 flex items-center gap-2">
                          {u.fullName}
                          {u.role === 'admin' && <Shield className="h-3.5 w-3.5 text-indigo-400" />}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">@{u.username} · {u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => assignRole(u._id, e.target.value as any)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${u.role === "admin"
                          ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                          }`}
                      >
                        <option value="user">USER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${u.banned
                        ? "bg-red-500/10 text-red-500"
                        : "bg-emerald-500/10 text-emerald-500"
                        }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${u.banned ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                      {u.banned ? "Restricted" : "Verified"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="h-4 w-4" />
                      {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>

                  <td className="px-8 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-800 transition-colors">
                          <MoreVertical className="h-5 w-5 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 rounded-2xl min-w-44 p-2 shadow-2xl backdrop-blur-xl">
                        <DropdownMenuItem
                          onClick={() => viewStats(u._id)}
                          className="flex items-center gap-3 rounded-xl py-3 cursor-pointer hover:bg-white/5 transition-colors focus:bg-white/5 text-slate-200"
                        >
                          <Eye className="h-4 w-4 text-indigo-400" /> View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleBan(u._id, u.banned)}
                          className={`flex items-center gap-3 rounded-xl py-3 cursor-pointer transition-colors focus:bg-white/5 ${u.banned ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                          {u.banned ? (
                            <><UserCheck className="h-4 w-4" /> Restore Account</>
                          ) : (
                            <><Ban className="h-4 w-4" /> Suspend Access</>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {users.map((u) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={u._id}
              className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-5 rounded-3xl space-y-4 hover:border-slate-700 transition-colors relative group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {u.avatar ? <img src={u.avatar} alt="" className="rounded-full object-cover h-full w-full" /> : u.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2 italic">
                      {u.fullName}
                      {u.role === 'admin' && <Shield className="h-4 w-4 text-indigo-400" />}
                    </h3>
                    <p className="text-xs text-slate-400">@{u.username}</p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-slate-800/50 hover:bg-slate-800">
                      <MoreVertical className="h-5 w-5 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 rounded-2xl min-w-44 p-2 shadow-2xl backdrop-blur-xl">
                    <DropdownMenuItem
                      onClick={() => viewStats(u._id)}
                      className="rounded-xl p-3 cursor-pointer"
                    >
                      View Stats
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toggleBan(u._id, u.banned)}
                      className={`rounded-xl p-3 cursor-pointer ${u.banned ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {u.banned ? "Unban" : "Ban"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</span>
                  <span className="text-slate-300 font-medium truncate max-w-[180px]">{u.email}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Joined</span>
                  <span className="text-slate-300 font-medium">{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${u.banned ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  }`}>
                  {u.banned ? "Banned" : "Active"}
                </span>

                <select
                  value={u.role}
                  onChange={(e) => assignRole(u._id, e.target.value as any)}
                  className={`ml-auto px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-800 border-none text-slate-400 focus:ring-2 focus:ring-indigo-500/20`}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <div className="py-20 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center mb-6">
            <Search className="h-10 w-10 text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-white">No users found</h3>
          <p className="text-slate-500 mt-2 max-w-sm">We couldn't find any users matching your current search or filter criteria.</p>
          <Button variant="link" onClick={resetFilters} className="text-indigo-400 mt-4 h-auto p-0 underline italic">Clear all filters</Button>
        </div>
      )}

      {/* Stats Dialog */}
      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 rounded-3xl max-w-lg p-0 overflow-hidden shadow-2xl">
          <div className="bg-linear-to-br from-indigo-600 to-purple-700 h-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          </div>

          <div className="px-8 pb-8 -mt-10 relative">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-3xl bg-slate-900 border-4 border-slate-950 flex items-center justify-center text-white font-black text-3xl shadow-xl overflow-hidden">
                {selectedUser?.user.avatar ? <img src={selectedUser.user.avatar} className="object-cover h-full w-full" /> : selectedUser?.user.fullName.charAt(0)}
              </div>
              <h2 className="text-2xl font-black text-white mt-4">{selectedUser?.user.fullName}</h2>
              <p className="text-indigo-400 font-medium text-sm italic mb-8">@{selectedUser?.user.username}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Solved", value: selectedUser?.stats.totalSolved, color: "text-emerald-400" },
                { label: "Acceptance", value: `${selectedUser?.acceptanceRate}%`, color: "text-indigo-400" },
                { label: "Attempts", value: selectedUser?.totalSubmissions, color: "text-amber-400" },
                { label: "Correct", value: selectedUser?.acceptedSubmissions, color: "text-purple-400" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col items-center"
                >
                  <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between text-sm px-2">
                <span className="text-slate-500 flex items-center gap-2"><Mail className="h-4 w-4" /> Email</span>
                <span className="text-slate-200 font-medium">{selectedUser?.user.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm px-2">
                <span className="text-slate-500 flex items-center gap-2"><User className="h-4 w-4" /> Role</span>
                <span className="text-slate-200 font-medium uppercase tracking-tighter">{selectedUser?.user.role}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;

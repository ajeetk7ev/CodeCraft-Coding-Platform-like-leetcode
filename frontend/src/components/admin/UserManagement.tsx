import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/api";
import {
  Search,
  Ban,
  Eye,
  UserCheck,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import toast from "react-hot-toast";

interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  banned: boolean;
  createdAt: string;
}

interface UserStats {
  user: User;
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
  const [users, setUsers] = useState<User[]>([]);
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
      params.append("limit", "1000"); // Get more users for admin management
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
        toast.error("Failed to load users");
        // Show mock data for development
        setUsers([
          {
            _id: '1',
            username: 'john_doe',
            fullName: 'John Doe',
            email: 'john@example.com',
            role: 'user' as const,
            banned: false,
            createdAt: new Date().toISOString(),
          },
          {
            _id: '2',
            username: 'jane_admin',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            role: 'admin' as const,
            banned: false,
            createdAt: new Date().toISOString(),
          },
          {
            _id: '3',
            username: 'banned_user',
            fullName: 'Bob Johnson',
            email: 'bob@example.com',
            role: 'user' as const,
            banned: true,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (id: string, banned: boolean) => {
    try {
      await axios.patch(`${API_URL}/admin/users/${id}/ban`, {
        banned: !banned,
      });
      toast.success(banned ? "User unbanned" : "User banned");
      fetchUsers();
    } catch (err: any) {
      console.error("Failed to toggle ban status:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Admin authentication required");
      } else {
        toast.error("Action failed");
      }
    }
  };

  const assignRole = async (id: string, role: "user" | "admin") => {
    try {
      await axios.patch(`${API_URL}/admin/users/${id}/role`, { role });
      toast.success("Role updated");
      fetchUsers();
    } catch (err: any) {
      console.error("Failed to update role:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Admin authentication required");
      } else {
        toast.error("Failed to update role");
      }
    }
  };

  const viewStats = async (id: string) => {
    try {
      const res = await axios.get(`${API_URL}/admin/users/${id}/stats`);
      setSelectedUser(res.data.data);
      setStatsOpen(true);
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Admin authentication required");
      } else {
        toast.error("Failed to fetch stats");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-800">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
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
                {error} - Showing sample users for demonstration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="pl-9 bg-slate-950 border-slate-800"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={banFilter}
            onChange={(e) => setBanFilter(e.target.value)}
            className="rounded-md bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Banned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {users.map((u) => (
              <tr
                key={u._id}
                className="hover:bg-slate-800/60 transition"
              >
                <td className="px-6 py-4">
                  <div className="font-medium">{u.fullName}</div>
                  <div className="text-xs text-slate-400">
                    @{u.username} · {u.email}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      u.banned
                        ? "bg-red-500/10 text-red-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {u.banned ? "Banned" : "Active"}
                  </span>
                </td>

                <td className="px-6 py-4 text-slate-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 text-right space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => viewStats(u._id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleBan(u._id, u.banned)}
                  >
                    {u.banned ? (
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Ban className="h-4 w-4 text-red-400" />
                    )}
                  </Button>

                  <select
                    value={u.role}
                    onChange={(e) =>
                      assignRole(u._id, e.target.value as any)
                    }
                    className="rounded-md bg-slate-950 border border-slate-800 px-2 py-1 text-xs"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats Dialog */}
      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800">
          <DialogHeader>
            <DialogTitle>User Statistics</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                ["Solved", selectedUser.stats.totalSolved],
                ["Acceptance %", `${selectedUser.acceptanceRate}%`],
                ["Submissions", selectedUser.totalSubmissions],
                ["Accepted", selectedUser.acceptedSubmissions],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg bg-slate-800 p-4 text-center"
                >
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;

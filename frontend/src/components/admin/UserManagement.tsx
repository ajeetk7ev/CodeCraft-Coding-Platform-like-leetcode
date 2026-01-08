import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/api";
import { Search, Ban, Shield, Eye, UserCheck, UserX } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [banFilter, setBanFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, banFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter) params.append("role", roleFilter);
      if (banFilter) params.append("banned", banFilter);

      const response = await axios.get(`${API_URL}/admin/users?${params}`);
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (userId: string, currentlyBanned: boolean) => {
    try {
      await axios.patch(`${API_URL}/admin/users/${userId}/ban`, {
        banned: !currentlyBanned,
      });
      toast.success(`User ${!currentlyBanned ? "banned" : "unbanned"} successfully`);
      fetchUsers();
    } catch (error) {
      console.error("Error toggling ban:", error);
      toast.error("Failed to update user status");
    }
  };

  const assignRole = async (userId: string, newRole: "user" | "admin") => {
    try {
      await axios.patch(`${API_URL}/admin/users/${userId}/role`, {
        role: newRole,
      });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("Failed to update user role");
    }
  };

  const viewUserStats = async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/admin/users/${userId}/stats`);
      setSelectedUser(response.data.data);
      setStatsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast.error("Failed to fetch user stats");
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={banFilter}
            onChange={(e) => setBanFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.banned
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {user.banned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewUserStats(user._id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleBan(user._id, user.banned)}
                    >
                      {user.banned ? (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <Ban className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                    <select
                      value={user.role}
                      onChange={(e) => assignRole(user._id, e.target.value as "user" | "admin")}
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
      </div>

      {/* User Stats Dialog */}
      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Statistics</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{selectedUser.user.fullName}</h4>
                <p className="text-sm text-gray-600">@{selectedUser.user.username}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedUser.stats.totalSolved}
                  </div>
                  <div className="text-sm text-gray-600">Problems Solved</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedUser.acceptanceRate}%
                  </div>
                  <div className="text-sm text-gray-600">Acceptance Rate</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedUser.totalSubmissions}
                  </div>
                  <div className="text-sm text-gray-600">Total Submissions</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedUser.acceptedSubmissions}
                  </div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">Difficulty Breakdown:</h5>
                <div className="flex justify-between text-sm">
                  <span>Easy: {selectedUser.stats.easySolved}</span>
                  <span>Medium: {selectedUser.stats.mediumSolved}</span>
                  <span>Hard: {selectedUser.stats.hardSolved}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
import UserManagement from "@/components/admin/UserManagement";
import { useDashboardCollapsedStore } from "@/stores/dashboardCollapsedStore";
export default function Users() {
  const {collapsed} = useDashboardCollapsedStore();
  return (
    <div
      className={`space-y-10  ${
        collapsed ? "ml-16" : "ml-64 sm:ml-0"
      } transition-all duration-300`}
    >
      <UserManagement />;
    </div>
  );
}

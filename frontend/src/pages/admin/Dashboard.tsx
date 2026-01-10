import StatsCards from "@/components/admin/StatsCards";
import ChartsSection from "@/components/admin/ChartsSection";
import { useDashboardCollapsedStore } from "@/stores/dashboardCollapsedStore";

export default function Dashboard() {
  const { collapsed } = useDashboardCollapsedStore();
  console.log("Dashboard collapsed state:", collapsed);
  return (
    <div className={`space-y-10  ${collapsed ? "ml-16" : "ml-64 sm:ml-0"} transition-all duration-300`}>
      <StatsCards />
      <ChartsSection />
    </div>
  );
}

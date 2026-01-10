import ChartsSection from "@/components/admin/ChartsSection";
import { useDashboardCollapsedStore } from "@/stores/dashboardCollapsedStore";
export default function Analytics() {
  const {collapsed} = useDashboardCollapsedStore();
  return (
    <div className={`space-y-10  ${collapsed ? "ml-16" : "ml-64 sm:ml-0"} transition-all duration-300`}>
      <ChartsSection/>
    </div>
  )
  
}

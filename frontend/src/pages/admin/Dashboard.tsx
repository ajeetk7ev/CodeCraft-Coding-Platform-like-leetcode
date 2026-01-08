import StatsCards from "@/components/admin/StatsCards";
import ChartsSection from "@/components/admin/ChartsSection";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <StatsCards />
      <ChartsSection />
    </div>
  );
}

import DashboardLayout from "@/components/layout/dashboard-layout"
import { DashboardView } from "@/features/overview/components/dashboard-view"
import { IncidentsView } from "@/features/incidents/components/incidents-view"

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardView />
    </DashboardLayout>
  )
}

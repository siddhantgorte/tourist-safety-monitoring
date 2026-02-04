import DashboardLayout from "@/components/layout/dashboard-layout"
import { IncidentsView } from "@/features/incidents/components/incidents-view"

export default function IncidentsPage() {
    return (
        <DashboardLayout>
            <IncidentsView />
        </DashboardLayout>
    )
}

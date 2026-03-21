import DashboardLayout from "@/components/layout/dashboard-layout"
import { IncidentDetailView } from "@/features/incidents/components/incident-detail-view"

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <DashboardLayout>
            <IncidentDetailView id={id} />
        </DashboardLayout>
    )
}

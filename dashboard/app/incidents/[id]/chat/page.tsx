import DashboardLayout from "@/components/layout/dashboard-layout"
import { IncidentChatView } from "@/features/incidents/components/incident-chat-view";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <DashboardLayout>
            <IncidentChatView id={id} />
        </DashboardLayout>
    );
}

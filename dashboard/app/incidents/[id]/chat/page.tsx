import { IncidentChatView } from "../../../../features/incidents/components/incident-chat-view";

export default function ChatPage({ params }: { params: { id: string } }) {
    return <IncidentChatView id={params.id} />;
}

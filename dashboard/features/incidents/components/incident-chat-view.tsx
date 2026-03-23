"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useIncidentDetail, useIncidentMessages } from "../hooks/use-incidents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { io, Socket } from "socket.io-client";

// Hardcoded for demo parity with the rest of the dashboard
const adminUserId = '0282ddf2-e676-492d-a89c-89fd57ace2a9';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';

interface IncidentChatViewProps {
    id: string;
}

export function IncidentChatView({ id }: IncidentChatViewProps) {
    const router = useRouter();
    const { data: incident, isLoading: isIncidentLoading } = useIncidentDetail(id);
    const { data: messageHistory, isLoading: isMessagesLoading } = useIncidentMessages(id);
    
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const socketRef = useRef<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messageHistory) {
            setMessages(messageHistory);
        }
    }, [messageHistory]);

    useEffect(() => {
        if (!id) return;

        socketRef.current = io(BACKEND_URL, {
            auth: { userId: adminUserId, role: 'L2' } 
        });

        socketRef.current.on('connect', () => {
            socketRef.current?.emit('chat:join', id);
        });

        socketRef.current.on('chat:receive', (msg) => {
            setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        socketRef.current?.emit('chat:send', {
            incidentId: id,
            content: trimmed,
            senderRole: 'ADMIN',
            senderId: adminUserId
        });

        setInput("");
    };

    if (isIncidentLoading || isMessagesLoading) {
        return <div className="flex justify-center items-center h-screens p-12">Loading chat...</div>;
    }

    if (!incident) {
        return <div className="p-12 text-center text-destructive">Incident not found</div>;
    }

    return (
        <div className="p-6 h-[calc(100vh-80px)] max-w-4xl mx-auto flex flex-col">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Chat with Tourist</h1>
                    <p className="text-muted-foreground">Incident #{incident.id.slice(0, 8)} - {incident.type}</p>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden bg-card border-border shadow-sm">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                        const isAdmin = msg.senderRole === 'ADMIN' || msg.senderRole === 'SYSTEM'; // Treat system as admin side usually
                        return (
                            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-2xl ${isAdmin ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted border rounded-tl-sm'}`}>
                                    <p className="text-sm font-medium">{msg.content}</p>
                                    <span className={`text-[10px] block mt-1 ${isAdmin ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground py-10 text-sm">No messages yet. Say hello to establish contact!</div>
                    )}
                </div>
                
                <div className="p-4 bg-background border-t">
                    <form onSubmit={handleSend} className="flex flex-row gap-3 items-center">
                        <Input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message to the tourist..."
                            className="flex-1 rounded-full px-4"
                        />
                        <Button type="submit" disabled={!input.trim()} size="icon" className="rounded-full shrink-0">
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}

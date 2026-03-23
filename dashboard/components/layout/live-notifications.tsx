"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, AlertCircle, Shield, Info, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { io } from "socket.io-client"
import { useRouter } from "next/navigation"
import { useOverviewStats } from "@/features/overview/hooks/use-overview"

const BACKEND_URL = 'http://localhost:8000';
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"; // Clean ping sound

interface Notification {
  id: string;
  type: string;
  priority: string;
  message: string;
  timestamp: Date;
  entityId: string;
  read: boolean;
}

export function LiveNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const socketRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const { data: stats } = useOverviewStats();

  useEffect(() => {
    // Initialize Audio
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    
    // Initialize Socket
    socketRef.current = io(BACKEND_URL, {
        auth: {
            userId: '0282ddf2-e676-492d-a89c-89fd57ace2a9', // Mock ID
            role: 'L2',
            regionId: stats?.regionId || 'konkan_division_id' // Use real ID if available
        }
    });

    socketRef.current.on('incident:new', (data: any) => {
      console.log('🚨 Notification Received:', data);
      
      const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        type: data.payload.type,
        priority: data.payload.priority,
        message: `New ${data.payload.type} incident reported.`,
        timestamp: new Date(data.timestamp),
        entityId: data.entityId,
        read: false
      };

      setNotifications(prev => [newNotif, ...prev].slice(0, 10));
      setHasNew(true);
      
      // Play Sound
      audioRef.current?.play().catch(e => console.log('Audio play blocked:', e));
    });

    return () => {
      socketRef.current?.disconnect();
    }
  }, [stats?.regionId]);

  const handleOpen = () => {
    setHasNew(false);
  };

  const navigateToIncident = (id: string) => {
    router.push(`/incidents/${id}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-500';
      case 'WARNING': return 'text-orange-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {hasNew && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background animate-pulse"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 border-border">
        <DropdownMenuLabel className="p-4 flex items-center justify-between bg-muted/30">
          <span>Live Notifications</span>
          <Badge variant="outline" className="text-[10px]">{notifications.length} New</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs italic">No new incidents reported</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem 
                key={notif.id} 
                className="p-4 border-b border-border/50 focus:bg-accent/50 cursor-pointer flex flex-col items-start gap-1"
                onClick={() => navigateToIncident(notif.entityId)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 ${getPriorityColor(notif.priority)}`} />
                    <span className="font-bold text-xs uppercase tracking-tight">{notif.type}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm line-clamp-2 text-foreground/80">{notif.message}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-primary font-medium uppercase">
                  <ExternalLink size={10} />
                  <span>View Details</span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-2 bg-muted/10">
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={() => router.push('/incidents')}>
            View All Incidents
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

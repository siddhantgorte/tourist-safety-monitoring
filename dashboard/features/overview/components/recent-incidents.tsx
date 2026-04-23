"use client"

import { useRecentIncidentsOverview } from "../hooks/use-overview"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function RecentIncidents() {
  const router = useRouter();
  const { data: incidents, isLoading, error } = useRecentIncidentsOverview();

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-destructive/20 text-destructive border-destructive/50"
      case "warning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      default:
        return "bg-green-500/20 text-green-400 border-green-500/50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
      case "active":
        return "text-destructive"
      case "responding":
        return "text-yellow-400"
      case "resolved":
        return "text-green-400"
      default:
        return "text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border p-6 flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border p-6 flex flex-col justify-center items-center h-64 text-destructive">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Failed to load incidents</p>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Recent Incidents</h2>
        <button onClick={()=>{router.push("/incidents") }} className="text-accent text-sm font-medium hover:underline">View All</button>
      </div>

      <div className="space-y-3">
        {incidents?.map((incident: any) => (
          <div
            key={incident.id}
            className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors cursor-pointer border border-border/50"
            onClick={() => router.push(`/incidents/${incident.id}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{incident.type}</h3>
                  <Badge variant="outline" className={`text-xs ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{incident.locationMsg}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{incident.timeSinceReported} ago</span>
                  <span className={`text-xs font-medium ${getStatusColor(incident.status)}`}>{incident.status}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

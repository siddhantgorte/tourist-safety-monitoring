"use client"

import { Card } from "@/components/ui/card"
import { Activity, MapPin, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useZoneStatus } from "../hooks/use-overview"

export function StatusOverview() {
  const { data: zoneData, isLoading } = useZoneStatus();

  if (isLoading) {
    return (
      <Card className="bg-card border-border p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </Card>
    );
  }

  const iconMap: Record<string, any> = {
    "All Clear": CheckCircle2,
    "Under Watch": Activity,
    "Active Alert": AlertCircle,
    "Critical": MapPin,
  };

  const colorMap: Record<string, string> = {
    "All Clear": "text-green-400",
    "Under Watch": "text-blue-400",
    "Active Alert": "text-yellow-400",
    "Critical": "text-red-400",
  };

  const bgMap: Record<string, string> = {
    "All Clear": "bg-green-500/10",
    "Under Watch": "bg-blue-500/10",
    "Active Alert": "bg-yellow-500/10",
    "Critical": "bg-red-500/10",
  };

  const statuses = (zoneData || []).map((item: any) => ({
    label: item.label,
    value: item.value,
    icon: iconMap[item.label] || AlertCircle,
    color: colorMap[item.label] || "text-slate-400",
    bgColor: bgMap[item.label] || "bg-slate-500/10",
  }));


  return (
    <Card className="bg-card border-border p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Zone Status</h2>

      <div className="space-y-3">
        {statuses.map((status: any, idx: number) => {
          const Icon = status.icon
          return (
            <div key={idx} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${status.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${status.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{status.label}</p>
                  <p className="text-lg font-bold text-foreground">{status.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button className="w-full mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
        Generate Report
      </button>
    </Card>
  )
}

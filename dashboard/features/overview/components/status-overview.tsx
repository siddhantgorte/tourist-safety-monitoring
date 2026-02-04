"use client"

import { Card } from "@/components/ui/card"
import { Activity, MapPin, AlertCircle, CheckCircle2 } from "lucide-react"

export function StatusOverview() {
  const statuses = [
    {
      label: "All Clear",
      value: 8,
      icon: CheckCircle2,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Under Watch",
      value: 5,
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Active Alert",
      value: 2,
      icon: AlertCircle,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Critical",
      value: 1,
      icon: MapPin,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
  ]

  return (
    <Card className="bg-card border-border p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Zone Status</h2>

      <div className="space-y-3">
        {statuses.map((status, idx) => {
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

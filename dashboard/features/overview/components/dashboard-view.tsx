"use client"

import { useOverviewStats } from "../hooks/use-overview"
import { Card } from "@/components/ui/card"
import { MapPin, AlertTriangle, Users, TrendingUp, Loader2 } from "lucide-react"
import { RecentIncidents } from "./recent-incidents"
import { StatusOverview } from "./status-overview"

export function DashboardView() {
  const { data: statsData, isLoading, error } = useOverviewStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-destructive">
        Failed to load dashboard data. Please make sure the backend is running.
      </div>
    );
  }

  const stats = [
    {
      label: "Active Incidents",
      value: statsData?.activeIncidents?.count ?? 0,
      icon: AlertTriangle,
      color: "destructive",
      trend: statsData?.activeIncidents?.trend === 'up' ? `+${statsData?.activeIncidents?.delta} this hour` : 'Stable',
    },
    {
      label: "Officers Online",
      value: statsData?.officersOnline?.count ?? 0,
      icon: Users,
      color: "accent",
      trend: `+${statsData?.officersOnline?.delta} since morning`,
    },
    {
      label: "Tourists Monitored",
      value: statsData?.touristsMonitored?.count ?? 0,
      icon: MapPin,
      color: "primary",
      trend: `+${statsData?.touristsMonitored?.delta} today`,
    },
    {
      label: "Response Rate",
      value: `${statsData?.responseRate?.value}%`,
      icon: TrendingUp,
      color: "chart-3",
      trend: statsData?.responseRate?.label ?? "N/A",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Safety Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time monitoring & incident response</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="bg-card border-border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-accent mt-2">{stat.trend}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentIncidents />
        </div>
        <div>
          <StatusOverview />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useAnalytics } from "../hooks/use-analytics"
import { Card } from "@/components/ui/card"
import { BarChart3, TrendingUp, Calendar, Download, Loader2 } from "lucide-react"

export function AnalyticsView() {
  const { data: analyticsData, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpiItems = [
    { label: "Total Incidents", value: analyticsData?.kpis?.totalIncidents?.value ?? 0, change: `+${analyticsData?.kpis?.totalIncidents?.delta}%`, trend: analyticsData?.kpis?.totalIncidents?.trend },
    { label: "Resolved Rate", value: `${analyticsData?.kpis?.resolutionRate?.value}%`, change: `${analyticsData?.kpis?.resolutionRate?.delta}%`, trend: analyticsData?.kpis?.resolutionRate?.trend },
    { label: "Avg Response Time", value: analyticsData?.kpis?.avgResponseTime?.value ?? "N/A", change: `${analyticsData?.kpis?.avgResponseTime?.delta}`, trend: analyticsData?.kpis?.avgResponseTime?.trend },
    { label: "Tourist Safety Score", value: `${analyticsData?.kpis?.safetyScore?.value}/10`, change: `+${analyticsData?.kpis?.safetyScore?.delta}`, trend: analyticsData?.kpis?.safetyScore?.trend },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">Performance metrics and insights</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiItems.map((item, idx) => (
          <Card key={idx} className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                <p className="text-3xl font-bold text-foreground">{item.value}</p>
                <p className={`text-xs mt-2 ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change} vs last month
                </p>
              </div>
              <TrendingUp className={`w-6 h-6 ${item.trend === 'up' ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Incidents by Type</h2>
          <div className="h-64 flex items-center justify-center bg-secondary/50 rounded-lg border border-border/50">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Chart Component</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Response Time Trend</h2>
          <div className="h-64 flex items-center justify-center bg-secondary/50 rounded-lg border border-border/50">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Chart Component</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Date Range Selector */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Report Period</h2>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <select className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  )
}

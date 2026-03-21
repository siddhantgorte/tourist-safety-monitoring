"use client"

import { useAnalytics } from "../hooks/use-analytics"
import { Card } from "@/components/ui/card"
import { TrendingUp, Calendar, Download, Loader2, AlertCircle } from "lucide-react"
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

const CHART_COLORS = [
  '#00E5FF', // Vibrant Cyan
  '#7C4DFF', // Vibrant Purple
  '#FF5252', // Vibrant Red
  '#FFD740', // Vibrant Amber
  '#69F0AE', // Vibrant Green
];

const GRADIENT_COLORS = {
  start: 'hsl(var(--primary))',
  end: 'rgba(var(--primary-rgb), 0)'
};

export function AnalyticsView() {
  const { data: analyticsData, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-destructive flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        Failed to load analytics data.
      </div>
    );
  }

  const kpiItems = [
    { label: "Total Incidents", value: analyticsData?.kpis?.totalIncidents?.value ?? 0, change: `+${analyticsData?.kpis?.totalIncidents?.delta}%`, trend: analyticsData?.kpis?.totalIncidents?.trend },
    { label: "Resolved Rate", value: `${analyticsData?.kpis?.resolutionRate?.value}%`, change: `${analyticsData?.kpis?.resolutionRate?.delta}%`, trend: analyticsData?.kpis?.resolutionRate?.trend },
    { label: "Avg Response Time", value: analyticsData?.kpis?.avgResponseTime?.value ?? "N/A", change: `${analyticsData?.kpis?.avgResponseTime?.delta}`, trend: analyticsData?.kpis?.avgResponseTime?.trend },
    { label: "Tourist Safety Score", value: `${analyticsData?.kpis?.safetyScore?.value}/10`, change: `+${analyticsData?.kpis?.safetyScore?.delta}`, trend: analyticsData?.kpis?.safetyScore?.trend },
  ]

  const incidentsByTypeData = analyticsData?.charts?.incidentsByType || [];
  const weeklyTrendData = analyticsData?.charts?.weeklyTrend || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time performance metrics and regional safety trends</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiItems.map((item, idx) => (
          <Card key={idx} className="bg-card/50 backdrop-blur-sm border-border p-6 hover:border-primary/50 transition-colors group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{item.label}</p>
                <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{item.value}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-xs font-semibold ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change}
                  </span>
                  <span className="text-[10px] text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className={`p-2 rounded-lg ${item.trend === 'up' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <TrendingUp className={`w-5 h-5 ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border p-6 flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            Incidents by Type
          </h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incidentsByTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="type"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {incidentsByTypeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle" 
                  iconType="circle"
                  formatter={(value) => <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border p-6 flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
             <div className="w-1.5 h-6 bg-accent rounded-full" />
            Incident Trend (Weekly)
          </h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#00E5FF" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Date Range Selector */}
      <Card className="bg-card/50 backdrop-blur-sm border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Report Period</h2>
              <p className="text-xs text-muted-foreground">Adjust the date range for all metrics</p>
            </div>
          </div>
          <div className="relative group">
            <select className="pl-4 pr-10 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none transition-all hover:border-primary/50">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
              <TrendingUp className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

"use client"

import { Card } from "@/components/ui/card"
import { MapPin, Shield, Users, Layers, Search, Loader2, AlertCircle, Settings } from "lucide-react"
import { useOverviewStats } from "@/features/overview/hooks/use-overview"
import { useGeofences, useUpdateGeofence } from "@/features/geofences/hooks/use-geofences"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function MapView() {
  const { data: stats, isLoading: statsLoading } = useOverviewStats();
  const { data: geofences, isLoading: gfLoading } = useGeofences();
  const updateGf = useUpdateGeofence();

  const handleToggle = async (id: string, active: boolean) => {
    await updateGf.mutateAsync({ id, active });
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  }

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'text-red-400';
      case 'HIGH': return 'text-orange-400';
      case 'MEDIUM': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  }

  return (
    <div className="flex h-full flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Tracking</h1>
          <p className="text-muted-foreground mt-1">Real-time geospatial monitoring of tourists and assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Layers className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          <Button className="gap-2">
            <MapPin className="w-4 h-4" />
            Define Fence
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Sidebar Controls */}
        <div className="space-y-4 overflow-y-auto">
          <Card className="p-4 bg-card border-border">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Layer Filters
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-2 rounded hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm">Tourists</span>
                </div>
                <Badge variant="secondary">{stats?.touristsMonitored?.count ?? 0}</Badge>
              </label>
              <label className="flex items-center justify-between p-2 rounded hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-sm">Officers</span>
                </div>
                <Badge variant="secondary">{stats?.officersOnline?.count ?? 0}</Badge>
              </label>
              <label className="flex items-center justify-between p-2 rounded hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm">Incidents</span>
                </div>
                <Badge variant="destructive">Live</Badge>
              </label>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <h3 className="font-bold mb-4">Active Geo-fences</h3>
            {gfLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {geofences?.map((gf: any) => (
                  <div key={gf.id} className="p-3 rounded-lg border border-border bg-secondary/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold truncate max-w-[120px]">{gf.name}</span>
                      <Switch checked={gf.active} onCheckedChange={(val) => handleToggle(gf.id, val)} />
                    </div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground uppercase">{gf.type}</span>
                      <span className={getRiskText(gf.riskLevel)}>{gf.riskLevel} RISK</span>
                    </div>
                    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${getRiskColor(gf.riskLevel)}`} style={{ width: gf.riskLevel === 'CRITICAL' ? '100%' : gf.riskLevel === 'HIGH' ? '75%' : gf.riskLevel === 'MEDIUM' ? '50%' : '25%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Map Placeholder */}
        <Card className="lg:col-span-3 bg-secondary/20 border-border relative overflow-hidden flex items-center justify-center min-h-[500px]">
          {/* Background elements to simulate a map */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
          />

          <div className="text-center z-10 p-8">
            <div className="relative mb-6">
              <MapPin className="w-16 h-16 text-primary mx-auto animate-bounce" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full animate-ping" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Mission Control Map</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Geospatial engine ready. Displaying {geofences?.length ?? 0} active fences and {stats?.touristsMonitored?.count ?? 0} tourist nodes.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {geofences?.filter((g: any) => g.active).map((g: any) => (
                <div key={g.id} className="p-2 rounded border border-primary/20 bg-primary/5 text-[10px] flex items-center gap-2">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="truncate">{g.name}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-background/80 backdrop-blur rounded-xl border border-border inline-block text-left text-sm max-w-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-semibold text-xs">SOC CONNECTED - GOA REGION</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Lat: 15.4989° N, Lng: 73.8278° E • Elevation: 14m • Accuracy: 3m
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

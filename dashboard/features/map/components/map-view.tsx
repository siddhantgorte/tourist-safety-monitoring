"use client"

import { Card } from "@/components/ui/card"
import { MapPin, Shield, Users, Layers, Search, Loader2, AlertCircle, Settings } from "lucide-react"
import { useOverviewStats } from "@/features/overview/hooks/use-overview"
import { useGeofences, useUpdateGeofence, useCreateGeofence, useDeleteGeofence } from "@/features/geofences/hooks/use-geofences"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Edit2 } from "lucide-react"

import { useIncidents } from "@/features/incidents/hooks/use-incidents"
import { useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full min-h-[500px] bg-secondary/10">
      <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
    </div>
  )
})

const BACKEND_URL = 'http://localhost:8000';

export function MapView() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const touristIdParam = searchParams.get('touristId');
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const labelParam = searchParams.get('label');

  const { data: stats, isLoading: statsLoading } = useOverviewStats();
  const { data: incidentsData, isLoading: incLoading } = useIncidents();
  const { data: geofences, isLoading: gfLoading } = useGeofences();
  const updateGf = useUpdateGeofence();
  const createGf = useCreateGeofence();
  const deleteGf = useDeleteGeofence();

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [tempFenceCoords, setTempFenceCoords] = useState<[number, number][]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGf, setEditingGf] = useState<any>(null);

  const [layers, setLayers] = useState({
    tourists: true,
    officers: true,
    incidents: true
  });

  const [liveTourists, setLiveTourists] = useState<any[]>([]);
  const [liveIncidents, setLiveIncidents] = useState<any[]>([]);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (statsLoading) return;

    // Initial data from stats/queries
    if (stats?.liveTourists) setLiveTourists(stats.liveTourists);
    if (incidentsData) setLiveIncidents(incidentsData);

    // Initialize Socket with Region Awareness
    socketRef.current = io(BACKEND_URL, {
      auth: {
        userId: '0282ddf2-e676-492d-a89c-89fd57ace2a9',
        role: 'L2',
        regionId: stats?.regionId
      }
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Dashboard SOC Connected (Region:', stats?.regionName, ')');
    });

    socketRef.current.on('live:tourist_update', (data: any) => {
      console.log('📍 Real-time Location Received:', data);
      setLiveTourists(prev => {
        const index = prev.findIndex(t => t.id === data.id);
        const updatedTourist = { ...data, lastUpdate: new Date() };
        if (index > -1) {
          const newList = [...prev];
          newList[index] = updatedTourist;
          return newList;
        } else {
          return [...prev, updatedTourist];
        }
      });
    });

    socketRef.current.on('incident:new', (data: any) => {
      console.log('🚨 New Incident Reported:', data);
      // Construct a marker-compatible object from the socket payload
      const newInc = {
        id: data.entityId,
        type: data.payload.type,
        severity: data.payload.priority,
        latitude: data.payload.location.lat,
        longitude: data.payload.location.lng,
        createdAt: data.timestamp,
        description: 'New incoming report...'
      };
      
      setLiveIncidents(prev => [newInc, ...prev]);
      // Refetch for full details
      queryClient.invalidateQueries({ queryKey: ['incidents-list'] });
    });

    return () => {
      socketRef.current?.disconnect();
    }
  }, [stats?.liveTourists, incidentsData]);

  const handleToggle = async (id: string, active: boolean) => {
    await updateGf.mutateAsync({ id, active });
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to completely erase this Geofence?")) {
        await deleteGf.mutateAsync(id);
    }
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateGf.mutateAsync({
      id: editingGf.id,
      name: formData.get('name') as string,
      type: formData.get('type') as any,
      riskLevel: formData.get('riskLevel') as any,
    });
    setIsEditModalOpen(false);
    setEditingGf(null);
  }

  const handleCreateGeofence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createGf.mutateAsync({
      name: formData.get('name') as string,
      type: formData.get('type') as any,
      riskLevel: formData.get('riskLevel') as any,
      active: true,
      coordinates: tempFenceCoords.map(c => ({ lat: c[0], lng: c[1] }))
    });
    setIsModalOpen(false);
    setIsDrawingMode(false);
    setTempFenceCoords([]);
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
          <Button 
            className="gap-2" 
            variant={isDrawingMode ? "destructive" : "default"}
            onClick={() => {
              setIsDrawingMode(!isDrawingMode);
              setTempFenceCoords([]);
            }}
          >
            <MapPin className="w-4 h-4" />
            {isDrawingMode ? 'Cancel Drawing' : 'Define Fence'}
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
              <div className="flex items-center justify-between p-2 rounded hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm">Tourists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{liveTourists.length}</Badge>
                  <Switch checked={layers.tourists} onCheckedChange={(val) => setLayers((prev: any) => ({ ...prev, tourists: val }))} />
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-sm">Officers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{stats?.officersOnline?.count ?? 0}</Badge>
                  <Switch checked={layers.officers} onCheckedChange={(val) => setLayers((prev: any) => ({ ...prev, officers: val }))} />
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm">Incidents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{liveIncidents.length}</Badge>
                  <Switch checked={layers.incidents} onCheckedChange={(val) => setLayers((prev: any) => ({ ...prev, incidents: val }))} />
                </div>
              </div>
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
                  <div key={gf.id} className="p-3 rounded-lg border border-border bg-secondary/10 group relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold truncate max-w-[120px]" title={gf.name}>{gf.name}</span>
                      <div className="flex items-center gap-1 bg-background/50 rounded-md p-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100" onClick={() => { setEditingGf(gf); setIsEditModalOpen(true); }}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100" onClick={() => handleDelete(gf.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Switch checked={gf.active} onCheckedChange={(val) => handleToggle(gf.id, val)} className="ml-1 data-[state=checked]:bg-primary" />
                      </div>
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

        {/* Real Leaflet Map */}
        <div className="lg:col-span-3 min-h-[600px] relative z-0 rounded-xl overflow-hidden border border-border">
          <MapComponent 
            regionGeometry={stats?.regionGeometry}
            liveTourists={liveTourists}
            incidents={liveIncidents}
            focusedTouristId={touristIdParam}
            focusCoords={latParam && lngParam ? { lat: parseFloat(latParam), lng: parseFloat(lngParam), label: labelParam || 'Focused Location' } : null}
            layers={layers}
            isDrawingMode={isDrawingMode}
            tempFenceCoords={tempFenceCoords}
            activeGeofences={geofences}
            onMapClick={(coords) => setTempFenceCoords(prev => [...prev, coords])}
          />
          
          {/* Overlay Status */}
          <div className="absolute bottom-4 left-4 z-[1000] p-3 bg-background/80 backdrop-blur rounded-lg border border-border shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-semibold text-[10px] uppercase">SOC CONNECTED - {stats?.regionName || 'GLOBAL'}</span>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Real-time synchronization active • {liveTourists.length} tracked assets
            </p>
          </div>

          {/* Map Legend */}
          <div className="absolute top-4 right-4 z-[1000] p-3 bg-background/90 backdrop-blur rounded-lg border border-border shadow-xl space-y-3 min-w-[160px]">
            <div>
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Map Markers</h4>
              <div className="flex items-center gap-2 mb-1.5">
                <img src="https://cdn-icons-png.flaticon.com/512/854/854866.png" className="w-4 h-4 opacity-80" alt="tourist" />
                <span className="text-xs font-medium">Live Tourist</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-[0_0_5px_rgba(239,68,68,0.5)] ml-0.5" />
                <span className="text-xs font-medium ml-0.5">Active Incident</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Geofence Risk</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-red-500/20 border-2 border-red-500" />
                  <span className="text-[10px] font-medium tracking-wide">CRITICAL RISK</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-orange-500/20 border-2 border-orange-500" />
                  <span className="text-[10px] font-medium tracking-wide">HIGH RISK</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-yellow-500/20 border-2 border-yellow-500" />
                  <span className="text-[10px] font-medium tracking-wide">MEDIUM RISK</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-green-500/20 border-2 border-green-500" />
                  <span className="text-[10px] font-medium tracking-wide">LOW / SAFE ZONE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Draw Mode Action Bar */}
          {isDrawingMode && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] p-3 bg-background/90 backdrop-blur rounded-full border border-primary shadow-xl flex items-center gap-4 animate-in slide-in-from-top-4">
                 <p className="text-sm font-medium px-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Click map to draw boundaries ({tempFenceCoords.length}/3+ points)
                 </p>
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => setTempFenceCoords(prev => prev.slice(0, -1))} disabled={tempFenceCoords.length === 0}>Undo Point</Button>
                    <Button variant="default" size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700" onClick={() => setIsModalOpen(true)} disabled={tempFenceCoords.length < 3}>Finish Shape</Button>
                 </div>
             </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Save New Geofence</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGeofence} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Geofence Name</Label>
                    <Input id="name" name="name" required placeholder="e.g. North Forest Reserve" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">Zone Type</Label>
                    <select id="type" name="type" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="MONITORED">MONITORED (Track Activity)</option>
                        <option value="SAFE">SAFE (Safe Zone Bubbles)</option>
                        <option value="RESTRICTED">RESTRICTED (No Entry Permitted)</option>
                        <option value="DANGER">DANGER (High Threat Area)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="riskLevel">Risk Level Designation</Label>
                    <select id="riskLevel" name="riskLevel" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="LOW">LOW RISK</option>
                        <option value="MEDIUM">MEDIUM RISK</option>
                        <option value="HIGH">HIGH RISK</option>
                        <option value="CRITICAL">CRITICAL RISK</option>
                    </select>
                </div>
                <DialogFooter className="mt-6">
                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Deploy Geofence</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Update Geofence Protocol</DialogTitle>
            </DialogHeader>
            {editingGf && (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-name">Geofence Name</Label>
                    <Input id="edit-name" name="name" required defaultValue={editingGf.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-type">Zone Type</Label>
                    <select id="edit-type" name="type" required defaultValue={editingGf.type} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="MONITORED">MONITORED (Track Activity)</option>
                        <option value="SAFE">SAFE (Safe Zone Bubbles)</option>
                        <option value="RESTRICTED">RESTRICTED (No Entry Permitted)</option>
                        <option value="DANGER">DANGER (High Threat Area)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-riskLevel">Risk Level Designation</Label>
                    <select id="edit-riskLevel" name="riskLevel" required defaultValue={editingGf.riskLevel} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="LOW">LOW RISK</option>
                        <option value="MEDIUM">MEDIUM RISK</option>
                        <option value="HIGH">HIGH RISK</option>
                        <option value="CRITICAL">CRITICAL RISK</option>
                    </select>
                </div>
                <DialogFooter className="mt-6">
                    <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Update Protocols</Button>
                </DialogFooter>
            </form>
            )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useIncidents } from "../hooks/use-incidents"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, MapPin, Clock, ChevronRight, Filter } from "lucide-react"
import { useRouter } from "next/navigation"

export function IncidentsView() {
    const router = useRouter();
    const { data: incidents, isLoading, error } = useIncidents();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-destructive flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Failed to load incidents.
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Incident Management</h1>
                    <p className="text-muted-foreground mt-1">Monitor and respond to safety events in your region</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                    <Button>+ Manual Report</Button>
                </div>
            </div>

            <Card className="border-border bg-card/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="p-4 font-semibold text-sm">Type</th>
                                <th className="p-4 font-semibold text-sm">Severity</th>
                                <th className="p-4 font-semibold text-sm">Status</th>
                                <th className="p-4 font-semibold text-sm">Region</th>
                                <th className="p-4 font-semibold text-sm">Reported At</th>
                                <th className="p-4 font-semibold text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {incidents?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                                        No incidents found in your region.
                                    </td>
                                </tr>
                            ) : (
                                incidents?.map((incident: any) => (
                                    <tr 
                                        key={incident.id} 
                                        className="hover:bg-muted/50 transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/incidents/${incident.id}`)}
                                    >
                                        <td className="p-4">
                                            <div className="font-medium">{incident.type}</div>
                                            <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{incident.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={incident.severity === 'CRITICAL' ? 'destructive' : incident.severity === 'WARNING' ? 'secondary' : 'outline'}>
                                                {incident.severity}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <Badge className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30">
                                                {incident.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <MapPin className="w-3.5 h-3.5 text-accent" />
                                                {incident.region?.name || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(incident.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                                View
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

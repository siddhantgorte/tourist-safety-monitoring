"use client"

import { useAtom } from "jotai"
import { useIncidents, useUpdateIncidentStatus, useUpdateIncident, useAssignOfficers, useIncidentDetail } from "../hooks/use-incidents"
import { useUsers } from "../../users/hooks/use-users"
import { selectedIncidentState, isEditModeState } from "@/lib/atoms/incident"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, MapPin, Clock, Edit2, Users, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

export function IncidentsView() {
    const [selectedIncidentSnippet, setSelectedIncidentSnippet] = useAtom(selectedIncidentState);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>([]);

    const { data: incidents, isLoading, error } = useIncidents();
    const { data: users } = useUsers();

    // Fetch full detail when an incident snippet is selected
    const { data: selectedIncidentDetail, isLoading: isLoadingDetail } = useIncidentDetail(selectedIncidentSnippet?.id);
    const selectedIncident = selectedIncidentDetail || selectedIncidentSnippet;

    const updateStatusMutation = useUpdateIncidentStatus();
    const updateIncidentMutation = useUpdateIncident();
    const assignOfficersMutation = useAssignOfficers();

    const handleSelectIncident = (incident: any) => {
        setSelectedIncidentSnippet(incident);
    };

    const handleUpdateDetails = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await updateIncidentMutation.mutateAsync({
            id: selectedIncident.id,
            description: formData.get('description'),
            severity: formData.get('severity'),
            type: formData.get('type'),
        });
        setIsEditModalOpen(false);
    };

    const handleAssign = async () => {
        await assignOfficersMutation.mutateAsync({
            id: selectedIncident.id,
            officerIds: selectedOfficerIds,
        });
        setIsAssignModalOpen(false);
        setSelectedOfficerIds([]);
    };

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

    const officers = users || [];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Incident Management</h1>
                    <p className="text-muted-foreground mt-1">Monitor and respond to safety events</p>
                </div>
                <Button>+ Manual Report</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* List Container */}
                <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    {incidents?.map((incident: any) => (
                        <Card
                            key={incident.id}
                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${incident.severity === 'CRITICAL' ? 'border-l-red-500' :
                                    incident.severity === 'WARNING' ? 'border-l-orange-500' : 'border-l-primary'
                                } ${selectedIncident?.id === incident.id ? 'border-primary ring-1 ring-primary' : ''}`}
                            onClick={() => handleSelectIncident(incident)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-semibold text-foreground">{incident.type}</div>
                                <Badge variant={incident.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                                    {incident.severity}
                                </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
                                <MapPin className="w-3 h-3 text-accent" />
                                {incident.zoneId || 'Unknown Zone'}
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span suppressHydrationWarning>
                                        {new Date(incident.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                <Badge variant="outline" className="text-[10px] py-0">{incident.status}</Badge>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Detail View */}
                <div className="md:col-span-1 lg:col-span-2">
                    {selectedIncident ? (
                        <Card className="p-6 h-full border-border bg-card relative">
                            {isLoadingDetail && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold">{selectedIncident.type}</h2>
                                        <Badge variant={selectedIncident.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                                            {selectedIncident.severity}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">ID: {selectedIncident.id} • Reported: {new Date(selectedIncident.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Update Incident Details</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleUpdateDetails} className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="type">Incident Type</Label>
                                                    <Input id="type" name="type" defaultValue={selectedIncident.type} required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="severity">Severity Level</Label>
                                                    <select
                                                        id="severity"
                                                        name="severity"
                                                        defaultValue={selectedIncident.severity}
                                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    >
                                                        <option value="INFO">INFO</option>
                                                        <option value="WARNING">WARNING</option>
                                                        <option value="CRITICAL">CRITICAL</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="description">Description</Label>
                                                    <Textarea id="description" name="description" defaultValue={selectedIncident.description} required />
                                                </div>
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                                                    <Button type="submit">Save Changes</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="gap-2">
                                                <Users className="w-4 h-4" />
                                                Assign
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Assign Officers</DialogTitle>
                                            </DialogHeader>
                                            <div className="py-4 space-y-4">
                                                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                                    {officers.map((officer: any) => (
                                                        <div key={officer.id} className="flex items-center space-x-2 p-2 rounded hover:bg-secondary/50 transition-colors">
                                                            <Checkbox
                                                                id={`off-${officer.id}`}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) setSelectedOfficerIds(prev => [...prev, officer.id]);
                                                                    else setSelectedOfficerIds(prev => prev.filter(id => id !== officer.id));
                                                                }}
                                                            />
                                                            <div className="flex-1">
                                                                <Label htmlFor={`off-${officer.id}`} className="font-medium cursor-pointer">{officer.name}</Label>
                                                                <p className="text-xs text-muted-foreground">{officer.role} • {officer.zone}</p>
                                                            </div>
                                                            <Badge variant="outline" className={officer.status === 'Online' ? 'bg-green-500/10 text-green-400' : 'text-muted-foreground'}>
                                                                {officer.status}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                                                <Button onClick={handleAssign}>Confirm Assignment ({selectedOfficerIds.length})</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-accent" />
                                            Overview
                                        </h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground">{selectedIncident.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-secondary/20 rounded-lg border border-border">
                                            <div className="text-[10px] uppercase text-muted-foreground mb-1">Status</div>
                                            <div className="text-sm font-bold text-accent">{selectedIncident.status}</div>
                                        </div>
                                        <div className="p-3 bg-secondary/20 rounded-lg border border-border">
                                            <div className="text-[10px] uppercase text-muted-foreground mb-1">Zone</div>
                                            <div className="text-sm font-bold text-accent">{selectedIncident.zoneId || 'Main Zone'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-accent" />
                                        Resolution Timeline
                                    </h3>
                                    <div className="relative pl-6 space-y-6 border-l border-border">
                                        {selectedIncident.timeline?.map((step: any, i: number) => (
                                            <div key={i} className="relative">
                                                <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-primary border-2 border-background z-10" />
                                                <div>
                                                    <p className="text-xs font-bold">{step.event}</p>
                                                    <p className="text-[10px] text-muted-foreground">{new Date(step.time).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 border-t border-border pt-6">
                                <Button
                                    className="flex-1"
                                    onClick={() => updateStatusMutation.mutate({ id: selectedIncident.id, status: 'RESOLVED' })}
                                    variant={selectedIncident.status === 'RESOLVED' ? 'outline' : 'default'}
                                    disabled={selectedIncident.status === 'RESOLVED'}
                                >
                                    {selectedIncident.status === 'RESOLVED' ? 'Incident Resolved' : 'Mark as Resolved'}
                                </Button>
                                <Button variant="outline" onClick={() => setSelectedIncidentSnippet(null)}>Deselect</Button>
                            </div>
                        </Card>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-border rounded-xl text-muted-foreground p-12 bg-secondary/5">
                            <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No Incident Selected</p>
                            <p className="text-sm">Select an incident from the feed to view and manage details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

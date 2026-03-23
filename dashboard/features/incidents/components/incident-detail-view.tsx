"use client"

import { useIncidentDetail, useUpdateIncidentStatus, useUpdateIncident, useAssignOfficers } from "../hooks/use-incidents"
import { useUsers } from "../../users/hooks/use-users"
import { useAuth } from "@/components/providers/auth-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, MapPin, Clock, Edit2, Users, AlertTriangle, ArrowLeft, MessageSquare } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

interface IncidentDetailViewProps {
    id: string;
}

export function IncidentDetailView({ id }: IncidentDetailViewProps) {
    const router = useRouter();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>([]);

    const { data: incident, isLoading, error } = useIncidentDetail(id);
    const { data: users } = useUsers();
    const { user: currentUser } = useAuth();

    const updateStatusMutation = useUpdateIncidentStatus();
    const updateIncidentMutation = useUpdateIncident();
    const assignOfficersMutation = useAssignOfficers();

    const handleUpdateDetails = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!incident) return;
        const formData = new FormData(e.currentTarget);
        await updateIncidentMutation.mutateAsync({
            id: incident.id,
            description: formData.get('description'),
            severity: formData.get('severity'),
            type: formData.get('type'),
        });
        setIsEditModalOpen(false);
    };

    const handleAssign = async () => {
        if (!incident) return;
        await assignOfficersMutation.mutateAsync({
            id: incident.id,
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

    if (error || !incident) {
        return (
            <div className="p-6 text-destructive flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Failed to load incident details.
                </div>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const ROLE_LEVELS: Record<string, number> = {
        'L1': 1,
        'L2': 2,
        'L3': 3,
        'L4': 4
    };

    const officers = (users || []).filter((u: any) => {
        if (!currentUser) return false;
        if (u.id === currentUser.id) return false;

        // Exclude officers who are already assigned to this incident
        if (incident?.assignments?.some((a: any) => a.userId === u.id)) return false;

        const currentRank = ROLE_LEVELS[currentUser.roleName] || 0;
        const targetRank = ROLE_LEVELS[u.roleName] || 0;

        return targetRank < currentRank;
    });

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Incident Details</h1>
                    <p className="text-muted-foreground">Manage and resolve the reported event</p>
                </div>
            </div>

            <Card className="p-6 h-full border-border bg-card relative">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold">{incident.type}</h2>
                            <Badge variant={incident.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                                {incident.severity}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">ID: {incident.id} • Reported: {new Date(incident.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="default" size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push(`/incidents/${incident.id}/chat`)}>
                            <MessageSquare className="w-4 h-4" />
                            Chat with Tourist
                        </Button>
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
                                        <Input id="type" name="type" defaultValue={incident.type} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="severity">Severity Level</Label>
                                        <select
                                            id="severity"
                                            name="severity"
                                            defaultValue={incident.severity}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="INFO">INFO</option>
                                            <option value="WARNING">WARNING</option>
                                            <option value="CRITICAL">CRITICAL</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" name="description" defaultValue={incident.description} required />
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
                                                    <Label htmlFor={`off-${officer.id}`} className="font-medium cursor-pointer">{officer.fullName || officer.username}</Label>
                                                    <p className="text-xs text-muted-foreground">{officer.role?.name || 'Officer'} • {officer.region?.name || 'Unknown'}</p>
                                                </div>
                                                <Badge variant="outline" className={officer.isOnline ? 'bg-green-500/10 text-green-400' : 'text-muted-foreground'}>
                                                    {officer.isOnline ? 'Online' : 'Offline'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAssignModalOpen(false)} disabled={assignOfficersMutation.isPending}>Cancel</Button>
                                    <Button 
                                        onClick={handleAssign} 
                                        disabled={assignOfficersMutation.isPending || selectedOfficerIds.length === 0}
                                    >
                                        {assignOfficersMutation.isPending ? 'Assigning...' : `Confirm Assignment (${selectedOfficerIds.length})`}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-bold flex items-center gap-2 text-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                Overview
                            </h3>
                            <p className="text-base leading-relaxed text-muted-foreground bg-secondary/10 p-4 rounded-lg border border-border/50">{incident.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-secondary/20 rounded-lg border border-border">
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Status</div>
                                <div className="text-base font-bold text-primary">{incident.status}</div>
                            </div>
                            <div className="p-4 bg-secondary/20 rounded-lg border border-border">
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Region</div>
                                <div className="text-base font-bold text-primary">{incident.region?.name || 'Main Region'}</div>
                            </div>
                        </div>
                        {incident.tourist && (
                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary" />
                                        Tourist Information
                                    </h4>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 text-[10px] gap-1"
                                        onClick={() => incident.tourist && router.push(`/map?touristId=${incident.tourist.id}&lat=${incident.latitude}&lng=${incident.longitude}&label=${encodeURIComponent(incident.tourist.fullName ?? '')}`)}
                                    >
                                        <MapPin size={12} />
                                        Show on Map
                                    </Button>
                                </div>
                                <p className="text-sm font-medium">{incident.tourist.fullName}</p>
                                <p className="text-xs text-muted-foreground">{incident.tourist.phoneNumber} • {incident.tourist.nationality}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold flex items-center gap-2 text-lg">
                            <Clock className="w-5 h-5 text-primary" />
                            Activity Timeline
                        </h3>
                        <div className="relative pl-6 space-y-6 border-l-2 border-primary/20">
                            {incident.actions && incident.actions.length > 0 ? (
                                incident.actions.map((action: any, i: number) => (
                                    <div key={action.id} className="relative">
                                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background z-10" />
                                        <div className="bg-secondary/10 p-3 rounded-md border border-border/50">
                                            <p className="text-sm font-bold">{action.details || action.actionType}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-[10px] text-muted-foreground">{new Date(action.timestamp).toLocaleString()}</p>
                                                {action.user && <p className="text-[10px] italic">by {action.user.fullName || action.user.username}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No activities logged yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 border-t border-border pt-6">
                    <Button
                        className="flex-1"
                        onClick={() => updateStatusMutation.mutate({ id: incident.id, status: 'RESOLVED' })}
                        variant={incident.status === 'RESOLVED' ? 'outline' : 'default'}
                        disabled={incident.status === 'RESOLVED'}
                    >
                        {incident.status === 'RESOLVED' ? 'Incident Resolved' : 'Mark as Resolved'}
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={() => updateStatusMutation.mutate({ id: incident.id, status: 'RESPONDING' })}
                        variant={incident.status === 'RESPONDING' ? 'outline' : 'secondary'}
                        disabled={incident.status === 'RESPONDING' || incident.status === 'RESOLVED'}
                    >
                        Dispatch Response
                    </Button>
                </div>
            </Card>
        </div>
    )
}

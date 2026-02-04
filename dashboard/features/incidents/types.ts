export type IncidentSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type IncidentStatus = 'OPEN' | 'RESPONDING' | 'RESOLVED';

export interface Incident {
    id: string;
    type: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    description: string;
    zoneId?: string;
    locationMsg?: string;
    timeSinceReported?: string;
    createdAt: string;
    updatedAt: string;
}

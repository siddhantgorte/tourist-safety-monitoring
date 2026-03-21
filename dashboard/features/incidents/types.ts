export type IncidentSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type IncidentStatus = 'OPEN' | 'RESPONDING' | 'RESOLVED';

export interface IncidentAction {
    id: string;
    actionType: string;
    details?: string;
    timestamp: string;
    user?: {
        id: string;
        username: string;
        fullName?: string;
    };
}

export interface Incident {
    id: string;
    type: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    description: string;
    regionId?: string;
    region?: {
        id: string;
        name: string;
    };
    touristId?: string;
    tourist?: {
        id: string;
        fullName?: string;
        phoneNumber?: string;
        nationality?: string;
    };
    tripId?: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    updatedAt: string;
    actions?: IncidentAction[];
    evidence?: any[];
    assignments?: any[];
    _count?: {
        assignments: number;
    };
}

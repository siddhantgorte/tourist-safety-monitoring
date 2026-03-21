import { Router, Request, Response } from 'express';
import { IncidentService } from './incident.service';

const router = Router();
const incidentService = new IncidentService();

// Helper to get userId from header or fallback
const getUserId = (req: Request) => {
    return (req.headers['x-user-id'] as string) || (req.query.userId as string) || '0282ddf2-e676-492d-a89c-89fd57ace2a9';
};

// GET /api/incidents
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const data = await incidentService.getAllIncidents(userId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch incidents' });
    }
});

// GET /api/incidents/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const data = await incidentService.getIncidentById(req.params.id as string);
        if (!data) return res.status(404).json({ success: false, message: 'Incident not found' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch incident' });
    }
});

// POST /api/incidents
router.post('/', async (req: Request, res: Response) => {
    try {
        const data = await incidentService.createIncident(req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create incident' });
    }
});

// PATCH /api/incidents/:id
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const data = await incidentService.updateIncidentStatus(req.params.id as string, status);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update incident status' });
    }
});

// PUT /api/incidents/:id (Update details)
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const data = await incidentService.updateIncident(id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update incident' });
    }
});

// POST /api/incidents/:id/assign
router.post('/:id/assign', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { officerIds } = req.body;
        const data = await incidentService.assignOfficers(id, officerIds);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to assign officers' });
    }
});

export default router;

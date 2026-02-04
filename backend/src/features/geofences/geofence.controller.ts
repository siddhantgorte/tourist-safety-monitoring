import { Router, Request, Response } from 'express';
import { GeofenceService } from './geofence.service';

const router = Router();
const geofenceService = new GeofenceService();

// GET /api/geofences
router.get('/', async (req: Request, res: Response) => {
    try {
        const data = await geofenceService.getAllGeofences();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch geofences' });
    }
});

// POST /api/geofences
router.post('/', async (req: Request, res: Response) => {
    try {
        const data = await geofenceService.createGeofence(req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create geofence' });
    }
});

// PATCH /api/geofences/:id
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const data = await geofenceService.updateGeofence(id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update geofence' });
    }
});

// DELETE /api/geofences/:id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await geofenceService.deleteGeofence(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete geofence' });
    }
});

// POST /api/geofences/check (Simulate location check)
router.post('/check', async (req: Request, res: Response) => {
    try {
        const { touristId, location } = req.body;
        const result = await geofenceService.checkLocation(touristId, location);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to check geofence location' });
    }
});

export default router;

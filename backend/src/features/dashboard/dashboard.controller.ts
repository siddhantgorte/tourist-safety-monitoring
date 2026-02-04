import { Router, Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

const router = Router();
const dashboardService = new DashboardService();

// GET /api/dashboard/overview
router.get('/overview', async (req: Request, res: Response) => {
    try {
        // In a real app, we extract role from req.user
        const role = 'L2';
        const stats = await dashboardService.getOverviewStats(role);
        res.json({
            success: true,
            timestamp: new Date(),
            data: stats
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
});

// GET /api/dashboard/incidents
router.get('/incidents', async (req: Request, res: Response) => {
    try {
        const data = await dashboardService.getRecentIncidents();
        res.json({
            success: true,
            timestamp: new Date(),
            data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch incidents' });
    }
});

// GET /api/dashboard/zones
router.get('/zones', async (req: Request, res: Response) => {
    try {
        const data = await dashboardService.getZoneStatus();
        res.json({
            success: true,
            timestamp: new Date(),
            data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch zone status' });
    }
});

export default router;

import { Router, Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

const router = Router();
const dashboardService = new DashboardService();

// Helper to get userId from header or fallback
const getUserId = (req: Request) => {
    return (req.headers['x-user-id'] as string) || '0282ddf2-e676-492d-a89c-89fd57ace2a9';
};

// GET /api/dashboard/overview
router.get('/overview', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const stats = await dashboardService.getOverviewStats(userId);
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
        const userId = getUserId(req);
        const data = await dashboardService.getRecentIncidents(userId);
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
        const userId = getUserId(req);
        const data = await dashboardService.getZoneStatus(userId);
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

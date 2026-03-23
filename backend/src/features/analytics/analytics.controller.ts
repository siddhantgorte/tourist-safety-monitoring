import { Router, Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';

const router = Router();
const analyticsService = new AnalyticsService();

// GET /api/analytics
router.get('/', async (req: Request, res: Response) => {
    try {
        const data = await analyticsService.getAnalyticsData();
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Failed to resolve real analytics:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
});

export default router;

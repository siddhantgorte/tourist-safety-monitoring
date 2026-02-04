import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/analytics
router.get('/', async (req: Request, res: Response) => {
    try {
        // Mock analytics data matching Section 7 of spec
        res.json({
            success: true,
            data: {
                kpis: {
                    totalIncidents: { value: 145, delta: 12, trend: 'up' },
                    resolutionRate: { value: 88.5, delta: -2, trend: 'down' },
                    avgResponseTime: { value: '14m', delta: -3, trend: 'up' }, // up means faster/better
                    safetyScore: { value: 7.8, delta: 0.2, trend: 'up' }
                },
                charts: {
                    incidentsByType: [
                        { type: 'Pickpocketing', count: 45 },
                        { type: 'Harassment', count: 22 },
                        { type: 'Medical', count: 18 },
                        { type: 'Lost Tourist', count: 60 }
                    ],
                    weeklyTrend: [
                        { day: 'Mon', count: 12 },
                        { day: 'Tue', count: 15 },
                        { day: 'Wed', count: 8 },
                        { day: 'Thu', count: 22 },
                        { day: 'Fri', count: 30 },
                        { day: 'Sat', count: 35 },
                        { day: 'Sun', count: 23 }
                    ]
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
});

export default router;

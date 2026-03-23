import { Router, Request, Response } from 'express';
import { prisma } from '../../shared/db/client';
import { authenticateToken } from '../../shared/middleware/auth.middleware';

const router = Router();

// PATCH /api/tourists/profile
// Update tourist profile details (trip metadata)
router.patch('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
        const touristId = (req as any).user.id;
        const { citiesExploring, tripDuration, nationality, fullName } = req.body;

        const updatedTourist = await prisma.tourist.update({
            where: { id: touristId },
            data: {
                citiesExploring,
                tripDuration: tripDuration ? parseInt(tripDuration) : undefined,
                nationality,
                fullName
            } as any
        });

        const { password, ...touristWithoutPassword } = updatedTourist;
        res.json({ success: true, data: touristWithoutPassword });
    } catch (error: any) {
        console.error('Update profile error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// GET /api/tourists/profile
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
        const touristId = (req as any).user.id;
        const tourist = await prisma.tourist.findUnique({
            where: { id: touristId }
        });

        if (!tourist) {
            return res.status(404).json({ success: false, message: 'Tourist not found' });
        }

        const { password, ...touristWithoutPassword } = tourist;
        res.json({ success: true, data: touristWithoutPassword });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});

// GET /api/tourists/all
// List all tourists (Admin/Officer access)
router.get('/all', authenticateToken, async (req: Request, res: Response) => {
    try {
        const tourists = await prisma.tourist.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const touristsWithoutPasswords = tourists.map(t => {
            const { password, ...rest } = t as any;
            return rest;
        });

        res.json({ success: true, data: touristsWithoutPasswords });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch tourists' });
    }
});

// GET /api/tourists/:id
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tourist = await prisma.tourist.findUnique({
            where: { id: id as string }
        });

        if (!tourist) {
            return res.status(404).json({ success: false, message: 'Tourist not found' });
        }

        const { password, ...rest } = tourist as any;
        res.json({ success: true, data: rest });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch tourist' });
    }
});

export default router;

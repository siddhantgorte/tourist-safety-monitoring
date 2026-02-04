import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/tourist-id/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Mock verification data matching Section 5 of spec
        res.json({
            success: true,
            data: {
                id,
                status: 'ACTIVE',
                validity: { from: '2026-02-01', to: '2026-02-15' },
                entryPoint: 'Terminal 2, Mumbai Airport',
                itinerary: ['Mumbai', 'Pune', 'Goa'],
                securityHash: 'b7a8c9d0...e1f2g3',
                verificationHistory: [
                    { time: '2026-02-04T10:00:00Z', officer: 'Officer John', location: 'Checkpost A' }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to verify Digital ID' });
    }
});

export default router;

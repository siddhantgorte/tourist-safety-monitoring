import { Router, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { authenticateToken } from '../../shared/middleware/auth.middleware';
import { prisma } from '../../shared/db/client';

const router = Router();
const authService = new AuthService();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        const data = await authService.login(username, password);
        res.json({ success: true, data });
    } catch (error: any) {
        console.error('Login error:', error.message);
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
    try {
        // req.user corresponds to the JWT payload
        const userId = (req as any).user.id;
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
                region: { select: { id: true, name: true } }
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { password, ...userWithoutPassword } = user;
        res.json({ 
            success: true, 
            data: {
                ...userWithoutPassword,
                roleName: user.role.name,
                regionName: user.region?.name || null
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
    }
});

export default router;

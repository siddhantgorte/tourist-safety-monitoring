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

// POST /api/auth/guest-login
router.post('/guest-login', async (req: Request, res: Response) => {
    try {
        const data = await authService.guestLogin();
        res.json({ success: true, data });
    } catch (error: any) {
        console.error('Guest login error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Guest login failed' });
    }
});

// POST /api/auth/tourist/signup
router.post('/tourist/signup', async (req: Request, res: Response) => {
    try {
        const { email, password, fullName, phoneNumber, nationality, tripDuration, citiesExploring } = req.body;
        
        if (!email || !password || !fullName || !phoneNumber || !nationality) {
            return res.status(400).json({ success: false, message: 'Required fields are missing' });
        }

        const data = await authService.touristSignup({ 
            email, 
            passwordString: password, 
            fullName, 
            phoneNumber, 
            nationality,
            tripDuration,
            citiesExploring
        });
        res.status(201).json({ success: true, data });
    } catch (error: any) {
        console.error('Tourist Signup error:', error.message);
        res.status(400).json({ success: false, message: error.message || 'Signup failed' });
    }
});

// POST /api/auth/tourist/login
router.post('/tourist/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const data = await authService.touristLogin(email, password);
        res.json({ success: true, data });
    } catch (error: any) {
        console.error('Tourist Login error:', error.message);
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
    try {
        const decodedUser = (req as any).user;
        const userId = decodedUser.id;
        const role = decodedUser.role || decodedUser.roleName;

        if (role === 'tourist') {
            const tourist = await prisma.tourist.findUnique({
                where: { id: userId }
            });

            if (!tourist) {
                return res.status(404).json({ success: false, message: 'Tourist profile not found' });
            }

            const { password, ...touristWithoutPassword } = tourist as any;
            return res.json({
                success: true,
                data: {
                    ...touristWithoutPassword,
                    role: 'tourist'
                }
            });
        }
        
        // Otherwise handle as official staff User
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
        console.error('Error fetching /me:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
    }
});


export default router;

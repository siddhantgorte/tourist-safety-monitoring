import { Router, Request, Response } from 'express';
import { UserService } from './users.service';

const router = Router();
const userService = new UserService();

// Helper to get userId from header or fallback
const getUserId = (req: Request) => {
    return (req.headers['x-user-id'] as string) || (req.query.userId as string) || '0282ddf2-e676-492d-a89c-89fd57ace2a9';
};

// GET /api/users
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const data = await userService.getAllUsers(userId);
        const summary = await userService.getUserSummary();
        res.json({ success: true, data, summary });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// POST /api/users
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const data = await userService.createUser(userId, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create user';
        res.status(error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500)
           .json({ success: false, message });
    }
});

// PATCH /api/users/:id
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id as string;
        const data = await userService.updateUser(userId, id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update user';
        res.status(error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500)
           .json({ success: false, message });
    }
});

// DELETE /api/users/:id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id as string;
        await userService.deleteUser(userId, id);
        res.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete user';
        res.status(error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500)
           .json({ success: false, message });
    }
});

export default router;

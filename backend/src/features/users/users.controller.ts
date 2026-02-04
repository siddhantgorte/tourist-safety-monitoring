import { Router, Request, Response } from 'express';
import { UserService } from './users.service';

const router = Router();
const userService = new UserService();

// GET /api/users
router.get('/', async (req: Request, res: Response) => {
    try {
        const data = await userService.getAllUsers();
        const summary = await userService.getUserSummary();
        res.json({ success: true, data, summary });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// POST /api/users
router.post('/', async (req: Request, res: Response) => {
    try {
        const data = await userService.createUser(req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create user' });
    }
});

// PATCH /api/users/:id
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const data = await userService.updateUser(id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});

// DELETE /api/users/:id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await userService.deleteUser(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

export default router;

import { prisma } from '../../shared/db/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';
const JWT_EXPIRES_IN = '24h';

export class AuthService {
    async login(username: string, passwordString: string) {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                role: true,
                region: { select: { id: true, name: true } }
            }
        });

        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isPasswordValid = await bcrypt.compare(passwordString, user.password);
        
        if (!isPasswordValid) {
            throw new Error('Invalid username or password');
        }

        // Create JWT payload
        const payload = {
            id: user.id,
            username: user.username,
            roleId: user.roleId,
            roleName: user.role.name,
            regionId: user.regionId
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Update online status seamlessly in background without awaiting blocks if we didn't want to, but standard await is fine.
        await prisma.user.update({
            where: { id: user.id },
            data: { isOnline: true }
        });

        // Omit the password hash from the returned user object
        const { password, ...userWithoutPassword } = user;

        return {
            user: {
                ...userWithoutPassword,
                roleName: user.role.name,
                regionName: user.region?.name || null
            },
            token
        };
    }
}

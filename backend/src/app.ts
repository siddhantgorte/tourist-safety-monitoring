import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { prisma } from './shared/db/client';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*', // TODO: Restrict in production
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
import dashboardRouter from './features/dashboard/dashboard.controller';
import incidentRouter from './features/incidents/incident.controller';
import analyticsRouter from './features/analytics/analytics.controller';
import usersRouter from './features/users/users.controller';
import touristIdRouter from './features/tourist-id/tourist-id.controller';
import geofenceRouter from './features/geofences/geofence.controller';
import authRouter from './features/auth/auth.controller';
import touristsRouter from './features/tourists/tourists.controller';

app.get('/', (req, res) => {
    res.json({ message: 'Smart Tourist Safety Backend API is Running 🚀' });
});

app.use('/api/dashboard', dashboardRouter);
app.use('/api/incidents', incidentRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/users', usersRouter);
app.use('/api/tourist-id', touristIdRouter);
app.use('/api/geofences', geofenceRouter);
app.use('/api/auth', authRouter);
app.use('/api/tourists', touristsRouter);

// Socket.io Connection
import { SocketService } from './shared/utils/socket.service';

const socketService = SocketService.getInstance();
socketService.initialize(io);

const PORT = process.env.PORT || 5000;

// Database Connection & Server Start
async function startServer() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to Database successfully');
        
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to connect to Database:', error);
        process.exit(1);
    }
}

startServer();

// Global Error Handling to prevent crashes on transient DB errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process, let nodemon/it keep running
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // You might want to exit here if it's a memory leak, but for DB errors we try to stay alive
});

export { app, io };


import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

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

app.get('/', (req, res) => {
    res.json({ message: 'Smart Tourist Safety Backend API is Running 🚀' });
});

app.use('/api/dashboard', dashboardRouter);
app.use('/api/incidents', incidentRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/users', usersRouter);
app.use('/api/tourist-id', touristIdRouter);
app.use('/api/geofences', geofenceRouter);

// Socket.io Connection
import { SocketService } from './shared/utils/socket.service';

const socketService = SocketService.getInstance();
socketService.initialize(io);

// Mock DB Availability Check (since we don't have real DB yet)
console.warn("⚠️  Database URL not configured. Running in Mock/Dev mode.");

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { app, io };

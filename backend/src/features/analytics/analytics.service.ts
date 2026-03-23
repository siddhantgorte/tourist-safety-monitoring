import { prisma } from '../../shared/db/client';

export class AnalyticsService {
    async getAnalyticsData() {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const [
            totalIncidents,
            closedIncidents,
            incidentsByType,
            recentIncidents
        ] = await Promise.all([
            prisma.incident.count(),
            prisma.incident.count({ where: { status: 'CLOSED' } }),
            prisma.incident.groupBy({
                by: ['type'],
                _count: { _all: true }
            }),
            prisma.incident.findMany({
                where: { createdAt: { gte: lastMonth } },
                select: { createdAt: true }
            })
        ]);

        // Calculate resolution rate
        const resolutionRate = totalIncidents > 0 ? (closedIncidents / totalIncidents) * 100 : 0;

        // Group by type for pie chart
        const formattedIncidentsByType = incidentsByType.map(item => ({
            type: item.type,
            count: item._count._all
        }));

        // Calculate weekly trend
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyTrendMap: Record<string, number> = {};
        days.forEach(day => weeklyTrendMap[day] = 0);

        recentIncidents.forEach(inc => {
            const dayName = days[new Date(inc.createdAt).getDay()];
            weeklyTrendMap[dayName]++;
        });

        const weeklyTrend = days.map(day => ({
            day,
            count: weeklyTrendMap[day]
        }));

        return {
            kpis: {
                totalIncidents: { value: totalIncidents, delta: 5, trend: 'up' },
                resolutionRate: { value: parseFloat(resolutionRate.toFixed(1)), delta: 2, trend: 'up' },
                avgResponseTime: { value: '12m', delta: -2, trend: 'up' },
                safetyScore: { value: 8.2, delta: 0.1, trend: 'up' }
            },
            charts: {
                incidentsByType: formattedIncidentsByType,
                weeklyTrend: weeklyTrend
            }
        };
    }
}

const prisma = require('../config/db');

/**
 * Get aggregated stats for the dashboard
 */
exports.getStats = async (req, res) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'tenantId is required' });

        // Ensure isolation: where tenantId = tenantId
        const totalCustomers = await prisma.customer.count({ where: { tenantId } });
        const totalOrders = await prisma.order.count({ where: { tenantId } });

        // Aggregation for total revenue
        const revenueAgg = await prisma.order.aggregate({
            _sum: { totalPrice: true },
            where: { tenantId }
        });
        const totalRevenue = revenueAgg._sum.totalPrice || 0;

        res.json({
            totalCustomers,
            totalOrders,
            totalRevenue: parseFloat(totalRevenue.toFixed(2))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get sales over time for chart
 */
exports.getSalesOverTime = async (req, res) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'tenantId is required' });

        // Determine aggregate by day
        // Prisma doesn't support complex date truncation natively in SQLite/generic simple mode easily without raw query for some DBs, 
        // but for Postgres we can use groupBy or raw query.
        // However, groupBy on date(createdAt) is not directly supported in Prisma Client API without formatting.
        // Easier approach for MVP: Fetch all orders (optimized: select only needed fields) and aggregate in code, 
        // OR use raw query.
        // Given the constraints and likely reasonable data size for MVP, code aggregation is safe.
        // But Raw Query is better for "Insights Service".

        // Using Prisma GroupBy (works well if we group by exact DateTime which is bad, so we need Raw)
        // Let's use logic: Fetch orders with date & price, group in JS.

        const orders = await prisma.order.findMany({
            where: { tenantId },
            select: { createdAt: true, totalPrice: true },
            orderBy: { createdAt: 'asc' }
        });

        const salesMap = {};

        orders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
            salesMap[date] = (salesMap[date] || 0) + order.totalPrice;
        });

        const chartData = Object.keys(salesMap).map(date => ({
            date,
            amount: parseFloat(salesMap[date].toFixed(2))
        }));

        res.json(chartData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get top customers
 */
exports.getTopCustomers = async (req, res) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'tenantId is required' });

        const topCustomers = await prisma.customer.findMany({
            where: { tenantId },
            orderBy: { totalSpent: 'desc' },
            take: 5,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                totalSpent: true,
                ordersCount: true
            }
        });

        res.json(topCustomers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

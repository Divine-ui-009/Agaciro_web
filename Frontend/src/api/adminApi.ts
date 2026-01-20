import axios from './axios';

export interface Order {
    order_price: number;
    createdAt: string;
}

export interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    monthlySales: { month: string; revenue: number }[];
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    const [productsRes, ordersRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/orders'),
    ]);

    const orders: Order[] = ordersRes.data;

    const salesMap: Record<string, number> = {};

    orders.forEach(order => {
        const month = new Date(order.createdAt).toLocaleString('default', {
            month: 'short',
        });

        salesMap[month] = (salesMap[month] || 0) + order.order_price;
    });

    const monthlySales = Object.entries(salesMap).map(([month, revenue]) => ({
        month,
        revenue,
    }));

    return {
        totalProducts: productsRes.data.length,
        totalOrders: orders.length,
        monthlySales,
    };
};

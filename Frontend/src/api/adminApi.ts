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

export interface StockHistoryItem {
    _id: string;
    product: {
        _id: string;
        proName: string;
    };
    productName: string;
    action: 'order' | 'restock' | 'adjustment' | 'deletion';
    quantityChanged: number;
    previousQuantity: number;
    newQuantity: number;
    reason: string;
    changedBy: {
        _id: string;
        userName: string;
        email: string;
    };
    createdAt: string;
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

export const fetchStockHistory = async (
    startDate?: string,
    endDate?: string,
    productId?: string,
    action?: string
): Promise<StockHistoryItem[]> => {
    let query = '/api/stock/history?';
    
    if (startDate) {
        query += `startDate=${startDate}&`;
    }
    if (endDate) {
        query += `endDate=${endDate}&`;
    }
    if (productId) {
        query += `productId=${productId}&`;
    }
    if (action) {
        query += `action=${action}`;
    }

    const response = await axios.get(query);
    return response.data;
};

export const updateProductStock = async (
    productId: string,
    operation: 'add' | 'reduce',
    quantity: number,
    reason?: string,
    buyerName?: string
): Promise<any> => {
    const response = await axios.post('/api/stock/update', {
        productId,
        operation,
        quantity,
        reason,
        buyerName
    });
    return response.data;
};

export const bulkRemoveStock = async (
    items: Array<{ productId: string; quantity: number; buyerName: string; reason?: string }>
): Promise<any> => {
    const response = await axios.post('/api/stock/bulk-remove', { items });
    return response.data;
};


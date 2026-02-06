import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';

interface StockHistoryItem {
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

const AdminStockHistory = () => {
  const [history, setHistory] = useState<StockHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  
  // Date filter - default to last 1 day
  const [dateRange, setDateRange] = useState<'1day' | '7days' | '30days' | 'custom'>('1day');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchHistory();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    if (dateRange === '1day') {
      startDate.setDate(startDate.getDate() - 1);
    } else if (dateRange === '7days') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (dateRange === '30days') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (dateRange === 'custom') {
      if (!customStartDate || !customEndDate) return { startDate: null, endDate: null };
      startDate = new Date(customStartDate);
      endDate.setTime(new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      
      let query = '/api/stock/history?';
      
      if (startDate && dateRange !== 'custom') {
        query += `startDate=${startDate.toISOString()}&`;
      } else if (dateRange === 'custom' && customStartDate && customEndDate) {
        query += `startDate=${new Date(customStartDate).toISOString()}&`;
        query += `endDate=${new Date(customEndDate).toISOString()}&`;
      }
      
      if (filterAction) {
        query += `action=${filterAction}&`;
      }
      
      if (filterProduct) {
        query += `productId=${filterProduct}`;
      }

      const response = await axios.get(query);
      setHistory(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange as any);
    if (newRange !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const handleApplyFilters = () => {
    fetchHistory();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'order':
        return 'bg-red-100 text-red-800';
      case 'deletion':
        return 'bg-yellow-100 text-yellow-800';
      case 'adjustment':
        return 'bg-blue-100 text-blue-800';
      case 'restock':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      order: 'Order Placed',
      deletion: 'Order Deleted',
      adjustment: 'Manual Adjustment',
      restock: 'Restock'
    };
    return labels[action] || action;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Stock History</h1>
          <button 
            onClick={() => navigate('/admin/stock')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Back
          </button>
        </div>
      </header>

      <div className="p-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1day">Last 1 Day</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="order">Order Placed</option>
                <option value="deletion">Order Deleted</option>
                <option value="adjustment">Manual Adjustment</option>
                <option value="restock">Restock</option>
              </select>
            </div>

            {/* Product Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product
              </label>
              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.proName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-medium"
          >
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {error && (
            <div className="p-4 bg-red-100 border-b border-red-200 text-red-700">
              {error}
            </div>
          )}

          {history.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
              <p>No stock history records found</p>
            </div>
          )}

          {loading && (
            <div className="p-8 text-center text-gray-500">
              <p>Loading...</p>
            </div>
          )}

          {history.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity Change</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Before → After</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Changed By</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(item.action)}`}>
                          {getActionLabel(item.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className={item.quantityChanged < 0 ? 'text-red-600' : 'text-green-600'}>
                          {item.quantityChanged > 0 ? '+' : ''}{item.quantityChanged}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.previousQuantity} → {item.newQuantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.changedBy.userName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {history.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-sm text-red-600 font-medium">Orders Placed</div>
                <div className="text-2xl font-bold text-red-700">
                  {history.filter(h => h.action === 'order').length}
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm text-yellow-600 font-medium">Orders Deleted</div>
                <div className="text-2xl font-bold text-yellow-700">
                  {history.filter(h => h.action === 'deletion').length}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">Adjustments</div>
                <div className="text-2xl font-bold text-blue-700">
                  {history.filter(h => h.action === 'adjustment').length}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 font-medium">Total Changes</div>
                <div className="text-2xl font-bold text-green-700">
                  {history.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStockHistory;

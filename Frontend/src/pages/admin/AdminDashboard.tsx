import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import MonthlySalesChart from '../../components/MonthlySalesChart';
import { fetchDashboardStats } from '../../api/adminApi';
import type { DashboardStats } from '../../api/adminApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return <p className="text-center mt-10">Loading dashboard...</p>;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button 
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Home
          </button>
        </div>
      </header>

      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            onClick={() => navigate('/admin/products')}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            onClick={() => navigate('/admin/orders')}
          />
        </div>

        {/* Quick Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <button
            onClick={()=> navigate('/admin/stock')}
            className='px-6 py-3 bg-blue-700 text-white rounded-lg shadow-sm hover:bg-blue-900 transition'
            >
              Manage Stock
            </button>
            <button 
              onClick={() => navigate('/admin/products')} 
              className='px-6 py-3 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-700 transition'
            >
              Manage Products
            </button>
            <button 
              onClick={() => navigate('/admin/orders')} 
              className='px-6 py-3 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition'
            >
              View Orders
            </button>
          </div>
        </div>

        {/* Monthly Sales Chart */}
        <MonthlySalesChart data={stats.monthlySales} />
      </div>
    </div>
  );
};

export default AdminDashboard;

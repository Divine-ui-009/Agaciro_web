import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminHeaderProps {
  title: string;
  showBackButton?: boolean;
  backTo?: string;
}

const AdminHeader = ({ title, showBackButton = true, backTo = '/admin/dashboard' }: AdminHeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button 
                aria-label="Go back" 
                onClick={() => navigate(backTo)} 
                className="text-gray-700 hover:text-black text-2xl transition"
                title="Back"
              >
                ←
              </button>
            )}
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>

          <button 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from "./pages/Register";
import AdminDashboard from './pages/admin/AdminDashboard';
import Products from './pages/Products';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

import AdminRoute from './components/AdminRoute';
// import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import History from './pages/History';
import CreateOrder from './pages/CreateOrder';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* <Navbar /> */}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          
          <Route path="/products" element={<Products />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/history" element={<History />} />
          <Route path="/create-order" element={<CreateOrder />} />

          <Route path="/admin/dashboard" 
            element={<AdminRoute><AdminDashboard /></AdminRoute>} 
          />
          <Route path="/admin/products"
            element={<AdminRoute><AdminProducts /></AdminRoute>}
          />
          <Route path='/admin/orders'
            element={<AdminRoute><AdminOrders /></AdminRoute>}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useEffect, useState } from "react";

export default function History(){
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(()=>{
    const fetch = async () => {
      try{
        const res = await api.get('/api/orders/myorders');
        setOrders(res.data);
      }catch(err){ console.error(err); }
    }
    fetch();
  },[user]);

  return (
    <ProtectedRoute role="customer">
      <div className="min-h-screen p-6">
        <h1 className="text-2xl font-bold mb-4">Your Order History</h1>
        {orders.length === 0 && <p>No orders found.</p>}
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o._id} className="border p-3 rounded">
              <p><strong>Date:</strong> {new Date(o.createdAt).toLocaleString()}</p>
              <p><strong>Total:</strong> {o.totalPrice}</p>
              <p><strong>Status:</strong> {o.status}</p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}

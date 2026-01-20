import ProtectedRoute from "../components/ProtectedRoute";
import api from "../api/axios";
import { useEffect, useState } from "react";

export default function Orders(){
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try{
      const res = await api.get('/api/orders');
      setOrders(res.data);
    }catch(err){ console.error(err); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ fetchOrders(); },[]);

  return (
    <ProtectedRoute role="admin">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        {loading && <p>Loading...</p>}
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o._id} className="border p-3 rounded">
              <p><strong>User:</strong> {o.user?.userName || o.user?.email}</p>
              <p><strong>Total:</strong> {o.totalPrice}</p>
              <p><strong>Status:</strong> {o.status}</p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}

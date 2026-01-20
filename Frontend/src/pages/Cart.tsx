import { useEffect, useState } from "react";
import type { Product } from "../types/Product";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [items, setItems] = useState<Array<Product & { qty?: number }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('cart');
        const cart = raw ? JSON.parse(raw) : [];
        setItems(cart);
      } catch {
        setItems([]);
      }
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const updateQty = (id: string, qty: number) => {
    const next = items.map(it => it._id === id ? { ...it, qty } : it).filter(Boolean);
    setItems(next as any);
    localStorage.setItem('cart', JSON.stringify(next));
    window.dispatchEvent(new Event('storage'));
  };

  const removeItem = (id: string) => {
    const next = items.filter(it => it._id !== id);
    setItems(next as any);
    localStorage.setItem('cart', JSON.stringify(next));
    window.dispatchEvent(new Event('storage'));
  };

  const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Add items from the shop to start your order.</p>
          <button onClick={() => navigate('/products')} className="bg-indigo-600 text-white px-4 py-2 rounded-full">Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Cart</h2>
        <div className="space-y-4">
          {items.map(it => (
            <div key={it._id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <div>
                <div className="font-medium text-gray-800">{it.name}</div>
                <div className="text-sm text-gray-600">{it.price} Rwf</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min={1} value={it.qty || 1} onChange={(e) => updateQty(it._id, Math.max(1, Number(e.target.value)))} className="w-16 text-center border rounded-md p-1" />
                <button onClick={() => removeItem(it._id)} className="text-sm text-red-600">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <div className="text-gray-600 text-sm">Total</div>
            <div className="text-xl font-semibold">{total} Rwf</div>
          </div>
          <div>
            <button onClick={() => { localStorage.removeItem('cart'); window.dispatchEvent(new Event('storage')); navigate('/'); }} className="bg-green-600 text-white px-4 py-2 rounded-full">Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

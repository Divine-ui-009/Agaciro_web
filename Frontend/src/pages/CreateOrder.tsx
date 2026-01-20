import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/ProductApi";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types/Product";

interface OrderItem {
  product: Product;
  quantity: number;
}

export default function CreateOrder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Mobile money");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
  };

  const handleAddToOrder = () => {
    if (!selectedProduct || quantity < 1) return;

    const existing = selectedItems.find(item => item.product._id === selectedProduct._id);
    if (existing) {
      setSelectedItems(items =>
        items.map(item =>
          item.product._id === selectedProduct._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setSelectedItems([...selectedItems, { product: selectedProduct, quantity }]);
    }

    setSelectedProduct(null);
    setSearchTerm("");
    setQuantity(1);
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(items => items.filter(item => item.product._id !== productId));
  };

  const total = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      setError("Please add at least one product");
      return;
    }
    if (!address.trim()) {
      setError("Please enter delivery address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderItems = selectedItems.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }));

      await api.post('/api/orders', {
        orderItems,
        address,
        paymentMethod
      });

      alert("Order created successfully!");
      navigate("/history");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Order</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Products</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedProduct(null);
                }}
                placeholder="Type product name..."
                className="w-full border rounded px-3 py-2"
              />
              {searchTerm && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-b shadow-lg max-h-40 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div
                      key={product._id}
                      onClick={() => handleSelectProduct(product)}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {product.name} - {product.price} Rwf
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAddToOrder}
                disabled={!selectedProduct}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Add to Order
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          {selectedItems.length === 0 ? (
            <p className="text-gray-500">No items added yet</p>
          ) : (
            <div className="space-y-3">
              {selectedItems.map(item => (
                <div key={item.product._id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">{item.product.price} Rwf × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.product.price * item.quantity} Rwf</span>
                    <button
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-right text-xl font-bold">
                Total: {total} Rwf
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter delivery address"
                className="w-full border rounded px-3 py-2 h-20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Mobile money">Mobile Money</option>
                <option value="Cash on delivery">Cash on Delivery</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || selectedItems.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Creating Order..." : "Create Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
// }</content>
// <parameter name="filePath">d:\Projects\AGACIRO Website\Frontend\src\pages\CreateOrder.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/ProductApi";
import type { Product } from "../types/Product";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"default" | "price_asc" | "price_desc">("default");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const filtered = useMemo(() => {
    let list = products.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    }
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, query, sort]);

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3 gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Products</h1>
            <p className="text-gray-600 text-sm">Curated selection — simple, clear, reliable.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="px-3 py-2 border border-gray-200 rounded-md text-sm w-40"
              aria-label="Search products"
            />

            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="px-3 py-2 border border-gray-200 rounded-md text-sm">
              <option value="default">Sort</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
            <button
              onClick={() => navigate('/create-order')}
              className="bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              New +
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-700 mb-2">No products found.</p>
            <p className="text-gray-500 text-sm">Try a different search or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

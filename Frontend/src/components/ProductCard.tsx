import { useState } from "react";
import type { Product } from "../types/Product";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const resolveImage = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
    return base + url;
}

export default function ProductCard({ product }: { product: Product }) {
    if (!product) return null;
    const imgSrc = resolveImage(product.imageUrl || '');
    const navigate = useNavigate();
    const { user } = useAuth();
    const [added, setAdded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const addToCart = () => {
        if (!user) {
            // require login before adding to cart
            navigate('/login', { state: { from: `/products/${product._id}` } });
            return;
        }
        try {
            const raw = localStorage.getItem('cart');
            const cart = raw ? JSON.parse(raw) : [];
            const existing = cart.find((c: any) => c._id === product._id);
            if (existing) {
                existing.qty = (existing.qty || 1) + 1;
            } else {
                cart.push({ ...product, qty: 1 });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            // notify other windows
            try { window.dispatchEvent(new Event('storage')); } catch {}
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
        } catch (err) {
            console.error('cart error', err);
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 w-full mb-3 hover:shadow-md transition">
            {imgSrc && !imageError ? (
                <img 
                    src={imgSrc} 
                    alt={product.name} 
                    className="w-full h-44 sm:h-48 object-cover rounded-md mb-3"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="w-full h-44 sm:h-48 bg-gray-200 rounded-md mb-3 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                </div>
            )}

            <h2 className="font-medium text-base text-gray-800">{product.name}</h2>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
            <div className="mt-3 flex items-center justify-between">
                <div className="text-base font-semibold text-gray-800">{product.price} Rwf</div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/products/${product._id}`)} className="text-sm text-gray-600 hover:text-gray-800">View</button>
                    <button onClick={addToCart} aria-label={`Add ${product.name} to cart`} className={`text-sm px-3 py-1 rounded-full ${added ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'}`}>
                        {added ? 'Added' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
}

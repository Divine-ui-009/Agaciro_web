import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const update = () => {
            try {
                const raw = localStorage.getItem('cart');
                const cart = raw ? JSON.parse(raw) : [];
                const sum = cart.reduce((s: number, i: any) => s + (i.qty || 1), 0);
                setCartCount(sum);
            } catch {
                setCartCount(0);
            }
        };

        update();
        window.addEventListener('storage', update);
        return () => window.removeEventListener('storage', update);
    }, []);

    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-gray-900 font-semibold text-lg">Agaciro</Link>
                    {/* Desktop links */}
                    <div className="hidden sm:flex items-center gap-4">
                        <Link to="/products" className="text-gray-600 text-sm hover:text-gray-900">Products</Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/cart')} aria-label="Open cart" className="relative p-2 rounded-full hover:bg-gray-100 touch-manipulation" title="Open Cart">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">{cartCount}</span>
                        )}
                    </button>

                    {/* Desktop auth links */}
                    <div className="hidden sm:flex items-center gap-3">
                        {!user && (
                            <>
                                <Link to="/auth/login" className="text-gray-600 text-sm hover:text-gray-900">Login</Link>
                                <Link to="/auth/register" className="text-gray-600 text-sm hover:text-gray-900">Register</Link>
                            </>
                        )}

                        {user && (
                            <>
                                <Link to="/profile" className="text-gray-700 text-sm hover:underline">{user.name}</Link>
                                <button onClick={logout} className="ml-2 bg-gray-900 text-white text-sm px-3 py-1 rounded">Logout</button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button className="sm:hidden p-2 rounded-md hover:bg-gray-100" aria-label="Open menu" onClick={() => setMenuOpen(v => !v)}>
                        {menuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile panel */}
            {menuOpen && (
                <div className="sm:hidden mt-2 px-4">
                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-3 space-y-2">
                        <Link to="/products" onClick={() => setMenuOpen(false)} className="block text-gray-700 py-2">Products</Link>
                        {!user && (
                            <>
                                <Link to="/auth/login" onClick={() => setMenuOpen(false)} className="block text-gray-700 py-2">Login</Link>
                                <Link to="/auth/register" onClick={() => setMenuOpen(false)} className="block text-gray-700 py-2">Register</Link>
                            </>
                        )}
                        {user && (
                            <>
                                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block text-gray-700 py-2">Profile</Link>
                                <button onClick={() => { setMenuOpen(false); logout(); }} className="w-full text-left text-gray-700 py-2">Logout</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
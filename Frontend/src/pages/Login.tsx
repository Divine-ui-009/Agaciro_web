import { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

import Logo from "../assets/logo.png";

type User = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: "admin" | "customer";
};

function Login(){
    const navigate = useNavigate();

    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState("");
    const [ showPassword, setShowPassword ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);

            const res = await api.post('/api/auth/login', { 
                email, 
                password 
            });

            const { token, user } = res.data as {
                token: string;
                user: User;
            };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            console.log('User role:', user.role); // Debug log
            console.log('Full user object:', user); // Debug log

            if (user && user.role === "admin") {
                console.log('Navigating to admin dashboard'); // Debug log
                navigate("/admin/dashboard", { replace: true });
            } else {
                console.log('Navigating to products'); // Debug log
                navigate("/products", { replace: true });
            }
        }catch (err: any) {
            setError(
                err.response?.data?.message || "Login failed. Try again."
            );
        } finally {
            setLoading(false);
        }
    };

     return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img
            src={Logo}
            alt="Agaciro Ventures"
            className="w-20 h-20 rounded-full object-cover"
          />
        </div>

        <h1 className="text-xl font-bold text-center mb-1">Welcome Back</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Login to continue</p>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-xl border pl-4 pr-12 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/auth/register"
            className="text-blue-600 font-semibold"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
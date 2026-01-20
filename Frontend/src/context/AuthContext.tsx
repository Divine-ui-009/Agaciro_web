import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: "admin" | "customer";
    profileImage?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, phone: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser?: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [ user, setUser ] = useState<User | null> (null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post("/api/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
    };

    const register = async (name: string, email: string, phone: string, password: string) => {
        try {
            // backend expects userName, email, phone, password
            const res = await api.post("/api/auth/register", { userName: name, email, phone, password });
            if (res.data && res.data.token) {
                localStorage.setItem("token", res.data.token);
                const userObj = {
                    id: res.data._id,
                    name: res.data.name || name,
                    email: res.data.email,
                    phone: res.data.phone,
                    role: res.data.role || "customer",
                    profileImage: res.data.profileImage
                };
                localStorage.setItem("user", JSON.stringify(userObj));
                setUser(userObj);
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Registration failed';
            throw new Error(msg);
        }
    }

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    const updateUser = (patch: Partial<User>) => {
        const next = { ...(user || {}), ...patch } as User;
        setUser(next);
        localStorage.setItem('user', JSON.stringify(next));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
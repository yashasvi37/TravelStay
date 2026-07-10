import { createContext, useState, useContext, useEffect } from "react";
import api from "../lib/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore user profile from localStorage on app mount
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch (_) {}
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await api.post("/login", { username, password });
            // Backend sets httpOnly cookie for the token.
            // We only store the user profile in state/localStorage.
            const { user } = res.data;

            localStorage.setItem("user", JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || "Login failed" };
        }
    };

    const signup = async (username, email, password) => {
        try {
            const res = await api.post("/signup", { username, email, password });
            // Backend sets httpOnly cookie for the token.
            const { user } = res.data;

            localStorage.setItem("user", JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || "Signup failed" };
        }
    };

    const logout = async () => {
        try {
            await api.post("/logout"); // Ask backend to clear httpOnly cookies
        } catch (_) { /* ignore */ }
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

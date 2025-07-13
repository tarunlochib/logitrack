import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import ModernContentCard from "../components/ModernContentCard";
import ModernInput from "../components/ModernInput";
import ModernButton from "../components/ModernButton";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const expired = searchParams.get('expired');
        if (expired === 'true') {
            setMessage("Your session has expired. Please login again.");
        }
        const sessionMsg = sessionStorage.getItem('sessionExpired');
        if (sessionMsg) {
            setMessage(sessionMsg);
            sessionStorage.removeItem('sessionExpired');
        }
    }, [searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`,
                { email, password }
            );
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            if (res.data.user && res.data.user.tenant && res.data.user.tenant.slug) {
                localStorage.setItem("tenantSlug", res.data.user.tenant.slug);
            }
            if (res.data.user.role === 'SUPERADMIN') {
                navigate("/superadmin");
            } else {
                navigate("/dashboard");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-blue-50 relative overflow-hidden">
            {/* Subtle blurred background accent */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-200 rounded-full filter blur-3xl opacity-20 z-0" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200 rounded-full filter blur-2xl opacity-10 z-0" />
            <div className="w-full max-w-sm z-10">
                <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center">
                    {/* Icon and App Name */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center mb-2 shadow-md">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-5.373-8-10a8 8 0 1116 0c0 4.627-3.582 10-8 10z" />
                                <circle cx="12" cy="11" r="3" />
                            </svg>
                        </div>
                        <div className="text-2xl font-extrabold text-cyan-700 mb-1 tracking-tight">LogiTrack</div>
                        <div className="text-base text-gray-500 font-medium">Sign in to your account</div>
                    </div>
                    {/* Session expired message */}
                    {message && (
                        <div className="w-full mb-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-2 text-xs text-center">
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-4 w-full">
                        <ModernInput
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            className="text-sm"
                        />
                        <ModernInput
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="text-sm"
                        />
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2 text-xs text-center">{error}</div>
                        )}
                        <button
                            type="submit"
                            className="w-full rounded-full text-sm font-semibold py-2 shadow bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center transition-colors duration-150"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : <span className="mx-auto">Login</span>}
                        </button>
                    </form>
                    <div className="w-full flex justify-end mt-3">
                        <button
                            type="button"
                            className="text-cyan-600 hover:underline text-xs font-medium focus:outline-none"
                            tabIndex={-1}
                            onClick={() => setError("Forgot password? Please contact your admin.")}
                        >
                            Forgot password?
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ModernContentCard from "../components/ModernContentCard";
import ModernInput from "../components/ModernInput";
import ModernButton from "../components/ModernButton";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {

            console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
            console.log('Login URL:', `${import.meta.env.VITE_API_URL}/api/auth/login`);

            const res = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`,
                { email, password }
            );
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            navigate("/dashboard");
        } catch (error) {
            setError("Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-blue-50 relative overflow-hidden">
            {/* Subtle blurred background accent */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-200 rounded-full filter blur-3xl opacity-30 z-0" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200 rounded-full filter blur-2xl opacity-20 z-0" />
            <ModernContentCard className="w-full max-w-md z-10 shadow-xl border border-gray-50 p-10 flex flex-col items-center">
                {/* Icon and App Name */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-full bg-cyan-500 flex items-center justify-center mb-3 shadow-md">
                        {/* Simple location pin icon (Heroicons outline) */}
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-5.373-8-10a8 8 0 1116 0c0 4.627-3.582 10-8 10z" />
                            <circle cx="12" cy="11" r="3" />
                        </svg>
                    </div>
                    <div className="text-3xl font-extrabold text-cyan-700 mb-1 tracking-tight">LogiTrack</div>
                    <div className="text-base text-gray-500 font-medium">Sign in to your account</div>
                </div>
                <form onSubmit={handleLogin} className="space-y-5 w-full">
                    <ModernInput
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                    <ModernInput
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm text-center">{error}</div>
                    )}
                    <button
                        type="submit"
                        className="w-full rounded-full text-lg font-semibold py-3 shadow-md bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center transition-colors duration-150"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : <span className="mx-auto">Login</span>}
                    </button>
                </form>
                <div className="w-full flex justify-end mt-4">
                    <button
                        type="button"
                        className="text-cyan-600 hover:underline text-sm font-medium focus:outline-none"
                        tabIndex={-1}
                        onClick={() => setError("Forgot password? Please contact your admin.")}
                    >
                        Forgot password?
                    </button>
                </div>
            </ModernContentCard>
        </div>
    );
}

export default Login;
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AiFillEyeInvisible } from "react-icons/ai";
import { HiMiniEye } from "react-icons/hi2";
import actionLogin, { statusLogin } from "../actions/actionLogin";
import { useSearchParams } from "next/navigation";

const LoginForm = ({ className }: { className?: string }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showVerificationMessage, setShowVerificationMessage] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/";


    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };


    useEffect(() => {
        statusLogin();
    }, []);



    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setShowVerificationMessage(false);

        try {
            // First, check if user exists and is verified
            const verificationRes = await actionLogin({ email });

            // If verification failed due to email not being verified
            if (!verificationRes?.success && verificationRes?.verification) {
                setShowVerificationMessage(true);
                setLoading(false);
                return;
            }

            // If user doesn't exist or other verification error
            if (!verificationRes?.success) {
                setError(verificationRes?.message || "Invalid email or password");
                setLoading(false);
                return;
            }

            // If verification passed, proceed with actual login
            try {
                const loginResponse = await fetch("/api/users/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                const loginData = await loginResponse.json();

                if (loginResponse.ok) {
                    // Successful login - redirect
                    window.location.href = redirectTo;
                } else {
                    // API returned an error
                    setError(loginData?.message || "Invalid email or password");
                }
            } catch (apiError) {
                console.error("API error:", apiError);
                setError("An error occurred while logging in");
            }
        } catch (error) {
            console.error("Login process error:", error);
            setError("An error occurred while processing your login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${className} flex justify-center items-center my-32 px-4`}>
            <div className="w-full max-w-md bg-gray-200 flex flex-col rounded-lg p-6 shadow-md">
                <h1 className="text-4xl font-semibold text-center mb-6 text-gray-800">Login</h1>

                {error && <p className="text-red-600 text-center mb-4">{error}</p>}
                {showVerificationMessage && (
                    <p className="text-red-600 text-center mb-4">Please verify your email before logging in.</p>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        className="w-full bg-white text-gray-800 rounded-lg outline-none p-3"
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div className="relative">
                        <input
                            className="w-full bg-white text-gray-800 rounded-lg outline-none p-3"
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="absolute z-10 h-full top-0 flex items-center justify-end right-5">
                            {!showPassword ?
                                <HiMiniEye size={22} color="black" onClick={handleShowPassword} /> :
                                <AiFillEyeInvisible size={22} color="black" onClick={handleShowPassword} />}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-black text-white rounded-lg p-3 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                    <h2 className="text-gray-800">
                        Don&apos;t have an account? <Link href="/signup" className="text-blue-600">Sign Up</Link>
                    </h2>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
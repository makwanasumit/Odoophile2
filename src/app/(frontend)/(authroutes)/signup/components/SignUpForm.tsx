"use client";

import { SignUpAction } from "@/actions/SignUpAction";
import sendEmail from "@/utilities/nodemailer";
import { nodemailerHtmlTemplate } from "@/utilities/nodemailerHtmlTemplate";
import crypto from "crypto";
import sha256 from "crypto-js/sha256";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiFillEyeInvisible } from "react-icons/ai";
import { HiMiniEye } from "react-icons/hi2";
import { statusLogin } from "../../login/actions/actionLogin";

const SignupForm = ({ className }: { className?: string }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [getVerified, setGetVerified] = useState(false);

    const router = useRouter();

    useEffect(() => {
        statusLogin();
    }, []);


    const handleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSignup = async (): Promise<boolean> => {
        setError("");
        setSuccessMessage("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }

        try {
            const verificationToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = sha256(verificationToken).toString();
            const verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
            const verificationLink = `http://localhost:3000/verify-email?verificationToken=${verificationToken}&email=${email}`;
            const html = nodemailerHtmlTemplate(verificationLink);

            const response = await SignUpAction({
                name,
                email,
                password,
                hashedToken,
                verificationTokenExpiry,
            });

            await sendEmail(email, "Email Verification", html);



            if (response) {
                setSuccessMessage("Signup successful! Please verify your email.");
                setName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
            } else {
                setError("Something went wrong. Please try again.");
            }


        } catch (err) {
            console.error("Signup error:", err);
            setError("An error occurred during signup.");
            return false;
        }

        return true;
    };

    const handleLogin = async () => {
        try {
            const res = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Login failed");
            }

            const data = await res.json();
            if (!data.user.isVerified) {
                setGetVerified(true);
                return;
            }

            window.dispatchEvent(new Event("tokenChanged"));
            router.push("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong during login");
        }
    };

    const handleBothFunctions = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const signupSuccess = await handleSignup();
        if (signupSuccess) {
            await handleLogin();
        }

        setLoading(false);
    };

    return (
        <div className={`${className} flex justify-center items-center my-32 px-4`}>
            <div className="w-full max-w-md bg-gray-200 flex flex-col rounded-lg p-6 shadow-md">
                <h1 className="text-4xl font-semibold text-center mb-6 text-gray-800">Sign Up</h1>
                {getVerified}

                {error && <p className="text-red-600 text-center mb-4">{error}</p>}
                {successMessage && <p className="text-green-600 text-center mb-4">{successMessage}</p>}

                <form onSubmit={handleBothFunctions} className="space-y-4">
                    <input
                        className="w-full bg-white text-gray-800 rounded-lg outline-none p-3"
                        placeholder="Full name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        className="w-full bg-white text-gray-800 rounded-lg outline-none p-3"
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {[password, confirmPassword].map((val, i) => (
                        <div className="relative" key={i}>
                            <input
                                className="w-full bg-white text-gray-800 rounded-lg outline-none p-3"
                                placeholder={i === 0 ? "Password" : "Confirm password"}
                                type={showPassword ? "text" : "password"}
                                value={i === 0 ? password : confirmPassword}
                                onChange={(e) => (i === 0 ? setPassword(e.target.value) : setConfirmPassword(e.target.value))}
                                required
                            />
                            <div className="absolute z-10 h-full top-0 flex items-center justify-end right-5">
                                {showPassword ? (
                                    <AiFillEyeInvisible size={22} color="black" onClick={handleShowPassword} />
                                ) : (
                                    <HiMiniEye size={22} color="black" onClick={handleShowPassword} />
                                )}
                            </div>
                        </div>
                    ))}
                    <button
                        type="submit"
                        className="w-full bg-black text-white rounded-lg p-3 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                    <h2 className="text-gray-800">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600">
                            Login
                        </Link>
                    </h2>
                </form>
            </div>
        </div>
    );
};

export default SignupForm;

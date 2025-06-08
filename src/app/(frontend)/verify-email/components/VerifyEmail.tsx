"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TextEncrypted } from '../Encrypted/TextEncrypted/TextEncrypted';

const VerifyEmail = () => {
    const searchParams = useSearchParams();
    const verificationToken = searchParams.get('verificationToken');
    const email = searchParams.get('email');

    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const verifyEmail = async () => {
            if (!email || !verificationToken) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/verify-email?email=${encodeURIComponent(email)}&verificationToken=${encodeURIComponent(verificationToken)}`);
                if (res.ok) {
                    setIsVerified(true);
                }
            } catch (error) {
                console.error("Error verifying email:", error);
            } finally {
                setIsLoading(false);
            }
        };

        verifyEmail();
    }, [email, verificationToken]);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push(isVerified ? '/' : '/signup');
        }, 5000);
        return () => clearTimeout(timer);
    }, [isVerified, router]);

    return (




        <div className="flex justify-center items-center flex-[1] bg-gray-100 dark:bg-gray-900">
            <div className="w-96 p-6 bg-white rounded-2xl shadow-xl flex flex-col justify-center items-center text-center transition-all duration-300">
                {isLoading ? (
                    <div className="text-gray-500 text-lg font-semibold animate-pulse">Verifying...</div>
                ) : (
                    <div className={`transition-all duration-300 ${isVerified ? 'text-green-500' : 'text-red-500'}`}>
                        <h1 className="text-xl font-bold mb-2">
                            {isVerified ? '✅ Email Verified' : '❌ Verification Failed'}
                        </h1>
                        <p className="text-gray-600 text-sm mb-4">
                            {isVerified
                                ? 'Your email has been successfully verified.'
                                : 'The verification token is invalid or expired.'}
                        </p>
                        <div className="p-3 bg-gray-100 rounded-md shadow-inner w-full text-sm">
                            <TextEncrypted
                                text={isVerified ? 'Email verified successfully' : 'Email verification failed: ' + (email ?? '')}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;

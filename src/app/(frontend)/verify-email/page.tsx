import { Suspense } from "react";
import VerifyEmail from "./components/VerifyEmail";

export default async function VerifyEmailPage() {
    return (
        <div className="flex flex-[1] items-center justify-center bg-red-200 dark:bg-gray-900">
            <Suspense fallback={<div>Loading...</div>}>
                <VerifyEmail />
            </Suspense>
        </div>
    );
}

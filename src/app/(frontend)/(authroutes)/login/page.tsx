import { Suspense } from "react";
import LoginForm from "./components/LoginForm";

export default function Login() {
    return (
        <div className="flex-[1] flex items-center justify-center">
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm className="w-[30rem]" />
            </Suspense>
        </div>
    );
}

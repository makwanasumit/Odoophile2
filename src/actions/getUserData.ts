"use server";

import { jwtDecode, JwtPayload } from "jwt-decode";
import { headers } from "next/headers";

interface UserPayload extends JwtPayload {
    id: string;
    email?: string;
    name?: string;
}

export async function getUserData(): Promise<UserPayload | null> {
    const cookieHeader = (await headers()).get("cookie");
    let payloadToken: string | undefined;

    if (cookieHeader) {
        const match = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]*)/);
        payloadToken = match?.[1];
    }

    if (!payloadToken) return null;

    try {
        const decoded = jwtDecode<UserPayload>(payloadToken);
        return decoded;
    } catch (err) {
        console.warn("Invalid token:", err);
        return null;
    }
}


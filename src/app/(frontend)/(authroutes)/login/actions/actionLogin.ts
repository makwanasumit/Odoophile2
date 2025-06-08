"use server";

import configPromise from "@payload-config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

export default async function actionLogin({
    email,
}: {
    email: string;
}) {
    try {
        const payload = await getPayload({ config: configPromise });

        const userResult = await payload.find({
            collection: "users",
            where: {
                email: {
                    equals: email,
                },
            }
        });

        // Check if user exists
        if (userResult.docs.length === 0) {
            return {
                success: false,
                message: "User not found",
                verification: false
            };
        }

        // Check if user is verified
        const user = userResult.docs[0];
        const isVerified = user?.isVerified;

        if (!isVerified) {
            return {
                success: false,
                message: "Email not verified",
                verification: true
            };
        }

        // If we reach here, user exists and is verified
        return {
            success: true,
            message: "User verified",
            user: user
        };
    } catch (error) {
        console.error("Login verification error:", error);
        return {
            success: false,
            message: "An error occurred during verification",
            verification: false
        };
    }
}

export async function statusLogin() {

    const cookieHeader = (await headers()).get("cookie");

    if (cookieHeader) {
        const match = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]*)/);
        const payloadToken = match?.[1];

        if (payloadToken) {
            redirect("/");
        }

    }

}
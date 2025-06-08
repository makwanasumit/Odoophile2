"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { headers } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface Profile {
    id: string;
    following?: (string | { id: string })[]; // Defining following as an array of strings or objects with an 'id' field
}

interface UserPayload {
    id: string;
}

export async function CheckFollowing(profileId: string) {
    try {
        const cookieHeader = (await headers()).get("cookie");
        if (!cookieHeader) return { error: "No cookies found", isFollowing: false };

        const match = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]*)/);
        const payloadToken = match?.[1];
        if (!payloadToken) return { error: "No token found", isFollowing: false };

        const { id: userId }: UserPayload = jwtDecode(payloadToken);
        if (!userId) return { error: "Invalid token", isFollowing: false };

        const payload = await getPayload({ config: configPromise });
        const { docs } = await payload.find({
            collection: "profiles",
            where: { user: { equals: userId } },
        });

        const currentProfile = docs?.[0] as Profile;  // Casting to Profile type
        if (!currentProfile) return { error: "Profile not found", isFollowing: false };

        const isFollowing = currentProfile.following?.some((f) =>
            typeof f === "object" ? f.id === profileId : f === profileId
        );

        return { isFollowing: !!isFollowing };
    } catch (error) {
        console.error("Error checking follow status:", error);
        return { error: "Server error", isFollowing: false };
    }
}
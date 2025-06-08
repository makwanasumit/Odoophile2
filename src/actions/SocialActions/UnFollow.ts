"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { headers } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface UserPayload extends Record<string, unknown> {
    id: string;
}

interface Profile {
    id: string;
    following?: (string | { id: string })[]; // Defining following as an array of strings or objects with an 'id' field
    followers?: (string | { id: string })[]; // Defining followers as an array of strings or objects with an 'id' field
}

export async function Unfollow(profileId: string) {
    try {
        const cookieHeader = (await headers()).get("cookie");
        if (!cookieHeader) return { error: "No cookies found" };

        const match = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]*)/);
        const payloadToken = match?.[1];
        if (!payloadToken) return { error: "No token found" };

        const { id: userId } = jwtDecode<UserPayload>(payloadToken);
        if (!userId) return { error: "Invalid token" };

        const payload = await getPayload({ config: configPromise });

        // Find the current user's profile
        const { docs } = await payload.find({
            collection: "profiles",
            where: { user: { equals: userId } },
        });

        const currentProfile = docs?.[0] as Profile;
        if (!currentProfile) return { error: "Current profile not found" };

        // Filter out the profile to unfollow from the current user's following list
        const updatedFollowing = (currentProfile.following || []).filter((f) =>
            typeof f === "object" ? f.id !== profileId : f !== profileId
        );

        // Update the current user's following list
        await payload.update({
            collection: "profiles",
            id: currentProfile.id,
            data: { following: updatedFollowing },
        });

        // Get the target profile
        const targetProfile = await payload.findByID({
            collection: "profiles",
            id: profileId
        }) as Profile;

        if (!targetProfile) return { error: "Target profile not found" };

        // Filter out the current user from the target profile's followers list
        const updatedFollowers = (targetProfile.followers || []).filter((f) =>
            typeof f === "object" ? f.id !== currentProfile.id : f !== currentProfile.id
        );

        // Update the target profile's followers list
        await payload.update({
            collection: "profiles",
            id: profileId,
            data: { followers: updatedFollowers },
        });

        return { success: true };
    } catch (error) {
        console.error("Error in Unfollow:", error);
        return { error: "Server error" };
    }
}
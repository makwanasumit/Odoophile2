"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { headers } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface UserPayload extends Record<string, unknown> {
    id: string;
}

export async function Follow(profileId: string) {
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

        const currentProfile = docs?.[0];
        if (!currentProfile) return { error: "Current profile not found" };

        // Check if trying to follow self
        if (currentProfile.id === profileId) return { error: "You can't follow yourself" };

        // Get the target profile
        const targetProfile = await payload.findByID({
            collection: "profiles",
            id: profileId
        });

        if (!targetProfile) return { error: "Target profile not found" };

        // Create sets to avoid duplicates
        const currentFollowing = Array.isArray(currentProfile.following) ? currentProfile.following : [];
        const targetFollowers = Array.isArray(targetProfile.followers) ? targetProfile.followers : [];

        // Check if already following
        const isAlreadyFollowing = currentFollowing.some(f =>
            typeof f === "object" ? f.id === profileId : f === profileId
        );

        if (!isAlreadyFollowing) {
            // Update current user's following list
            await payload.update({
                collection: "profiles",
                id: currentProfile.id,
                data: {
                    following: [...currentFollowing, profileId]
                },
            });

            // Update target user's followers list
            await payload.update({
                collection: "profiles",
                id: profileId,
                data: {
                    followers: [...targetFollowers, currentProfile.id]
                },
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error in Follow:", error);
        return { error: "Server error" };
    }
}
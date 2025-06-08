"use server";

import { jwtDecode, JwtPayload } from "jwt-decode";
import { headers } from "next/headers";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { redirect } from "next/navigation";

interface UserPayload extends JwtPayload {
    id: string;
}
type ReadingListItem = string | { id: string };

export async function DeleteBlog(selectedBlogId: string) {
    try {
        const cookieHeader = (await headers()).get("cookie");
        if (!cookieHeader) return { error: "No cookies found" };

        const match = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]*)/);
        const payloadToken = match?.[1];
        if (!payloadToken) return { error: "No token found" };

        const userData = jwtDecode<UserPayload>(payloadToken);
        if (!userData?.id) return { error: "Invalid token" };

        const payload = await getPayload({ config: configPromise });

        // Step 1: Get the author's profile
        const { docs } = await payload.find({
            collection: "profiles",
            where: { user: { equals: userData.id } },
        });

        const authorProfile = docs?.[0];
        if (!authorProfile) return { error: "Profile not found" };

        // Step 2: Get the blog post to retrieve its coverImage
        const blogPost = await payload.findByID({
            collection: "userblog",
            id: selectedBlogId,
        });

        let coverImageId = null;
        if (blogPost && blogPost.coverImage) {
            // Handle both string ID and object reference formats
            coverImageId = typeof blogPost.coverImage === 'object'
                ? blogPost.coverImage.id
                : blogPost.coverImage;
        }

        // Step 3: Find all profiles with this blog in their readinglist
        const profilesWithBlog = await payload.find({
            collection: "profiles",
            where: {
                readinglist: { contains: selectedBlogId }
            },
            limit: 100,
        });

        // Step 4: Update each profile to remove the blog from readinglist
        for (const profile of profilesWithBlog.docs) {
            const updatedReadingList = (profile.readinglist || []).filter((id: ReadingListItem) =>
                typeof id === 'object' ? id.id !== selectedBlogId : id !== selectedBlogId
            );

            await payload.update({
                collection: "profiles",
                id: profile.id,
                data: { readinglist: updatedReadingList },
            });
        }

        // Step 5: Find all comments related to the blog
        const comments = await payload.find({
            collection: "comments",
            where: {
                post: { equals: selectedBlogId },
            },
            limit: 250,
        });

        // Step 6: Delete all comments for this blog
        for (const comment of comments.docs) {
            await payload.delete({
                collection: "comments",
                id: comment.id,
            });
        }

        // Step 7: Delete the blog itself
        await payload.delete({
            collection: "userblog",
            id: selectedBlogId,
        });

        // Step 8: Delete the coverImage from media if it exists
        if (coverImageId) {
            try {
                await payload.delete({
                    collection: "media", // Assuming your media collection is called "media"
                    id: coverImageId,
                });
                console.log(`Deleted cover image with ID: ${coverImageId}`);
            } catch (imageError) {
                // Don't fail the whole operation if media deletion fails
                console.error("Error deleting cover image:", imageError);
            }
        }

        return { success: true, deletedId: selectedBlogId, deletedCoverImage: coverImageId };
    } catch (error) {
        console.error("Error in DeleteBlog:", error);
        return { error: "Server error" };
    }
}



export default async function RouteCreatePost() {
    const cookieHeader = (await headers()).get("cookie");
    if (!cookieHeader) return { error: "No cookies found" };

    const match = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]*)/);
    const payloadToken = match?.[1];
    if (!payloadToken) return { error: "No token found" };

    const userData = jwtDecode<UserPayload>(payloadToken);
    if (!userData?.id) return { error: "Invalid token" };

    const payload = await getPayload({ config: configPromise });

    // Step 1: Get the author's profile
    const { docs } = await payload.find({
        collection: "profiles",
        where: { user: { equals: userData.id } },
    });

    const authorProfile = docs?.[0];
    if (!authorProfile) return { error: "Profile not found" };


    redirect(`/new/${authorProfile.username}`);
}
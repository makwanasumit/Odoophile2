"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";

export const findFeaturedPost = async () => {
    const payload = await getPayload({ config: configPromise });

    // First, find the most liked post
    const mostLikedResult = await payload.find({
        collection: 'userblog',
        limit: 1,
        sort: '-upvotes', // Assuming 'upvotes' is the field for likes
        depth: 1,
    });

    const mostLikedPost = mostLikedResult.docs?.[0];
    if (!mostLikedPost) {
        throw new Error("No posts found");
    }

    // Find any currently featured post
    const featuredResult = await payload.find({
        collection: 'userblog',
        where: {
            featured: { equals: true },
        },
        limit: 1
    });

    const currentFeaturedPost = featuredResult.docs?.[0];

    // If there's a featured post and it's different from the most liked post
    if (currentFeaturedPost && currentFeaturedPost.id !== mostLikedPost.id) {
        // Unflag the current featured post
        await payload.update({
            collection: 'userblog',
            id: currentFeaturedPost.id,
            data: {
                featured: false
            }
        });
    }

    // Set the most liked post as featured if it's not already
    if (!mostLikedPost.featured) {
        await payload.update({
            collection: 'userblog',
            id: mostLikedPost.id,
            data: {
                featured: true
            }
        });
    }

    return mostLikedPost;
}
'use server';

import { getPayload, PaginatedDocs } from "payload";
import configPromise from "@payload-config";
import { Userblog } from "@/payload-types";

export const fetchBlogs = async (
    page: number = 1,
    limit: number = 10
): Promise<PaginatedDocs<Userblog>> => {
    const payload = await getPayload({ config: configPromise });

    try {
        const blogs = await payload.find({
            collection: "userblog",
            limit,
            page,
            sort: "-createdAt",
            where: {
                featured: {
                    not_equals: true
                },
            },
            depth: 1 // Add depth to properly fetch related data
        });

        return blogs;
    } catch (error) {
        console.error("Error fetching blogs:", error);
        // Return empty result if there's an error
        return {
            docs: [],
            hasNextPage: false,
            hasPrevPage: false,
            limit,
            nextPage: null,
            page,
            pagingCounter: 0,
            prevPage: null,
            totalDocs: 0,
            totalPages: 0
        };
    }
};
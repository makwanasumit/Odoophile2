"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { headers } from "next/headers";
import { Userblog } from "@/payload-types";

type UserData = { id: string };
type UpdateBlogInput = Userblog & { userData?: UserData };

export async function updateBlog(formData: UpdateBlogInput | FormData) {
    const headerList = await headers();
    const cookieHeader = headerList.get("cookie");

    if (!cookieHeader) {
        return { error: "No cookies found" };
    }

    const match = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]*)/);
    const payloadToken = match ? match[1] : null;

    const payload = await getPayload({ config: configPromise });
    function isMedia(obj: unknown): obj is { id: string } {
        return typeof obj === "object" && obj !== null && "id" in obj;
    }


    try {
        let data: UpdateBlogInput;
        let coverImageFile: File | null = null;

        if (formData instanceof FormData) {
            const rawData = formData.get("data") as string;
            coverImageFile = formData.get("coverImage") as File;
            data = JSON.parse(rawData);
        } else {
            data = formData;
        }


        const blogPost = await payload.findByID({
            collection: "userblog",
            id: data.id,
        });

        if (!blogPost) return { error: "Blog post not found" };
        if (
            blogPost.user &&
            typeof blogPost.user === "object" &&
            blogPost.user.id !== data.userData?.id
        ) {
            return { error: "Unauthorized to edit this post" };
        }

        const updatePayload: Partial<UpdateBlogInput> = {
            title: data.title,
            description: data.description,
            content: data.content,
        };

        if (coverImageFile && isMedia(data.coverImage)) {
            await payload.delete({
                collection: "media",
                id: data.coverImage.id,
            });
        }


        if (coverImageFile) {
            const imageForm = new FormData();
            imageForm.append("file", coverImageFile);

            const mediaRes = await fetch("http://localhost:3000/api/media", {
                method: "POST",
                body: imageForm,
                headers: {
                    Cookie: `payload-token=${payloadToken}`,
                },
            });

            if (!mediaRes.ok) {
                const errorText = await mediaRes.text();
                console.error("Media upload failed:", errorText);
                return { error: "Failed to upload cover image" };
            }

            const mediaData = await mediaRes.json();
            if (mediaData?.doc?.id) {
                updatePayload.coverImage = mediaData.doc.id;
            }
        } else if (isMedia(data.coverImage)) {
            updatePayload.coverImage = data.coverImage.id;
        }

        const res = await payload.update({
            collection: "userblog",
            id: data.id,
            data: updatePayload,
        });

        if (res?.id) {
            return { success: true, slug: res.slug };
        }

        return { error: "Update failed" };
    } catch (error) {
        console.error("Error updating blog post:", error);
        return { error: "Error updating blog post" };
    }
}

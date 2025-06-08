"use server";

import configPromise from "@payload-config";
import { headers } from "next/headers";
import { getPayload } from "payload";
import { getUserData } from "../getUserData";

type BlogFormData = {
    title: string;
    description: string;
    content: string;
    profile: string | { id: string; user: string };
};



export async function SaveBlog(formData: FormData | { [key: string]: unknown }) {
    const headerList = await headers();
    const cookieHeader = headerList.get("cookie");

    if (!cookieHeader) {
        return { error: "No cookies found" };
    }

    const match = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]*)/);
    const payloadToken = match ? match[1] : null;

    const payload = await getPayload({ config: configPromise });

    try {
        let data: BlogFormData = formData as BlogFormData;
        let coverImageFile: File | null = null;

        if (formData instanceof FormData) {
            const rawData = formData.get("data") as string;
            data = JSON.parse(rawData) as BlogFormData;
            coverImageFile = formData.get("coverImage") as File;
        }

        const userdata = await getUserData();

        let userId: string | undefined = undefined;

        if (userdata) {
            const userResult = await payload.find({
                collection: "users",
                where: {
                    email: {
                        equals: userdata.email,
                    },
                },
            });

            const foundUser = userResult.docs?.[0];
            if (foundUser) {
                userId = foundUser.id;
            }
        }

        const createPayload: {
            title: string;
            description: string;
            content: string;
            user?: string;
            profile: string;
            coverImage?: string;
        } = {
            title: data.title,
            description: data.description,
            content: data.content,
            user: userId,
            profile: typeof data.profile === "object" ? data.profile.id : data.profile,
        };


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
                createPayload.coverImage = mediaData.doc.id;
            }
        }

        const res = await payload.create({
            collection: "userblog",
            data: createPayload,
        });

        if (res?.id && res?.slug) {
            return { slug: res.slug };
        }

        return { error: "Blog created but slug missing" };
    } catch (error) {
        console.error("Error creating blog post:", error);
        return { error: "Error creating blog post" };
    }
}

"use server";

import { Profile } from "@/payload-types";
import configPromise from "@payload-config";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BasePayload, getPayload } from "payload";

interface UserPayload extends JwtPayload {
    id: string;
}

interface AuthResult {
    payload: Awaited<ReturnType<typeof getPayload>>;
    profile: Profile;
    userId: string;
}

interface PayloadWithReq extends BasePayload {
    req: {
        headers: {
            cookie: string;
        };
    };
}

// Improved SaveCommentProps interface with proper typing
interface SaveCommentProps {
    comment: string;
    blog: { id: string };
    profile: Profile;
    parent: string | null;
}

// ✅ Safe getAuth – doesn't throw on guest
export const getAuth = async (): Promise<AuthResult | null> => {
    const headerList = await headers();
    const cookieHeader = headerList.get("cookie");
    const match = cookieHeader?.match(/(?:^|;\s*)payload-token=([^;]*)/);
    const payloadToken = match?.[1];
    if (!payloadToken) return null;

    let userData: UserPayload;
    try {
        userData = jwtDecode<UserPayload>(payloadToken);
    } catch {
        return null;
    }

    const userId = userData?.id;
    if (!userId) return null;

    const payload = await getPayload({ config: configPromise });
    const payloadWithReq = payload as PayloadWithReq;

    payloadWithReq.req = {
        headers: { cookie: cookieHeader ?? "" },
    };

    const profileRes = await payload.find({
        collection: "profiles",
        where: { user: { equals: userId } },
    });
    const profile = profileRes?.docs?.[0];
    if (!profile) return null;

    return { payload, profile, userId };
};

// ✅ Safe for guests
export const checkInitialStatus = async ({ slug }: { slug: string }) => {
    const auth = await getAuth();
    if (!auth) return { isUpvoted: false, inReadingList: false };

    const { payload, profile } = auth;

    const blogRes = await payload.find({
        collection: "userblog",
        where: { slug: { equals: slug } },
        draft: true, // 👈 add this
    });

    const blog = blogRes?.docs?.[0];
    if (!blog) throw new Error("Blog not found");

    const isUpvoted = (blog.upvotes || []).some((id) =>
        typeof id === "string" ? id === profile.id : id.id === profile.id
    );

    const inReadingList = (profile.readinglist || []).some((entry) =>
        typeof entry === "string" ? entry === blog.id : entry.id === blog.id
    );

    return { isUpvoted, inReadingList };
};

// ❗ Auth required
export const toggleUpVote = async ({ id }: { id: string }) => {
    const auth = await getAuth();
    if (!auth) throw new Error("Not authenticated");

    const { payload, profile } = auth;

    const blog = await payload.findByID({
        collection: "userblog",
        id,
    });

    const currentUpvotes = blog.upvotes || [];
    const alreadyUpvoted = currentUpvotes.some((upvote) =>
        typeof upvote === "string" ? upvote === profile.id : upvote.id === profile.id
    );

    const updatedUpvotes = alreadyUpvoted
        ? currentUpvotes.filter((id) =>
            typeof id === "string" ? id !== profile.id : id.id !== profile.id
        )
        : [...currentUpvotes, profile.id];

    const updatedUpvoteCount = updatedUpvotes.length;

    await payload.update({
        collection: "userblog",
        id: blog.id,
        data: {
            upvotes: updatedUpvotes,
            upvoteCount: updatedUpvoteCount, // ✅ keep this in sync
        },
    });

    return !alreadyUpvoted; // returns true if now upvoted, false if removed
};
// ❗ Auth required
export const toggleReadingList = async ({ id }: { id: string }) => {
    const auth = await getAuth();
    if (!auth) throw new Error("Not authenticated");

    const { payload, profile } = auth;

    const blogRes = await payload.find({
        collection: "userblog",
        where: { id: { equals: id } },
    });
    const blog = blogRes?.docs?.[0];
    if (!blog) throw new Error("Blog not found");

    const currentList = profile.readinglist || [];
    const alreadyExists = currentList.some((b) =>
        typeof b === "string" ? b === blog.id : b.id === blog.id
    );

    const updatedList = alreadyExists
        ? currentList.filter((b) =>
            typeof b === "string" ? b !== blog.id : b.id !== blog.id
        )
        : [...currentList, blog.id];

    const blogSaves = blog.saves || [];
    const updatedSaves = alreadyExists
        ? blogSaves.filter((p) =>
            typeof p === "string" ? p !== profile.id : p.id !== profile.id
        )
        : [...blogSaves, profile.id];

    // Update Profile
    await payload.update({
        collection: "profiles",
        id: profile.id,
        data: { readinglist: updatedList },
    });

    // Update Blog
    await payload.update({
        collection: "userblog",
        id: blog.id,
        data: { saves: updatedSaves },
    });

    return !alreadyExists;
};



// Export the SaveComment function
export const SaveComment = async (props: SaveCommentProps) => {
    const auth = await getAuth();
    if (!auth) throw redirect('/login');

    const { payload, profile } = auth;

    // Create new comment
    const commentsRes = await payload.create({
        collection: "comments",
        data: {
            text: props.comment,
            author: profile.id,
            post: props.blog.id,
            parent: props.parent || null,
        },
    });

    // Fetch the blog post
    const blogRes = await payload.findByID({
        collection: "userblog",
        id: props.blog.id,
    });

    // Update the blog's comment list with the new comment ID
    await payload.update({
        collection: "userblog",
        id: props.blog.id,
        data: {
            comments: [
                ...(blogRes.comments?.map((c) => typeof c === 'string' ? c : c.id) || []),
                commentsRes.id,
            ]
        },
    });

    // Return the comment with author details attached for immediate UI rendering
    return commentsRes;

};




export const RemoveFromReadingList = async ({ id }: { id: string }) => {
    const auth = await getAuth();
    if (!auth) throw new Error("Not authenticated");

    const { payload, profile } = auth;

    // 1. Remove blog ID from user's readinglist
    await payload.update({
        collection: "profiles",
        id: profile.id,
        data: {
            readinglist: profile.readinglist?.filter((b) =>
                typeof b === "string" ? b !== id : b.id !== id
            )
        },
    });

    // 2. Remove user ID from the blog's saves list
    const userblog = await payload.findByID({
        collection: "userblog",
        id,
    });

    await payload.update({
        collection: "userblog",
        id,
        data: {
            saves: userblog.saves?.filter((b) =>
                typeof b === "string" ? b !== profile.id : b.id !== profile.id
            )
        },
    });

    return true;
};


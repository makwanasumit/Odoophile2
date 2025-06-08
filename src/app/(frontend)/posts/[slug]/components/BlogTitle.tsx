import { Profile, Userblog } from '@/payload-types';
import { PaginatedDocs } from 'payload'
import React from 'react'
import { format } from "date-fns";
import { Media } from '@/components/Media';
import Link from 'next/link';





type Props = {
    data: PaginatedDocs<Userblog>
}



const BlogTitle: React.FC<Props> = ({ data }) => {
    const blog = data?.docs?.[0]

    const profile = blog?.profile && typeof blog.profile !== "string" ? blog.profile as Profile : null;


    const authorName = profile?.firstname && profile?.lastname
        ? `${profile.firstname} ${profile.lastname}`
        : `${profile?.username || "Unknown author"}`;

    const formattedDate = blog?.createdAt
        ? format(new Date(blog.createdAt), "dd MMM yyyy")
        : "Unknown date";

    const username = profile?.username || "unknown";


    if (!blog) {
        return (
            <div className="w-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 py-8 flex items-center justify-center">
                <p className="text-center text-lg font-semibold">Blog not found.</p>
            </div>
        );
    }



    return (
        <div className="relative w-full gradient text-white py-8 sm:py-12 md:py-16 shadow-md dark:shadow-none">
            {blog.coverImage && (
                <>
                    <Media
                        resource={blog.coverImage}
                        loading="lazy"
                        imgClassName="absolute inset-0 object-center object-cover h-full w-full z-0"
                    />
                    <div className="absolute inset-0 bg-gray-900 dark:opacity-50 opacity-40" />
                </>
            )}

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight tracking-tight break-words text-center sm:text-left">
                    {blog.title}
                </h1>
            </div>

            <div className="mt-2 sm:mt-4 px-4 sm:px-6 lg:px-8 z-10 relative">
                <div className="container mx-auto text-white text-center sm:text-left text-sm flex flex-col sm:flex-row justify-center sm:justify-between items-center sm:items-end">
                    <Link href={`/profile/${username}`}>
                        <div className="cursor-pointer hover:underline text-sm sm:text-base">
                            <p className="font-medium">{profile ? authorName : username}</p>
                            <p className="text-xs sm:text-sm">Published on {formattedDate}</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default BlogTitle
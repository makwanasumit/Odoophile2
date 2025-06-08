// app/(frontend)/profile/[username]/page.tsx
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import UserProfile from "./components/Profile";
import { notFound } from 'next/navigation';

// Make page revalidate frequently to ensure search results are up to date
export const revalidate = 0;


type Args = {
    params: Promise<{ username?: string }>,
    searchParams: Promise<{ query?: string }>
}


export default async function Profile({ params, searchParams }: Args) {
    const { username } = await params;
    const { query } = await searchParams || {};

    const payload = await getPayload({ config: configPromise });

    // Find the profile
    const data = await payload.find({
        collection: 'profiles',
        where: {
            username: {
                equals: username
            },
        }
    });

    // Return 404 if profile not found
    if (!data?.docs?.[0]) {
        notFound();
    }

    // Find blog posts by this profile, with optional search query filter
    const blog = await payload.find({
        collection: 'userblog',
        limit: 100,
        where: {
            profile: {
                equals: data.docs[0].id
            },
            ...(query ? {
                or: [
                    { title: { like: query } },
                    { description: { like: query } },
                    { content: { like: query } },

                ]
            } : {})
        },
        sort: '-createdAt' // Show newest posts first
    });

    return (
        <div className="relative flex flex-[1] flex-col items-center py-2 px-4 sm:px-6 lg:px-8 max-w-none">
            <UserProfile data={data} blog={blog} />
        </div>
    );
}
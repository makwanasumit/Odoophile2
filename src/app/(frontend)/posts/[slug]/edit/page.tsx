




import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { jwtDecode } from 'jwt-decode';
import { User } from '@/payload-types';
import MarqueeHeading from '@/components/MarqueeHeading/MarqueeHeading';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor';


interface UserPayload extends Record<string, unknown> {
    id: string;
}


type Args = {
    params: Promise<{
        slug?: string
    }>
}
export default async function EditPostPage({ params: paramsPromise }: Args) {
    const { slug } = await paramsPromise;
    const headerList = await headers();
    const cookieHeader = headerList.get("cookie");

    if (!cookieHeader) return redirect('/');

    const match = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]*)/);
    const payloadToken = match ? match[1] : null;

    if (!payloadToken) return redirect('/');

    let userData;

    try {
        userData = jwtDecode<UserPayload>(payloadToken);
    } catch {
        return redirect('/');
    }

    if (!userData?.id) return redirect('/');

    const payload = await getPayload({ config: configPromise });

    // Fetch the blog post with the given slug
    const blogPosts = await payload.find({
        collection: "userblog",
        where: { slug: { equals: slug } },
    });



    if (!blogPosts) return redirect('/');

    // Verify that the current user is the owner of the post
    if (userData.id !== (blogPosts?.docs?.[0]?.user as User)?.id) {
        return redirect('/');
    }

    // Fetch the user's profile data
    const profileData = await payload.find({
        collection: "profiles",
        where: { user: { equals: userData.id } },
    });

    if (!profileData || profileData.docs.length === 0) return redirect('/');

    return (
        <div className="relative flex flex-col justify-center items-center mb-6 py-2 px-4 sm:px-6 lg:px-8">
            <MarqueeHeading text="Edit your blog" />
            <MarkdownEditor
                data={profileData}
                blogPosts={blogPosts}
                isEditMode={true}
            />
        </div>
    );
}
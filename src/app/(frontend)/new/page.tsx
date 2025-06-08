import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { jwtDecode } from 'jwt-decode';
import MarqueeHeading from '@/components/MarqueeHeading/MarqueeHeading';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor';

interface UserPayload extends Record<string, unknown> {
    id: string;
}

export default async function CreatePostPage() {
    const headerList = await headers();
    const cookieHeader = headerList.get("cookie");
    const pathname = '/new';



    if (!cookieHeader) return redirect("/login?redirectTo=/new");

    const match = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]*)/);
    const payloadToken = match ? match[1] : null;


    if (!payloadToken) {
        return redirect(`/login?redirectTo=${encodeURIComponent(pathname ?? '/')}`); // FIXED here
    }

    let userData: UserPayload;

    try {
        userData = jwtDecode<UserPayload>(payloadToken);
    } catch {
        return redirect('/');
    }

    if (!userData?.id) return redirect('/');

    const payload = await getPayload({ config: configPromise });

    const profileData = await payload.find({
        collection: "profiles",
        where: { user: { equals: userData.id } },
    });

    if (!profileData || profileData.docs.length === 0) return redirect('/');

    return (
        <div className="relative flex flex-col justify-center items-center mb-6 py-2 px-4 sm:px-6 lg:px-8">
            <MarqueeHeading text="Create a new blog post" />
            <MarkdownEditor
                data={profileData}
                isEditMode={false}
            />
        </div>
    );
}
import { getPayload } from "payload"
import configPromise from '@payload-config';
import BlogTitle from "./components/BlogTitle";
import BlogContent from "./components/BlogContent";
import { getUserData } from "@/actions/getUserData";


type Args = {
    params: Promise<{
        slug?: string
    }>
}

export default async function Page({ params: paramsPromise }: Args) {
    const { slug } = await paramsPromise

    const payload = await getPayload({ config: configPromise })
    const data = await payload.find({
        collection: 'userblog',
        where: {
            slug: {
                equals: slug
            }
        }
    })


    const user = await getUserData()

    const profile = await payload.find({
        collection: 'profiles',
        where: {
            user: {
                equals: user?.id
            }
        }
    })

    const comments = await payload.find({
        collection: 'comments',
        where: {
            post: {
                equals: data?.docs?.[0]?.id
            }
        }
    })



    return (
        <div className="flex flex-col w-full">
            <BlogTitle data={data} />
            <BlogContent data={data} profile={profile} comments={comments} />
        </div>
    );
}
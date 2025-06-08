import { getUserData } from "@/actions/getUserData"
import configPromise from "@payload-config"
import { getPayload } from "payload"
import Dashboard from "./components/Dashboard"
import { PageProps } from ".next/types/app/(frontend)/dashboard/page"
import { redirect } from "next/navigation"

export default async function page({ searchParams }: PageProps) {

    const { query } = await searchParams;
    const searchQuery = query || ""


    const sessionUser = await getUserData()


    const payload = await getPayload({ config: configPromise })

    const data = await payload.find({
        collection: 'profiles',
        where: {
            user: {
                equals: sessionUser?.id
            },

        }
    })
    if (data.docs.length === 0) {
        return redirect("/login?redirectTo=/dashboard")
    }



    const blog = await payload.find({
        collection: 'userblog',
        where: {
            profile: {
                equals: data?.docs?.[0]?.id
            },
            ...(searchQuery && {
                or: [
                    { title: { like: searchQuery } },
                    { description: { like: searchQuery } },
                    { content: { like: searchQuery } },
                    { "profile.firstname": { like: searchQuery } },
                    { "profile.lastname": { like: searchQuery } },
                    { "profile.username": { like: searchQuery } }
                ]
            })
        },
        limit: 1000
    })




    return (
        <div className="relative flex flex-[1] flex-col items-center py-2 px-4 sm:px-6 lg:px-8 max-w-none">
            <Dashboard data={data} blog={blog} />
        </div>
    )
}
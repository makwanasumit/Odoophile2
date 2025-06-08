import { PageProps } from ".next/types/app/(frontend)/reading-list/page"
import { getUserData } from "@/actions/getUserData"

import BlogCard2 from "@/components/BlogCard/BlogCard2"
import { Pagination } from "@/components/Pagination"
import configPromise from "@payload-config"
import { redirect } from "next/navigation"
import { getPayload } from "payload"

export default async function Page({ params, searchParams }: PageProps) {
    const { number } = await params;
    const { query } = await searchParams;
    const pageNumber = number ? Math.max(1, parseInt(number, 10)) : 1
    const searchQuery = query || ""

    const payload = await getPayload({ config: configPromise })

    const sessionUser = await getUserData()


    const profile = await payload.find({
        collection: "profiles",
        where: {
            user: {
                equals: sessionUser?.id
            }
        }
    })

    if (profile.docs.length === 0) {
        return redirect("/login?redirectTo=/reading-list")
    }



    const blogs = await payload.find({
        collection: "userblog",
        limit: 9,
        page: pageNumber,
        sort: "-createdAt",
        where: {
            saves: {
                contains: profile?.docs?.[0]?.id
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
        }
    });




    const currentPage = Number(blogs.page) || 1
    const totalPages = Number(blogs.totalPages) || 1


    return (
        <div className="container mx-auto">

            <BlogCard2
                blogs={blogs}
                text="Reading List"
                initialSearch={searchQuery}
                currentPage={currentPage}
                readingList={true}
            />
            <div className="my-10">
                <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    searchQuery={searchQuery}
                    readingList={true}
                />
            </div>
        </div>
    );
}
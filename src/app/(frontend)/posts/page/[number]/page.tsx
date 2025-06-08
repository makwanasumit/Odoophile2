import { PageProps } from ".next/types/app/(frontend)/posts/page/[number]/page"
import BlogCard2 from "@/components/BlogCard/BlogCard2"
import { Pagination } from "@/components/Pagination"
import configPromise from "@payload-config"
import { getPayload } from "payload"

// type Args = {
//     params: {
//         number?: string
//     },
//     searchParams?: {
//         query?: string
//     }
// }

export default async function Page({ params, searchParams }: PageProps) {


    const { number } = await params;
    const { query } = await searchParams;

    // Parse page number safely, ensuring it's always a valid number
    const pageNumber = number ? Math.max(1, parseInt(number, 10)) : 1
    const searchQuery = query || ""

    const payload = await getPayload({ config: configPromise })

    // Use Payload's query functionality for searching
    const blogs = await payload.find({
        collection: "userblog",
        limit: 9,
        page: pageNumber,
        sort: "-createdAt",
        where: searchQuery ? {
            or: [
                {
                    title: { like: searchQuery }
                },
                {
                    description: { like: searchQuery }
                },
                {
                    content: { like: searchQuery }
                },
                {
                    "profile.firstname": { like: searchQuery }
                },
                {
                    "profile.lastname": { like: searchQuery }
                },
                {
                    "profile.username": { like: searchQuery }
                }
            ]
        } : undefined,
    })


    // Ensure these values are numbers for TypeScript
    const currentPage = Number(blogs.page) || 1
    const totalPages = Number(blogs.totalPages) || 1

    return (
        <div className="container mx-auto">
            <BlogCard2
                blogs={blogs}
                text="Posts"
                initialSearch={searchQuery}
                currentPage={currentPage}
                readingList={false}
            />
            <div className="my-10">
                <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    searchQuery={searchQuery}
                />
            </div>
        </div>
    )
}
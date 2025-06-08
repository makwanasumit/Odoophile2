import { PageProps } from ".next/types/app/(frontend)/category/page";

import configPromise from "@payload-config";
import { getPayload } from "payload";
import Categories from "./component/Categories";

export default async function Page({ searchParams }: PageProps) {
    const { categorySlug } = await searchParams
    const searchQuery = categorySlug || "software";

    const payload = await getPayload({ config: configPromise });

    // Fetching categories
    const categories = await payload.find({
        collection: 'categories'
    });

    const blogs = await payload.find({
        collection: 'userblog',
        where: searchQuery ? {
            'categories.slug': {
                equals: searchQuery
            }
        } : {},
        sort: '-createdAt',
        depth: 10,
    });




    return (
        <div className="relative flex flex-[1] flex-col items-center py-2 px-4 sm:px-6 lg:px-8 max-w-none">
            <Categories categories={categories} blogs={blogs} />
        </div>
    )
}
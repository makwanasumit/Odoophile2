"use client"
import { Profile, Userblog } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PaginatedDocs } from 'payload'
import React, { useEffect, useState } from 'react'
import { Media } from '../Media'
import SpotlightCard from 'components/SpotlightCard/SpotlightCard'
import { RemoveFromReadingList } from '@/app/(frontend)/posts/[slug]/action/UpVote'

interface Props {
    blogs: PaginatedDocs<Userblog>
    text?: string
    initialSearch?: string
    currentPage?: number
    readingList?: boolean
    Dashboard?: boolean
}

const BlogCard: React.FC<Props> = ({ blogs, text = "", initialSearch = "", readingList = "", Dashboard = "" }) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState(initialSearch)


    // Handle  search input changes without immediate redirection
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    // Only trigger search when user stops typing
    const handleSearchSubmit = () => {
        setLoading(true)

        const params = new URLSearchParams()
        if (search.trim()) {
            params.set('query', search.trim())
        }

        // Always navigate to page 1 when search changes

        if (readingList === true) {
            router.push(`/reading-list/page/1${params.toString() ? `?${params.toString()}` : ''}`)
        }
        if (readingList === false) {
            router.push(`/posts/page/1${params.toString() ? `?${params.toString()}` : ''}`)
        }
    }


    const handleRemoveFromReadingList = async (id: string) => {
        const res = await RemoveFromReadingList({ id })
        if (res) {
            router.refresh()
        }
        return
    }



    // Handle enter key press on search input
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchSubmit()
        }
    }

    // Set search on page load to match URL
    useEffect(() => {
        setSearch(initialSearch)
        setLoading(false)
    }, [initialSearch])



    const PlaceHolderImage = '/placeholder.jpeg'

    return (
        <>
            {!Dashboard && <div className="gradient rounded-xl">
                <div className="py-12 z-10">
                    <h1 className="text-white text-8xl font-bold text-center">{text}</h1>
                </div>
            </div>}

            <div className="mt-10 flex">
                <input
                    type="text"
                    placeholder="Search your blogs..."
                    value={search}
                    onChange={handleSearch}
                    onKeyDown={handleKeyDown}
                    className="w-full p-3 rounded-lg dark:bg-gray-900 bg-gray-200 dark:text-white placeholder-gray-400 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:gradient"
                />
                <button
                    onClick={handleSearchSubmit}
                    className="blue-btn ml-2 "
                >
                    Search
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                </div>
            ) : !blogs.docs.length ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {readingList ? "No blogs found in your Reading List." : "No blogs match your search."}
                </div>
            ) : (
                <div className="container mx-auto px-4 my-10">
                    <div className="columns-1 sm:columns-2 lg:columns-4 gap-4 space-y-4">
                        {blogs.docs.map((blog) => (
                            <SpotlightCard key={blog.id} className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
                                <Link href={`/posts/${blog.slug}`} className="break-inside-avoid">
                                    <div className="bg-gray-200 border-border border-2 rounded-3xl dark:bg-gray-800 shadow-md overflow-hidden mb-4 mr-2 hover:mb-0 hover:mr-0 hover:mt-2 hover:ml-4 hover:scale-[101%] transition-all duration-200 ">
                                        {blog.coverImage ? (
                                            <Media
                                                resource={blog.coverImage}
                                                imgClassName="w-full h-auto max-h-[700px] object-contain "
                                            />

                                        ) : (
                                            <Image
                                                src={PlaceHolderImage}
                                                alt="Placeholder"
                                                width={400}
                                                height={400}
                                                className="w-full h-auto max-h-[500px] object-contain"
                                            />

                                        )}
                                        <div className="p-4">
                                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                                {blog.title}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-400">{blog.description}</p>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {(blog.profile as Profile).firstname && (blog.profile as Profile).lastname
                                                    ? `${(blog.profile as Profile).firstname} ${(blog.profile as Profile).lastname}`
                                                    : (blog.profile as Profile).username}
                                            </p>

                                        </div>
                                        {readingList && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault(); // prevent the link navigation
                                                    e.stopPropagation(); // stop bubbling to the link
                                                    handleRemoveFromReadingList(blog.id); // call your function
                                                }}
                                                className="text-red-600 bg-red-100 dark:bg-gray-800 dark:text-red-400 w-full py-4 hover:bg-red-500 dark:hover:bg-red-900 hover:text-white px-2 border-t border-red-600 dark:border-red-700 transition-colors duration-300"
                                            >
                                                Remove from Reading List
                                            </button>
                                        )}

                                    </div>
                                </Link>
                            </SpotlightCard>
                        ))}
                    </div>
                </div >
            )}
        </>
    )
}

export default BlogCard
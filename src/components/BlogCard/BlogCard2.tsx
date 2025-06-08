"use client"
import { RemoveFromReadingList } from '@/app/(frontend)/posts/[slug]/action/UpVote'
import { Profile, Userblog } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { PaginatedDocs } from 'payload'
import React, { useEffect, useState } from 'react'
import { Media } from '../Media'

interface Props {
    blogs: PaginatedDocs<Userblog>
    text?: string
    initialSearch?: string
    currentPage?: number
    readingList?: boolean
    Dashboard?: boolean
    varient?: string
    profile?: PaginatedDocs<Profile>
}

const BlogCard2: React.FC<Props> = ({ blogs, text = "", initialSearch = "", readingList = false, Dashboard = false, profile, varient }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState(initialSearch || searchParams.get('query') || "")

    // Handle search input changes without immediate redirection
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    // Handle search submission
    const handleSearchSubmit = () => {
        setLoading(true)

        // Create new URLSearchParams object
        const params = new URLSearchParams()
        if (search.trim()) {
            params.set('query', search.trim())
        }

        // Determine the correct URL based on context
        let url = '';
        if (readingList) {
            url = `/reading-list/page/1${params.toString() ? `?${params.toString()}` : ''}`
        } else if (profile) {
            const username = profile.docs?.[0]?.username;
            url = `/profile/${username}${params.toString() ? `?${params.toString()}` : ''}`
        } else {
            url = `/posts/page/1${params.toString() ? `?${params.toString()}` : ''}`
        }

        // Use router.push with a shallow update
        router.push(url)
    }

    const handleRemoveFromReadingList = async (id: string) => {
        const res = await RemoveFromReadingList({ id })
        if (res) {
            router.refresh()
        }
    }

    // Handle enter key press on search input
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchSubmit()
        }
    }

    // Set search on page load to match URL and reset loading state
    useEffect(() => {
        const queryParam = searchParams.get('query') || initialSearch || ""
        setSearch(queryParam)
        setLoading(false)
    }, [searchParams, initialSearch])

    const PlaceHolderImage = '/placeholder.jpeg'

    // Function to calculate and display relative time
    const findCurrentTime = (time: string) => {
        const date = new Date(time);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());

        const diffSeconds = Math.floor(diffTime / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
        if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        return `${diffSeconds} second${diffSeconds > 1 ? 's' : ''} ago`;
    };

    return (
        <div className="w-full">
            {!Dashboard && varient !== 'profile' && (
                <div className="gradient rounded-xl shadow-lg">
                    <div className="py-12 z-10">
                        <h1 className="text-white text-8xl font-bold text-center">{text}</h1>
                    </div>
                </div>
            )}

            <div className="mt-8 max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        placeholder="Search your blogs..."
                        value={search}
                        onChange={handleSearch}
                        onKeyDown={handleKeyDown}
                        className="w-full p-3 rounded-lg dark:bg-gray-900 bg-gray-100 dark:text-white text-gray-800 placeholder-gray-400 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                    <button
                        onClick={handleSearchSubmit}
                        className="blue-btn px-6 py-3 sm:whitespace-nowrap"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                        ) : (
                            "Search"
                        )}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                </div>
            ) : !blogs.docs.length ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12 text-lg">
                    {readingList ? "No blogs found in your Reading List." : search ? `No blogs match "${search}".` : "No blogs found."}
                </div>
            ) : (
                <div className="container mx-auto px-4 my-10">
                    <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {blogs.docs.map((blog) => (
                            <Link key={blog.id} href={`/posts/${blog.slug}`} className="flex flex-col">
                                <div className="w-full p-1 rounded-xl h-[660px] border-[0.5px] border-[#8c9da5] bg-transparent hover:bg-[#D5E1E7] dark:hover:bg-[#31373A] hover:border-[#D5E1E7] dark:hover:border-[#31373A] transition-colors duration-200 flex flex-col">
                                    <div className="relative h-[450px] bg-neutral-800 rounded-xl overflow-hidden">
                                        {blog.coverImage ? (
                                            <Media
                                                fill
                                                resource={blog.coverImage}
                                                imgClassName="object-cover hover:scale-100 scale-105 transition-all duration-500"
                                            />
                                        ) : (
                                            <Image
                                                src={PlaceHolderImage}
                                                alt="Placeholder"
                                                fill
                                                className="object-cover hover:scale-100 scale-105 transition-all duration-500"
                                            />
                                        )}
                                    </div>

                                    <div className="flex flex-col h-full p-6">
                                        <div className="flex items-center gap-x-3 mb-3">
                                            <p className="font-semibold text-[#22282A] dark:text-[#D5E1E7] capitalize">
                                                {(blog.profile as Profile).firstname && (blog.profile as Profile).lastname
                                                    ? `${(blog.profile as Profile).firstname} ${(blog.profile as Profile).lastname}`
                                                    : (blog.profile as Profile).username}
                                            </p>
                                        </div>

                                        <div className="flex-grow">
                                            <h1 className="text-2xl sm:text-3xl font-semibold break-words text-[#22282A] dark:text-[#D5E1E7] line-clamp-3 mb-3">
                                                {blog.title}
                                            </h1>
                                            {blog.description && (
                                                <p className="text-sm text-[#22282A]/80 dark:text-[#D5E1E7]/80 line-clamp-3">
                                                    {blog.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-4">
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{findCurrentTime(blog.createdAt)}</p>
                                            <p className="text-xl font-mono text-[#22282A] dark:text-[#D5E1E7] mt-1">
                                                {new Date(blog.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {readingList && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleRemoveFromReadingList(blog.id);
                                            }}
                                            className="mt-4 text-red-600 bg-red-50 dark:bg-gray-800 dark:text-red-400 w-full py-2.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 font-medium text-sm flex items-center justify-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Remove from Reading List
                                        </button>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default BlogCard2
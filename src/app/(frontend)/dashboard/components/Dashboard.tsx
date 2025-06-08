"use client"
import { DeleteBlog } from '@/actions/DeleteBlog'
import MarqueeHeading from '@/components/MarqueeHeading/MarqueeHeading'
import { Media } from '@/components/Media'
import BlogsMetrics from '@/components/SocialMetrics/BlogsMetrics'
import InfluenceScoreMetrics from '@/components/SocialMetrics/InfluenceScoreMetrics'
import SocialMetrics from '@/components/SocialMetrics/SocialMetrics'
import { Profile, Userblog } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { PaginatedDocs } from 'payload'
import React, { useEffect, useRef, useState } from 'react'
import { BiComment, BiUpvote } from 'react-icons/bi'


type Props = {
    data: PaginatedDocs<Profile>
    blog: PaginatedDocs<Userblog>
}

const Dashboard: React.FC<Props> = ({ data, blog }) => {

    const modalRef = useRef<HTMLDivElement>(null)


    const profile = data?.docs?.[0]
    const localProfile = profile
    const [refreshMetrics, setRefreshMetrics] = useState(0)
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)
    const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null)
    const [selectedBlogTitle, setSelectedBlogTitle] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false)

    const router = useRouter()

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const handleSearchSubmit = () => {
        setLoading(true)

        const params = new URLSearchParams()
        if (search.trim()) {
            params.set('query', search.trim())
        }

        // Always navigate to page 1 when search changes

        router.push(`/dashboard${params.toString() ? `?${params.toString()}` : ''}`)

    }



    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchSubmit()
        }
    }

    // Function to refresh metrics
    const triggerRefresh = () => {
        setRefreshMetrics(prev => prev + 1)
    }

    // Optional: Refresh metrics on mount
    useEffect(() => {
        triggerRefresh()
    }, [])

    const searchParams = useSearchParams()

    useEffect(() => {
        const query = searchParams.get('query') || ''
        setSearch(query)
        setLoading(false)
    }, [searchParams])


    const PlaceHolderImage = '/placeholder.jpeg'



    const handleDeleteClick = (id: string, title: string) => {
        setSelectedBlogId(id)
        setSelectedBlogTitle(title)
        setShowModal(true)
    }


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setShowModal(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleConfirmDelete = async () => {
        if (selectedBlogId) {
            try {
                await DeleteBlog(selectedBlogId)

                router.refresh()

            } catch (err) {

                console.log(err)
            }
            setShowModal(false)
        }
    }


    return (
        <>
            <div className="absolute h-[150px] sm:h-[200px] top-0 left-0 gradient w-full flex items-center justify-center -z-10">
                <MarqueeHeading text="Dashboard" />
            </div>
            <div className='container mx-auto'>

                <div className="relative w-full mt-24 bg-gray-200 dark:bg-gray-800 rounded-tl-2xl rounded-lg transition-all duration-200 p-6 sm:p-8">
                    {/* Avatar */}
                    <div className="absolute w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px] h-[120px] sm:h-[150px] md:h-[180px] lg:h-[200px] border-[6px] sm:border-[8px] md:border-[10px] dark:border-gray-800 border-black bg-black rounded-full flex items-center justify-center overflow-hidden -top-[4.5rem] sm:-top-[5rem] md:-top-[6rem] lg:-top-[6.2rem] select-none focus:outline-none">
                        {profile?.avatar && typeof profile.avatar !== 'string' && 'url' in profile.avatar && profile.avatar.url ? (
                            <Image
                                className="w-full h-full object-cover"
                                src={profile.avatar.url}
                                alt={profile.username || 'Avatar'}
                                width={200}
                                height={200}
                            />
                        ) : (
                            <p className="text-white text-center">No avatar</p>
                        )}
                    </div>

                    <div className="flex mt-20 flex-wrap items-start justify-center md:justify-start gap-4">
                        {localProfile && (
                            <SocialMetrics
                                localProfile={localProfile}
                                refreshTrigger={refreshMetrics}
                                variant='dashboard'
                            />
                        )}
                        <InfluenceScoreMetrics
                            variant="dashboard"
                            showTitle={true}
                            blog={blog}
                        />
                        <BlogsMetrics blog={blog} variant="dashboard" showTitle={true} />
                    </div>
                </div>
                <div className=''>
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
                    ) : !blog?.docs.length ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No blogs found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                            {blog?.docs?.length > 0 &&
                                blog?.docs?.map((blog: Userblog) => (
                                    <Link key={blog.id} href={`/posts/${blog.slug}`} className="break-inside-avoid block h-full">
                                        <div className="bg-gray-200 border-border border-2 rounded-tl-3xl dark:bg-gray-800 shadow-md overflow-hidden mb-4 mr-2 transition-all duration-200 flex flex-col h-full">
                                            <div className="w-full h-64 overflow-hidden relative">
                                                {blog.coverImage ? (
                                                    <Media
                                                        fill
                                                        resource={blog.coverImage}
                                                        imgClassName="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Image
                                                        src={PlaceHolderImage}
                                                        alt="Placeholder"
                                                        fill
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="p-5 flex-grow">
                                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                                    {blog.title}
                                                </h2>
                                                <p className="text-gray-600 dark:text-gray-400 mb-3">{blog.description}</p>
                                                <p className="text-gray-700 dark:text-gray-300">
                                                    {(blog.profile as Profile).firstname && (blog.profile as Profile).lastname
                                                        ? `${(blog.profile as Profile).firstname} ${(blog.profile as Profile).lastname}`
                                                        : (blog.profile as Profile).username}
                                                </p>
                                            </div>
                                            <div className="flex mx-3 gap-2">
                                                <div className='gap-1 flex text-lg   items-center'>
                                                    <BiUpvote size={20} />
                                                    {blog?.upvotes?.length || 0}
                                                </div>
                                                <div className='gap-1 flex text-lg   items-center'>
                                                    <BiComment size={20} />
                                                    {blog?.comments?.length || 0}
                                                </div>
                                            </div>
                                            <div className="flex w-full gap-2 p-4 pt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        router.push(`/posts/${blog.slug}/edit`)
                                                    }}
                                                    className="blue-btn flex-1 rounded-lg py-2"
                                                    type="button"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDeleteClick(blog.id, blog.title);
                                                    }}
                                                    className="red-btn flex-1 rounded-lg py-2"
                                                    type="button"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    )}
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[90%] max-w-md shadow-xl">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Confirm Deletion</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Are you sure you want to delete <strong className='break-words '>{selectedBlogTitle}</strong>?
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </>
    )
}

export default Dashboard
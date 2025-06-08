import { Media } from '@/components/Media'
import { Media as MediaType, Profile, Userblog } from '@/payload-types'
import { PaginatedDocs } from 'payload'
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { fetchBlogs } from '@/actions/fetchBlogs'

type Props = {
    initialBlogs: PaginatedDocs<Userblog>
}

const ExploreBlog: React.FC<Props> = ({ initialBlogs }) => {
    const placeholder = '/placeholder.jpeg'
    const [blogs, setBlogs] = useState<Userblog[]>(initialBlogs.docs);
    const [page, setPage] = useState(2); // Start from page 2 since page 1 is loaded initially
    const [loading, setLoading] = useState(false);
    const [hasMoreBlogs, setHasMoreBlogs] = useState(initialBlogs.hasNextPage || false);
    const limit = initialBlogs.limit || 10; // Default limit if not provided

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

    // Function to load more blogs
    const loadMore = useCallback(async () => {
        if (loading || !hasMoreBlogs) return;
        setLoading(true);

        try {
            const next = await fetchBlogs(page, limit);

            if (next.docs && next.docs.length > 0) {
                // Filter out any duplicate blogs based on id
                const currentIds = new Set(blogs.map(blog => blog.id));
                const newBlogs = next.docs.filter(blog => !currentIds.has(blog.id));

                if (newBlogs.length > 0) {
                    setBlogs(prev => [...prev, ...newBlogs]);
                    setPage(prev => prev + 1);
                }

                // Update has more status
                setHasMoreBlogs(next.hasNextPage || false);
            } else {
                setHasMoreBlogs(false);
            }
        } catch (error) {
            console.error("Error loading more blogs:", error);
            setHasMoreBlogs(false);
        } finally {
            setLoading(false);
        }
    }, [loading, page, limit, blogs, hasMoreBlogs]);

    // Add scroll event listener to trigger loadMore
    useEffect(() => {
        const handleScroll = () => {
            // Check if we're near the bottom of the page
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
                hasMoreBlogs && !loading
            ) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMoreBlogs, loading, loadMore]);

    if (!initialBlogs || !initialBlogs.docs || initialBlogs.docs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600 dark:text-gray-300">
                <h2 className="text-xl font-semibold mb-2">No blog posts found</h2>
                <p className="text-gray-400 dark:text-gray-500">Check back later for new content</p>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {blogs.map((blog, index) => {
                const profile = blog.profile as Profile
                const authorName = getAuthorName(profile)

                // Use blog.id + index as key to ensure uniqueness
                return (
                    <article key={`${blog.id}-${index}`} className='border border-gray-400 dark:border-gray-700 transition-colors duration-300 hover:bg-[#D5E1E7] dark:hover:bg-[#31373A] p-4 rounded-lg'>
                        <Link href={`/posts/${blog.slug}`}>
                            <div className='flex flex-col md:flex-row md:space-x-10'>
                                <div className='md:flex-[3]   md:h-[400px] sm:h-[300px] h-[250px] relative w-full rounded-lg overflow-hidden'>
                                    {blog.coverImage && typeof blog.coverImage === 'object' && blog.coverImage.url ? (
                                        <Media
                                            alt={blog.title}
                                            fill
                                            resource={blog.coverImage}
                                            imgClassName='w-full h-full object-cover' />
                                    ) : (
                                        <Image
                                            src={placeholder}
                                            alt={blog.title}
                                            fill
                                            className='w-full h-full object-cover'
                                        />
                                    )}
                                </div>
                                <div className='flex-[4] flex flex-col justify-between mt-4 md:mt-0'>
                                    <div className='space-y-6' >
                                        <h2 className='font-bold text-2xl md:text-3xl break-words'>{blog.title}</h2>
                                        <h3 className='text-gray-600 dark:text-gray-400 text-lg break-words'>{blog.description}</h3>
                                    </div>
                                    <div className='mt-4'>
                                        <div>
                                            {profile && (
                                                <div className='flex items-center gap-2'>
                                                    {blog.profile && typeof blog.profile === 'object' && blog.profile.avatar ? (

                                                        <Avatar avatarId={blog.profile.avatar} />
                                                    ) : (
                                                        <div className='h-10 w-10 relative rounded-full overflow-hidden'>
                                                            <Image src="/placeholder.jpeg" alt="avatar" fill className="object-cover" />
                                                        </div>
                                                    )}
                                                    <div className='flex flex-col sm:flex-row justify-between w-full'>
                                                        <div className='flex flex-col'>
                                                            <span className='font-semibold'>{authorName}</span>
                                                            <span className='text-gray-600 dark:text-gray-400 text-sm'>{findCurrentTime(blog.createdAt)}</span>
                                                        </div>
                                                        <div className='flex gap-2 mt-2 sm:mt-0'>
                                                            <h3 className='text-gray-600 dark:text-gray-400'>
                                                                {blog.upvotes?.length || 0} UpVotes
                                                            </h3>
                                                            <h3 className='text-gray-600 dark:text-gray-400'>
                                                                {blog.comments?.length || 0} Comments
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </article>
                )
            })}

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                </div>
            )}

            {/* No more blogs message */}
            {!hasMoreBlogs && blogs.length > 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No more blogs to load
                </div>
            )}
        </div>
    )
}

// Helpers
const getAuthorName = (profile: Profile): string => {
    if (!profile) return 'Unknown Author'
    if (profile.firstname && profile.lastname) {
        return `${profile.firstname} ${profile.lastname}`
    }
    return profile.username || 'Unknown Author'
}



export default ExploreBlog

const Avatar = ({ avatarId }: { avatarId: string | MediaType }) => {
    const [mediaRes, setMediaRes] = useState<MediaType | null>(null);

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                const res = await fetch(`/api/media/${avatarId}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch avatar");
                }
                const data = await res.json();
                setMediaRes(data);
            } catch (error) {
                console.error("Error fetching avatar:", error);
            }
        };

        if (typeof avatarId === "string") {
            fetchAvatar();
        } else if (typeof avatarId === "object") {
            setMediaRes(avatarId); // if avatarId is already the full media object
        }
    }, [avatarId]);

    return (
        <div className='h-10 w-10 relative rounded-full overflow-hidden '>
            {mediaRes && (
                <Media fill imgClassName='w-full h-full object-cover' resource={mediaRes} />
            )}
        </div>
    );
};
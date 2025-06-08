"use client";
import { findFeaturedPost } from '@/actions/FindFeatured';
import LiquidChromeTextEffect from '@/components/LiquidChromText/LiquidChromText';
import { Userblog } from '@/payload-types';
import Balatro from 'Backgrounds/Balatro/Balatro';
import Image from 'next/image';
import Link from 'next/link';
import { PaginatedDocs } from 'payload';
import React, { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { BiChevronUp } from 'react-icons/bi';
import ExploreBlog from './ExploreBlog';

type Props = {
    initialBlogs: PaginatedDocs<Userblog>
}

const FeaturedPost: React.FC<Props> = ({ initialBlogs }) => {

    const [featuredPost, setFeaturedPost] = useState<Userblog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // also add type to error

    useEffect(() => {
        const loadFeaturedPost = async () => {
            try {
                setLoading(true);
                const post = await findFeaturedPost();
                setFeaturedPost(post);
            } catch (err) {
                const error = err as Error;
                console.error("Error loading featured post:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadFeaturedPost();
    }, []);


    if (loading) {
        return <LiquidChromeTextEffect className="w-full mt-40 " />



    }
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
    if (!featuredPost) return <div className="p-6">No featured post available</div>;


    return (
        <div className='relative'>
            <div className='fixed bottom-4 right-4 z-20'>

                <div className='size-14 mx-auto bg-indigo-500 hover:bg-indigo-600 rounded-lg flex items-center justify-center hover:scale-[90%] transition-all duration-300 cursor-pointer' onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <BiChevronUp size={50} />
                </div>
            </div>
            <div className="px-4 sm:px-8 md:px-20 py-6 relative h">

                <Balatro isRotate={false} mouseInteraction={true} pixelFilter={700} />

                <Link href={`/posts/${featuredPost.slug}`}>
                    <div className="relative p-4 sm:p-6 rounded-lg  hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row gap-6 hover:scale-105 bg-gray-900/90 z-10 shadow-xl">

                        {/* Image or Title Block */}
                        <div className="w-full md:w-1/2 relative overflow-hidden rounded-md">
                            {featuredPost.coverImage ? (
                                <Image
                                    src={
                                        typeof featuredPost.coverImage === 'object' &&
                                            featuredPost.coverImage &&
                                            typeof featuredPost.coverImage !== 'string' &&
                                            featuredPost.coverImage.url
                                            ? featuredPost.coverImage.url
                                            : '/default-avatar.png'
                                    }
                                    alt={featuredPost.title}
                                    width={600}
                                    height={400}
                                    className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-md"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-48 sm:h-64 md:h-80 bg-gray-800 text-center px-4">
                                    <h1 className="text-2xl sm:text-3xl font-bold line-clamp-2 break-words">
                                        {featuredPost.title}
                                    </h1>
                                </div>
                            )}

                            {/* Trending Ribbon - Fixed position across all screen sizes */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                                <div className="absolute top-4 left-0 origin-top-left -rotate-45 translate-x-[-30%] translate-y-[300%] w-52">
                                    <Marquee className="bg-yellow-300 py-1 shadow-md w-full whitespace-nowrap">
                                        <div className="flex gap-2 flex-wrap text-black font-semibold tracking-wider uppercase">
                                            {Array.from({ length: 20 }).map((_, i) => (
                                                <span key={i}>Trending</span>
                                            ))}
                                        </div>
                                    </Marquee>
                                </div>
                            </div>
                        </div>

                        {/* Text Content Block */}
                        <div className="w-full md:w-1/2 flex flex-col justify-between gap-4">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-white text-xl sm:text-2xl font-semibold line-clamp-2">{featuredPost.title}</h2>
                                <p className="text-gray-300 line-clamp-3">{featuredPost.description}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end text-sm text-gray-400 mt-4 gap-2 sm:gap-0">
                                <div>
                                    <p>
                                        {typeof featuredPost.profile === 'object'
                                            ? featuredPost.profile.firstname && featuredPost.profile.lastname
                                                ? `${featuredPost.profile.firstname} ${featuredPost.profile.lastname}`
                                                : featuredPost.profile.username
                                            : 'Anonymous'}
                                    </p>
                                    <p>
                                        {new Date(featuredPost.createdAt).toLocaleDateString("en-US", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                                <p className="text-blue-400 hover:underline font-medium">Read more →</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            <div>
                <div className='my-14'>
                    <h1 className='text-3xl font-bold'>Explore more like this</h1>
                </div>
                <div>
                    <ExploreBlog initialBlogs={initialBlogs} />
                </div>
            </div>
        </div>
    )
}

export default FeaturedPost
'use client'

import { getUserData } from '@/actions/getUserData'
import { CheckFollowing } from '@/actions/SocialActions/CheckFollowing'
import { Follow } from '@/actions/SocialActions/Follow'
import { Unfollow } from '@/actions/SocialActions/UnFollow'
import BlogCard2 from '@/components/BlogCard/BlogCard2'
import MarqueeHeading from '@/components/MarqueeHeading/MarqueeHeading'
import BlogsMetrics from '@/components/SocialMetrics/BlogsMetrics'
import InfluenceScoreMetrics from '@/components/SocialMetrics/InfluenceScoreMetrics'
import SocialMetrics from '@/components/SocialMetrics/SocialMetrics'
import { Profile, Userblog } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PaginatedDocs } from 'payload'
import React, { useEffect, useState } from 'react'
import { BiLinkExternal, BiMailSend } from "react-icons/bi"
import { BsFillCake2Fill } from "react-icons/bs"
import { FaUserMinus, FaUserPlus } from "react-icons/fa"

// Define proper type for session user
interface SessionUser {
    id: string;
    email?: string;
    // Add other properties from your user data as needed
}

type Props = {
    data: PaginatedDocs<Profile>
    blog: PaginatedDocs<Userblog>
}

const UserProfile: React.FC<Props> = ({ data, blog }) => {
    const profile = data?.docs?.[0]
    const pathname = usePathname()

    const [isFollowing, setIsFollowing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isCreator, setIsCreator] = useState(false)
    const [loadingCreator, setLoadingCreator] = useState(true)
    const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
    const [mounted, setMounted] = useState(false)
    const [refreshMetrics, setRefreshMetrics] = useState(0)


    // Set `mounted` flag for client-side rendering only
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const checkCreator = async () => {
            const user = await getUserData()
            setSessionUser(user)

            if (user?.id && typeof profile?.user !== 'string' && profile?.user?.id === user.id) {
                setIsCreator(true)
            }

            setLoadingCreator(false)

            // Check if user is following this profile
            if (user?.id && profile?.id) {
                const result = await CheckFollowing(profile.id)
                setIsFollowing(result?.isFollowing || false)
            }
        }

        if (profile?.user) {
            checkCreator()
        } else {
            setLoadingCreator(false)
        }
    }, [profile])

    if (!profile) {
        return <div className='text-center text-2xl'>Profile not found</div>
    }

    const handleFollowToggle = async () => {
        if (loading || !sessionUser || !profile?.id) return
        setLoading(true)

        try {
            const action = isFollowing ? Unfollow : Follow
            const result = await action(profile.id)

            if (result?.success) {
                setIsFollowing(!isFollowing)
                // Trigger a refresh of the social metrics
                setRefreshMetrics(prev => prev + 1)
            } else {
                console.error('Follow/Unfollow error:', result.error)
            }
        } catch (error) {
            console.error('Error toggling follow status:', error)
        } finally {
            setLoading(false)
        }
    }
    if (!mounted) return null

    const localProfile = profile

    return (
        <>
            <div className="absolute h-[150px] sm:h-[200px] top-0 left-0 gradient w-full flex items-center justify-center -z-10">
                <MarqueeHeading text="Profile" />
            </div>

            <div className="relative w-full container mt-24 bg-gray-200 dark:bg-gray-800 rounded-tl-2xl rounded-lg transition-all duration-200 p-6 sm:p-8">

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

                {/* Auth Buttons */}
                {!loadingCreator && (
                    !sessionUser ? (
                        <Link
                            href={`/login?redirectTo=${encodeURIComponent(pathname)}`}
                            className="absolute top-6 sm:top-8 right-6 sm:right-8 py-1 px-3 sm:py-2 sm:px-4 rounded bg-indigo-500 hover:bg-indigo-600 text-white text-sm sm:text-base"
                        >
                            Login to follow
                        </Link>
                    ) : isCreator ? (
                        <div className="absolute top-6 sm:top-8 right-6 sm:right-8 flex gap-2">
                            <Link href={`/profile/edit`} className="blue-btn">
                                Edit Profile
                            </Link>
                            <Link href={`/new`} className="blue-btn">
                                Create Post
                            </Link>
                        </div>
                    ) : (
                        <button
                            onClick={handleFollowToggle}
                            disabled={loading}
                            className={`absolute top-6 sm:top-8 right-6 sm:right-8 py-1 px-3 sm:py-2 sm:px-4 rounded text-sm sm:text-base flex items-center gap-2 ${isFollowing ? "bg-gray-600 hover:bg-gray-700" : "bg-indigo-500 hover:bg-indigo-600"
                                } text-white ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {loading ? (
                                <span className="animate-spin h-4 w-4 border-t-2 border-white rounded-full" />
                            ) : isFollowing ? (
                                <>
                                    <FaUserMinus /> Unfollow
                                </>
                            ) : (
                                <>
                                    <FaUserPlus /> Follow
                                </>
                            )}
                        </button>
                    )
                )}

                {/* Profile Info */}
                <div className="mt-16 sm:mt-16 md:mt-20 flex flex-col gap-4 sm:text-left">
                    <h1 className="text-xl sm:text-2xl font-bold">
                        {profile.firstname} {profile.lastname}
                    </h1>
                    <span className="dark:text-white/80 text-muted-foreground font-semibold">&#64;{profile.username}</span>
                    <p>{profile.bio || 'No bio available.'}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <BsFillCake2Fill className="dark:text-white" />
                        <span>Joined on</span>
                        <p>
                            {(typeof profile?.user !== 'string' && profile?.user?.createdAt)
                                ? new Date(profile.user.createdAt).toDateString().slice(4)
                                : "N/A"}
                        </p>

                        {/* {profile?.links?.map((item) => {
                            const linkItem = item;

                            const url = linkItem?.link?.url;
                            const mediaUrl = linkItem?.link?.media;

                            if (!url || !mediaUrl) return null;

                            return (
                                <div key={linkItem.id} className="h-[22px] w-[22px] flex items-center justify-center">
                                    <Link href={url} target="_blank" rel="noopener noreferrer">
                                        <Media
                                            imgClassName="object-cover dark:invert"
                                            resource={mediaUrl}
                                        />
                                    </Link>
                                </div>
                            );
                        })} */}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <BiLinkExternal />
                        <Link
                            href={profile?.websiteurl || "#"}
                            target="_blank"
                            className="hover:underline hover:text-indigo-500 transition-all duration-100"
                        >
                            {profile?.websiteurl || "N/A"}
                        </Link>
                    </div>
                    {profile?.displayemail && (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <BiMailSend />
                            {typeof profile.user === 'object' && profile.user && 'email' in profile.user && (
                                <Link
                                    href={`mailto:${profile.user.email}`}
                                    className="hover:text-blue-500 hover:underline transition-all duration-100"
                                >
                                    {profile.user.email}
                                </Link>
                            )}
                        </div>
                    )}
                    <div className="flex flex-wrap items-center justify-center md:justify-normal gap-2 sm:gap-3">
                        <SocialMetrics localProfile={localProfile} refreshTrigger={refreshMetrics} />
                        <InfluenceScoreMetrics
                            variant="profile"
                            showTitle={true}
                            blog={blog}
                        />
                        <BlogsMetrics blog={blog} variant="profile" showTitle={true} />
                    </div>
                    <div>
                        <BlogCard2 blogs={blog} profile={data} varient="profile" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserProfile
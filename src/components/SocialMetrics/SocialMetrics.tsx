'use client';

import { Media } from "@/components/Media";
import { Profile } from "@/payload-types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface SocialMetricsProps {
    localProfile: Profile; // Preferably define a proper type for this
    variant?: 'profile' | 'dashboard';
    showTitle?: boolean;
    onFollowStatusChange?: (status: boolean) => void;
    refreshTrigger?: number
}

// Define a type that can handle both Profile objects and string IDs
type FollowerType = string | Profile;

const SocialMetrics = ({ localProfile, variant = 'profile', showTitle = true, refreshTrigger = 0 }: SocialMetricsProps) => {
    const [onFollowerClick, setOnFollowerClick] = useState(false);
    const [onFollowingClick, setOnFollowingClick] = useState(false);
    const [profileData, setProfileData] = useState<Profile>(localProfile);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const followers = Array.isArray(profileData.followers) ? profileData.followers : [];
    const following = Array.isArray(profileData.following) ? profileData.following : [];

    // Refresh profile data when refreshTrigger changes
    useEffect(() => {
        const refreshProfileData = async () => {
            if (refreshTrigger > 0) {
                setLoading(true);
                try {
                    // Fetch updated profile data
                    const response = await fetch(`/api/profiles?where[id][equals]=${profileData.id}`);
                    const data = await response.json();

                    if (data?.docs?.[0]) {
                        setProfileData(data.docs[0]);
                    }
                } catch (error) {
                    console.error('Error refreshing profile data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        refreshProfileData();
    }, [refreshTrigger, profileData.id]);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setOnFollowerClick(false);
                setOnFollowingClick(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const followerClick = () => {
        setOnFollowerClick(!onFollowerClick);
        setOnFollowingClick(false);
    };

    const followingClick = () => {
        setOnFollowerClick(false);
        setOnFollowingClick(!onFollowingClick);
    };

    const containerClasses = `
  bg-gray-900 text-white 
  p-4 sm:p-6 
  rounded-xl shadow-lg 
  w-full sm:w-auto 
  flex-1 
  min-w-[240px] 
  max-w-full
  ${variant === 'dashboard' ? 'mt-4' : ''}
`;


    // Function to check if an item is a Profile object
    const isProfileObject = (item: FollowerType): item is Profile => {
        return typeof item === 'object' && item !== null && 'username' in item;
    };

    return (
        <>
            <div className={containerClasses}>
                {showTitle && (
                    <h2 className="text-lg sm:text-xl font-semibold mb-4">Social Metrics</h2>
                )}
                <div className="flex justify-between gap-4">
                    <div onClick={followerClick} className="cursor-pointer text-center sm:text-left">
                        <p className="text-2xl sm:text-3xl font-bold">
                            {loading ? (
                                <span className="inline-block w-8 h-8 animate-pulse bg-gray-700 rounded"></span>
                            ) : followers.length}
                        </p>
                        <p className="text-sm sm:text-base text-gray-400">Followers</p>
                    </div>
                    <div onClick={followingClick} className="cursor-pointer text-center sm:text-left">
                        <p className="text-2xl sm:text-3xl font-bold">
                            {loading ? (
                                <span className="inline-block w-8 h-8 animate-pulse bg-gray-700 rounded"></span>
                            ) : following.length}
                        </p>
                        <p className="text-sm sm:text-base text-gray-400">Following</p>
                    </div>
                </div>
            </div>

            {(onFollowerClick || onFollowingClick) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div
                        ref={modalRef}
                        className="relative bg-gray-900 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-6 max-h-[70vh] overflow-y-auto border border-white/10"
                    >
                        <button
                            onClick={() => {
                                setOnFollowerClick(false);
                                setOnFollowingClick(false);
                            }}
                            className="absolute top-4 right-4 text-gray-300 hover:text-white text-lg font-semibold"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-semibold mb-6 text-center">
                            {onFollowerClick ? "Followers" : "Following"}
                        </h2>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-gray-400">Loading...</p>
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {(onFollowerClick ? followers : following).map((user: FollowerType, idx: number) => {
                                    // Skip rendering if it's just a string ID and not a Profile object
                                    if (!isProfileObject(user)) {
                                        return null;
                                    }

                                    return (
                                        <li
                                            key={idx}
                                            className="group flex items-center gap-4 p-3 bg-gray-900/60 rounded-xl hover:bg-gray-900 transition-shadow hover:shadow-lg border border-white/10"
                                        >
                                            <Link
                                                href={`/profile/${user.username}`}
                                                className="flex items-center gap-4 w-full"
                                            >
                                                <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-indigo-400 transition-all">
                                                    {user.avatar ? (
                                                        <Media resource={user.avatar} fill />
                                                    ) : (
                                                        <Image
                                                            alt="Placeholder"
                                                            width={100}
                                                            height={100}
                                                            src="/placeholder.jpeg"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {user.firstname ? (
                                                        <>
                                                            <p className="text-lg font-medium truncate">{user.firstname}</p>
                                                            <p className="text-sm text-gray-400 truncate">{user.username}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-lg font-medium truncate">{user.username}</p>
                                                            <p className="text-sm text-gray-400 truncate">{user.username}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </Link>
                                        </li>
                                    );
                                })}

                                {(onFollowerClick && followers.filter(isProfileObject).length === 0) ||
                                    (onFollowingClick && following.filter(isProfileObject).length === 0) ? (
                                    <li className="text-center py-8 text-gray-400">
                                        {onFollowerClick
                                            ? "No followers yet"
                                            : "Not following anyone yet"}
                                    </li>
                                ) : null}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default SocialMetrics;
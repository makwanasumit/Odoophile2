"use client"
import MarqueeHeading from '@/components/MarqueeHeading/MarqueeHeading'
import { Category, Userblog } from '@/payload-types'
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from 'next/navigation'
import { PaginatedDocs } from 'payload'
import React, { useEffect, useState } from 'react'
import CategoryCard from './CategoryCard/CategoryCard'
import LiquidChromeTextEffect from '@/components/LiquidChromText/LiquidChromText'
// import FeaturedPostCard from './FeaturedPostCard' // for featuredPost

type Props = {
    categories: PaginatedDocs<Category>
    blogs: PaginatedDocs<Userblog>
}

const Categories: React.FC<Props> = ({ categories, blogs }) => {
    const [selectedTab, setSelectedTab] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const categorySlugFromUrl = searchParams.get("categorySlug");

    useEffect(() => {
        try {
            if (categorySlugFromUrl) {
                const category = categories.docs.find(
                    (tab) => tab.slug === categorySlugFromUrl
                );
                if (category) {
                    setSelectedTab(category.title);
                }
            } else if (categories.docs.length > 0) {
                const firstDoc = categories.docs[0];
                if (firstDoc) {
                    setSelectedTab(firstDoc.title);
                }
            }

            // Simulate loading/fetching featured post (adjust if from props or async call)

            setLoading(false); // ✅ Done loading
        } catch (err) {
            setError(err + "Something went wrong");
            setLoading(false);
        }
    }, [categories.docs, categorySlugFromUrl, blogs.docs]);

    const handleClick = (tab: Category) => {
        setSelectedTab(tab.title);
        const params = new URLSearchParams();
        if (tab.slug) {
            params.set("categorySlug", tab.slug.trim());
        }
        router.push(`/category?${params.toString()}`);
    };

    const currentTab = categories.docs.find(tab => tab.title === selectedTab);

    // Conditional UI states
    if (loading) {
        return <LiquidChromeTextEffect className="w-full mt-40" />
    }

    if (error) {
        return <div className="p-6 text-red-500">Error: {error}</div>;
    }

    return (
        <>
            <div className="absolute h-[150px] sm:h-[200px] top-0 left-0 gradient w-full flex items-center justify-center -z-10">
                <MarqueeHeading text="categories" />
            </div>

            <div>
                <div className='h-[150px] sm:h-[200px] top-0 w-full flex flex-col items-center justify-center'>
                    <div className="w-full">
                        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2 bg-neutral-800 rounded-xl sm:rounded-2xl  w-full uppercase">
                            {categories.docs.map((tab) => (
                                <li
                                    key={tab.id}
                                    onClick={() => handleClick(tab)}
                                    className={`relative text-center p-2 sm:p-4 cursor-pointer transition-all duration-300 text-sm sm:text-base ${selectedTab === tab.title
                                        ? "text-white"
                                        : "text-gray-400 hover:text-gray-200"
                                        }`}
                                    role="tab"
                                    aria-selected={selectedTab === tab.title}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            handleClick(tab);
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    {selectedTab === tab.title && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 gradient-error z-0 rounded-xl sm:rounded-2xl"
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                    <span className="relative z-10 font-semibold truncate ">
                                        {tab.title}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            {currentTab && currentTab.slug && (
                <div className="px-4 sm:px-6 lg:px-8 ">
                    <motion.div
                        key={currentTab.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className=" rounded-xl sm:rounded-2xl overflow-hidden"
                    >

                        {/* This will not have any padding/margin gap now */}
                        <div className="">
                            <CategoryCard blogs={blogs} currentTab={currentTab} />
                        </div>
                    </motion.div>

                </div>
            )}
        </>
    )
}

export default Categories
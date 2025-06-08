import CheckAuth from '@/actions/CheckAuth'
import { Media } from '@/components/Media'
import { Category, Userblog } from '@/payload-types'
import { motion } from "framer-motion"
import { Pen, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PaginatedDocs } from 'payload'
import React from 'react'


type Props = {
    blogs: PaginatedDocs<Userblog>
    currentTab: Category
}

const CategoryCard: React.FC<Props> = ({ blogs, currentTab }) => {

    const blog = blogs?.docs

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


    const pathname = usePathname()

    const checkAuth = async () => {
        await CheckAuth(pathname)
    }


    return (
        <div className=''>
            <div className="container mx-auto ">
                <h1 className='py-10 text-4xl md:text-5xl lg:text-7xl font-bold text-[#22282A] dark:text-neutral-200'>{currentTab.description}</h1>
            </div>
            <div className=' rounded-t-[3rem]'>

                <div className='container mx-auto'>
                    {/* Use flexbox grid layout for responsive columns */}
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {blog.map((blog, index) => (
                            <Link key={index} href={`posts/${blog.slug}`} className='flex flex-col'>
                                <div className='w-full p-1 rounded-xl h-[660px] border-[0.5px] border-[#8c9da5] bg-transparent hover:bg-[#D5E1E7] dark:hover:bg-[#31373A] hover:border-[#D5E1E7] dark:hover:border-[#31373A] transition-colors duration-200 flex flex-col'>

                                    <div className='relative h-[250px] bg-neutral-800 rounded-xl overflow-hidden'>
                                        <Media resource={blog.coverImage} fill imgClassName='object-cover hover:scale-100 scale-105 transition-all duration-500' />
                                    </div>

                                    <div className='flex flex-col gap-2 mt-4 flex-1 mx-10'>
                                        <div className='flex-[2]'>
                                            <div className="flex flex-wrap gap-2">
                                                {blog.categories?.some((category: string | Category) =>
                                                    typeof category === 'string' ? category === currentTab.title : category.title === currentTab.title
                                                ) && (
                                                        <span className="text-xs md:text-sm lg:text-base uppercase font-serif bg-[#F5FCFF] dark:bg-[#31373A] text-[#22282A] dark:text-[#D5E1E7] py-1 px-2 rounded-[7px]">
                                                            {currentTab.title}
                                                        </span>
                                                    )}

                                                {/* Show additional categories if there are more than 1 */}
                                                {blog.categories && blog.categories.length > 1 && (
                                                    <span className="text-xs md:text-sm lg:text-base flex gap-1 items-center uppercase font-bold bg-transparent border-[0.5px] border-[#8c9da5] py-1 px-2 text-[#22282A] dark:text-[#D5E1E7] rounded-[7px]">
                                                        <Plus size={14} /><h3>{blog.categories.length - 1}</h3>
                                                    </span>
                                                )}

                                            </div>
                                        </div>
                                        <div className='flex-[7]'>
                                            <h1 className='text-5xl font-semibold break-words text-[#22282A] dark:text-[#D5E1E7] group-hover:text-[#22282A] dark:group-hover:text-[#F5FCFF] line-clamp-4'>
                                                {blog.title}
                                            </h1>
                                        </div>
                                        <div className='flex-[2]'>
                                            <div className="mt-auto">
                                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{findCurrentTime(blog.createdAt)}</p>
                                                <p className="text-sm md:text-2xl font-mono text-[#22282A] dark:text-[#D5E1E7] mt-1 md:mt-2">
                                                    {new Date(blog.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                        ))}
                        <div onClick={checkAuth} className='flex flex-col'>
                            <div className='w-full p-1 rounded-xl h-[660px] border-[0.5px] border-[#8c9da5] bg-transparent hover:bg-[#D5E1E7] dark:hover:bg-[#31373A] hover:border-[#D5E1E7] dark:hover:border-[#31373A] transition-colors duration-200 flex flex-col justify-center items-center gap-10'>
                                <div className='size-32 flex items-center justify-center border-dashed border-[2px] border-[#22282A] dark:border-[#D5E1E7]'>
                                    <motion.div
                                        initial={{ rotate: -10 }}
                                        whileHover={{
                                            rotate: -45,
                                            scale: 1.2,
                                            transition: { duration: 1, repeat: Infinity, repeatType: "loop" }
                                        }}
                                    >
                                        <Pen size={50} color='currentColor' className="text-[#22282A] dark:text-[#D5E1E7]" />
                                    </motion.div>
                                </div>
                                <h2 className='text-[#22282A] dark:text-[#D5E1E7] uppercase'>
                                    Create new
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CategoryCard
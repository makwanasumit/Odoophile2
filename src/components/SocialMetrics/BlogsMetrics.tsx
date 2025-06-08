import { Userblog } from '@/payload-types'
import { useRouter } from 'next/navigation'
import { PaginatedDocs } from 'payload'
import React, { useEffect, useState } from 'react'

type Props = {
    blog: PaginatedDocs<Userblog> | null
    variant?: 'dashboard' | 'profile'
    showTitle?: boolean
}

const BlogsMetrics: React.FC<Props> = ({ blog, variant = "", showTitle }) => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const blogDocs = blog?.docs || [];

    useEffect(() => {
        setLoading(!blog || !Array.isArray(blog.docs));
    }, [blog]);

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

    return (
        <div className={`${containerClasses} flex justify-between items-center`}>
            <div className=''>
                {showTitle && (
                    <h2 className="text-lg sm:text-xl font-semibold mb-4">Total Blogs</h2>
                )}
                <div className="flex justify-between gap-4">
                    <div className="cursor-pointer text-center sm:text-left">
                        <p className="text-2xl sm:text-3xl font-bold">
                            {loading ? (
                                <span className="inline-block w-8 h-8 animate-pulse bg-gray-700 rounded"></span>
                            ) : (
                                blogDocs.length
                            )}
                        </p>
                        <p className="text-sm sm:text-base text-gray-400">Blogs</p>
                    </div>
                </div>
            </div>
            {variant === 'dashboard' &&
                <div onClick={() => { router.push('/new') }} className='py-4 blue-btn w-1/2 rounded-lg flex justify-center items-center gap-2 cursor-pointer'>
                    <h1 className='text-xl font-semibold'>Create Blog</h1>
                </div>
            }
        </div>
    );
};

export default BlogsMetrics;

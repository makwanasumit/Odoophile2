"use client"
import { Userblog } from '@/payload-types';
import { PaginatedDocs } from 'payload';
import React, { useEffect, useState } from 'react';

interface InfluenceMetrics {
    upvoteCount: number;
    commentCount: number;
    saveCount: number;
}

interface Props {
    blog?: PaginatedDocs<Userblog> | null;
    variant?: 'dashboard' | 'profile';
    showTitle?: boolean;
}

const InfluenceScoreMetrics: React.FC<Props> = ({ blog, variant = 'profile', showTitle = true }) => {
    const [metrics, setMetrics] = useState<InfluenceMetrics>({
        upvoteCount: 0,
        commentCount: 0,
        saveCount: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Set loading state when processing data
        setLoading(true);

        try {
            const blogDocs = blog?.docs || [];

            let totalUpvotes = 0;
            let totalComments = 0;
            let totalSaves = 0;

            blogDocs.forEach((blogItem) => {
                // Handle upvotes
                if (blogItem.upvotes) {
                    totalUpvotes += Array.isArray(blogItem.upvotes)
                        ? blogItem.upvotes.length
                        : typeof blogItem.upvotes === 'number'
                            ? blogItem.upvotes
                            : 0;
                }

                // Handle saves
                if (blogItem.saves) {
                    totalSaves += Array.isArray(blogItem.saves)
                        ? blogItem.saves.length
                        : typeof blogItem.saves === 'number'
                            ? blogItem.saves
                            : 0;
                }

                // Handle comments
                if (blogItem.comments) {
                    totalComments += Array.isArray(blogItem.comments)
                        ? blogItem.comments.length
                        : typeof blogItem.comments === 'number'
                            ? blogItem.comments
                            : 0;
                }
            });

            setMetrics({
                upvoteCount: totalUpvotes,
                commentCount: totalComments,
                saveCount: totalSaves
            });
        } catch (error) {
            console.error('Error calculating influence metrics:', error);
        } finally {
            setLoading(false);
        }
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
        <div className={containerClasses}>
            {showTitle && (
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Influence Score</h2>
            )}
            <div className="flex justify-between gap-4">
                <div className="cursor-pointer text-center sm:text-left">
                    <p className="text-2xl sm:text-3xl font-bold">
                        {loading ? (
                            <span className="inline-block w-8 h-8 animate-pulse bg-gray-700 rounded"></span>
                        ) : metrics.upvoteCount}
                    </p>
                    <p className="text-sm sm:text-base text-gray-400">Upvotes</p>
                </div>
                <div className="cursor-pointer text-center sm:text-left">
                    <p className="text-2xl sm:text-3xl font-bold">
                        {loading ? (
                            <span className="inline-block w-8 h-8 animate-pulse bg-gray-700 rounded"></span>
                        ) : metrics.commentCount}
                    </p>
                    <p className="text-sm sm:text-base text-gray-400">Comments</p>
                </div>
                <div className="cursor-pointer text-center sm:text-left">
                    <p className="text-2xl sm:text-3xl font-bold">
                        {loading ? (
                            <span className="inline-block w-8 h-8 animate-pulse bg-gray-700 rounded"></span>
                        ) : metrics.saveCount}
                    </p>
                    <p className="text-sm sm:text-base text-gray-400">Saves</p>
                </div>
            </div>
        </div>
    );
};

export default InfluenceScoreMetrics;
"use client"
import { Comment as PayloadComment, Profile, Userblog } from '@/payload-types';
import { PaginatedDocs } from 'payload';
import React, { useEffect, useState } from 'react';
import { SaveComment } from '../action/UpVote';
import { ChevronDown, ChevronUp, Reply } from 'lucide-react';
import Image from 'next/image';

type Props = {
    data: PaginatedDocs<Userblog>;
    profile: PaginatedDocs<Profile>;
    comments: PaginatedDocs<PayloadComment>;
};

const BlogComments: React.FC<Props> = ({ data: newdata, profile: newProfile, comments: newComments }) => {
    const blog = newdata?.docs?.[0];
    const profile = newProfile?.docs?.[0];
    const initialComments = newComments?.docs || [];

    const [comments, setComments] = useState(initialComments);
    const [comment, setComment] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
    }, [comments]);

    if (!blog || !profile) {
        return <div className="text-center py-10 text-gray-600 dark:text-gray-300">Loading blog or profile data...</div>;
    }

    const handleSave = async () => {
        if (!comment.trim()) return;

        try {
            const newComment = await SaveComment({
                comment,
                blog: { id: blog.id },
                profile,
                parent: null,
            });

            setComments((prev) => [newComment as PayloadComment, ...prev]);
            setComment('');
            setExpanded(false);
        } catch (error) {
            console.error('Error saving comment:', error);
        }
    };

    const handleReply = async (parentId: string) => {
        if (!replyText.trim()) return;

        try {
            const newReply = await SaveComment({
                comment: replyText,
                blog: { id: blog.id },
                profile,
                parent: parentId,
            });

            setComments((prev) => [newReply as PayloadComment, ...prev]);
            setReplyText('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Error saving reply:', error);
        }
    };

    const hasReplies = (parentId: string) => {
        return comments.some((c) =>
            typeof c.parent === 'object' ? c.parent?.id === parentId : c.parent === parentId
        );
    };

    const toggleReplies = (parentId: string) => {
        setExpandedReplies((prev) => ({
            ...prev,
            [parentId]: !prev[parentId],
        }));
    };

    const renderReplies = (parentId: string, depth = 1) => {
        if (depth > 10) return null;

        const replies = comments.filter((c) =>
            typeof c.parent === 'object' ? c.parent?.id === parentId : c.parent === parentId
        );

        if (replies.length === 0) return null;

        const isExpanded = expandedReplies[parentId];

        if (!isExpanded) {
            return (
                <div className="ml-6 mt-2 mb-2">
                    <button
                        onClick={() => toggleReplies(parentId)}
                        className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                    >
                        <ChevronDown size={16} />
                        Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                    </button>
                </div>
            );
        }

        return (
            <div className="mt-3">
                <div className="flex items-center gap-1 ml-6 mb-2">
                    <button
                        onClick={() => toggleReplies(parentId)}
                        className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                    >
                        <ChevronUp size={16} />
                        Hide {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                    </button>
                </div>

                {replies.map((reply) => (
                    <div key={reply.id} className={`ml-${depth * 4} mt-4 flex items-start gap-3`}>
                        <Image
                            src={
                                reply.author &&
                                    typeof reply.author !== 'string' &&
                                    reply.author.avatar &&
                                    typeof reply.author.avatar !== 'string' &&
                                    reply.author.avatar.url
                                    ? reply.author.avatar.url
                                    : '/placeholder.jpeg'
                            }
                            width={36}
                            height={36}
                            alt="avatar"
                            className="rounded-full h-[40px] w-[40px] object-cover shrink-0 mt-2 ml-4"
                        />

                        <div className="w-full bg-gray-100 dark:bg-[#1e293b] rounded-xl px-4 py-3 shadow-sm">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                {reply.author && typeof reply.author !== 'string'
                                    ? reply.author.firstname && reply.author.lastname
                                        ? `${reply.author.firstname} ${reply.author.lastname}`
                                        : reply.author.username
                                    : 'Unknown Author'}
                            </p>

                            <p className="text-sm text-gray-700 dark:text-gray-200 mt-1 break-all">{reply.text}</p>

                            {depth < 10 && (
                                <div className="flex items-center gap-3 mt-2 text-sm text-blue-500">
                                    <button
                                        onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                                        className="flex items-center gap-1 hover:underline"
                                    >
                                        <Reply size={14} /> Reply
                                    </button>
                                </div>
                            )}

                            {replyingTo === reply.id && (
                                <div className="mt-3">
                                    <textarea
                                        className="w-full p-2 rounded-lg bg-gray-200 dark:bg-[#0f172a] text-gray-800 dark:text-gray-200 resize-none outline-none border border-gray-300 dark:border-gray-600"
                                        placeholder="Write a reply..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                    <div className="flex mt-2">
                                        <button className="blue-btn" onClick={() => handleReply(reply.id)}>
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            )}

                            {hasReplies(reply.id) && renderReplies(reply.id, depth + 1)}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const parentComments = comments.filter((c) => !c.parent);

    return (
        <div className="container mx-auto px-4">
            <div className="relative w-full">
                <div className="relative break-words whitespace-pre-wrap bg-gray-200 dark:bg-[#0f172a] text-gray-800 dark:text-gray-200 rounded-xl p-4 sm:p-6 md:p-8 shadow dark:shadow-md mx-auto my-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-2xl">
                        <h1 className="font-bold">Top comments</h1>
                        <span>&#40;{comments.length}&#41;</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-start cursor-pointer" onClick={() => setExpanded(true)}>
                            <Image
                                src={
                                    (typeof profile?.avatar === 'string'
                                        ? profile.avatar
                                        : profile?.avatar?.url) || '/placeholder.jpeg'
                                }
                                width={40}
                                height={40}
                                alt="avatar"
                                className="rounded-full h-[40px] w-[40px] object-cover shrink-0 mt-1"
                            />

                            {!expanded ? (
                                <div className="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#1e293b] rounded-lg px-4 py-3 w-full">
                                    Add a comment...
                                </div>
                            ) : (
                                <div className="flex-1 w-full">
                                    <textarea
                                        placeholder="Write your comment..."
                                        className="w-full h-20 p-2 rounded-lg bg-gray-200 dark:bg-[#0f172a] text-gray-800 dark:text-gray-200 resize-none outline-none border border-gray-300 dark:border-gray-600"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                    <div className="flex mt-2">
                                        <button className="blue-btn" onClick={handleSave}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {parentComments.map((comment) => (
                            <div key={comment.id} className="flex flex-col gap-2">
                                <div className="flex gap-2 items-start">
                                    <Image
                                        src={
                                            comment.author &&
                                                typeof comment.author !== 'string' &&
                                                comment.author.avatar &&
                                                typeof comment.author.avatar !== 'string' &&
                                                comment.author.avatar.url
                                                ? comment.author.avatar.url
                                                : '/placeholder.jpeg'
                                        }
                                        width={36}
                                        height={36}
                                        alt="avatar"
                                        className="rounded-full h-[40px] w-[40px] object-cover shrink-0 mt-2 ml-4"
                                    />
                                    <div className="flex-1 w-full bg-gray-100 dark:bg-[#1e293b] rounded-lg">
                                        <div className="px-4 py-3">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                {comment.author && typeof comment.author !== 'string'
                                                    ? comment.author.firstname && comment.author.lastname
                                                        ? `${comment.author.firstname} ${comment.author.lastname}`
                                                        : comment.author.username
                                                    : 'Unknown Author'}
                                            </p>
                                            <p className="text-gray-800 break-all dark:text-gray-200">{comment.text}</p>
                                        </div>
                                        <div className="flex gap-2 px-4 pb-3 text-sm text-blue-500">
                                            <button
                                                onClick={() =>
                                                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                                                }
                                                className="flex items-center gap-1 hover:underline"
                                            >
                                                <Reply size={16} /> Reply
                                            </button>
                                        </div>

                                        {replyingTo === comment.id && (
                                            <div className="px-4 pb-3">
                                                <textarea
                                                    className="w-full p-2 rounded-lg bg-gray-200 dark:bg-[#0f172a] text-gray-800 dark:text-gray-200 resize-none outline-none border border-gray-300 dark:border-gray-600"
                                                    placeholder="Write a reply..."
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                />
                                                <div className="flex mt-2">
                                                    <button
                                                        className="blue-btn"
                                                        onClick={() => handleReply(comment.id)}
                                                    >
                                                        Reply
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {hasReplies(comment.id) && renderReplies(comment.id)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogComments;

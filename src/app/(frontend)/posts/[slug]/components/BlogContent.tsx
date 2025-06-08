"use client"
import { getUserData } from '@/actions/getUserData';
import { Comment as PayloadComment, Profile, Userblog } from '@/payload-types';
import Link from 'next/link';
import { PaginatedDocs } from 'payload';
import React, { HTMLProps, useEffect, useState } from 'react';
import { BiBookmark, BiUpvote } from 'react-icons/bi';
import Markdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import html from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { checkInitialStatus, toggleReadingList, toggleUpVote } from '../action/UpVote';
import BlogComments from './BlogComments';


SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', html);

interface SessionUser {
    id: string;
    email?: string;
    // Add other properties from your user data as needed
}

type Props = {
    data: PaginatedDocs<Userblog>
    profile: PaginatedDocs<Profile>
    comments: PaginatedDocs<PayloadComment>
}

interface CodeProps extends HTMLProps<HTMLElement> {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}


const BlogContent: React.FC<Props> = ({ data, profile, comments }) => {

    const blog = data?.docs?.[0]
    const [isCreator, setIsCreator] = useState(false)
    const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)

    const [upVoted, setUpVoted] = useState(false);
    const [inReadingList, setInReadingList] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const slug = blog?.slug


    useEffect(() => {
        if (!blog) {
            setError("Blog data is missing.");
        }
    }, [blog]);

    useEffect(() => {
        const checkCreator = async () => {
            const user = await getUserData() as SessionUser | null;
            setSessionUser(user)

            if (
                user?.id &&
                typeof blog?.user !== 'string' &&
                blog?.user?.id === user.id
            ) {
                setIsCreator(true)
            }


        }

        if (blog?.user) {
            checkCreator()
        }
    }, [blog])

    useEffect(() => {
        const init = async () => {
            if (slug) {
                const res = await checkInitialStatus({ slug });
                setUpVoted(res.isUpvoted);
                setInReadingList(res.inReadingList);
            }
        };
        init();
    }, [slug]);
    const handleUpVote = async () => {
        if (!blog?.id) return; // or show an error message
        const newState = await toggleUpVote({ id: blog.id });
        setUpVoted(newState);
    };

    const handleReadingList = async () => {
        if (!blog?.id) return; // or show an error message
        const newState = await toggleReadingList({ id: blog.id });
        setInReadingList(newState);

    };

    if (error) {
        return (
            <div className="w-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 py-8 flex items-center justify-center">
                <p className="text-center text-lg font-semibold">{error}</p>
            </div>
        );
    }




    const renderSyntaxHighlighter = (language: string, code: string) => {
        return (
            <SyntaxHighlighter
                language={language}
                style={oneDark}
                showLineNumbers
                wrapLines
                wrapLongLines
                PreTag="div"
                customStyle={{
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    backgroundColor: "#1e293b",
                    fontSize: "0.875rem",
                    overflowX: "auto",
                }}
                lineNumberStyle={{ color: "#94a3b8", marginRight: "1em" }}
            >
                {code}
            </SyntaxHighlighter>
        );
    };


    return (
        <>
            <div className="container mx-auto flex justify-center px-4">
                <div className="relative w-full">
                    <div className="relative break-words whitespace-pre-wrap bg-gray-200 dark:bg-[#0f172a] text-gray-800 dark:text-gray-200 rounded-xl p-4 sm:p-6 md:p-8 shadow dark:shadow-md mx-auto my-6 ">
                        {/* Sticky Buttons */}
                        {sessionUser && (
                            <div className="sticky top-4 z-50 flex items-center justify-between py-3 rounded-lg shadow-md mb-4">
                                <div className="flex-[1]">
                                    {isCreator && (
                                        <Link href={`/posts/${blog?.slug}/edit`} className="blue-btn">
                                            Edit Blog
                                        </Link>
                                    )}
                                </div>

                                <div className="flex gap-3 flex-[1] justify-end items-center">
                                    <button
                                        onClick={handleUpVote}
                                        className={`flex items-center justify-center p-2 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg ${upVoted
                                            ? "bg-red-600 text-white hover:bg-red-700"
                                            : "dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 bg-gray-200 text-white hover:bg-gray-700"
                                            }`}
                                    >
                                        <BiUpvote size={30} className="text-muted-foreground" color={`${upVoted ? "#fff" : "#000"}`} />
                                    </button>

                                    <button
                                        onClick={handleReadingList}
                                        className={`flex items-center justify-center p-2 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg ${inReadingList
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 bg-gray-200 text-white hover:bg-gray-700"
                                            }`}
                                    >
                                        <BiBookmark size={30} className="text-muted-foreground" color={`${inReadingList ? "#fff" : "#000"}`} />
                                    </button>

                                </div>
                            </div>
                        )}

                        {blog?.content &&
                            <Markdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    h1: (props) => <h1 className="text-4xl font-bold mb-4" {...props} />,
                                    h2: (props) => <h2 className="text-3xl font-semibold mb-3" {...props} />,
                                    h3: (props) => <h3 className="text-2xl font-medium mb-2" {...props} />,
                                    p: (props) => <p className="text-base my-2" {...props} />,
                                    strong: (props) => <strong className="font-bold" {...props} />,
                                    em: (props) => <em className="italic" {...props} />,
                                    ul: (props) => <ul className="list-disc pl-6 my-4" {...props} />,
                                    ol: (props) => <ol className="list-decimal pl-6 my-4" {...props} />,
                                    li: (props) => <li className="mb-1" {...props} />,
                                    blockquote: (props) => (
                                        <blockquote className="border-l-4 pl-4 italic my-4" {...props} />
                                    ),
                                    code: ({ inline, className, children, ...props }: CodeProps) => {
                                        const match = /language-(\w+)/.exec(className || "");
                                        const lang = match?.[1] || "";

                                        return !inline && match ? (
                                            <div className="relative my-4">
                                                <div className="absolute top-0 right-0 px-2 py-1 text-xs bg-gray-700 text-white rounded-bl z-10">
                                                    {lang}
                                                </div>
                                                {renderSyntaxHighlighter(lang, String(children).replace(/\n$/, ""))}
                                            </div>
                                        ) : (
                                            <code
                                                className="bg-gray-200 dark:bg-gray-800 text-sm px-1 py-0.5 rounded font-mono"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },
                                    a: (props) => (
                                        <a
                                            {...props}
                                            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        />
                                    ),
                                    hr: () => <hr className="my-6 border-t" />,
                                    table: (props) => (
                                        <div className="overflow-x-auto my-6">
                                            <table className="min-w-full border-collapse border" {...props} />
                                        </div>
                                    ),
                                    th: (props) => (
                                        <th className="border px-4 py-2 bg-gray-100 dark:bg-gray-800" {...props} />
                                    ),
                                    td: (props) => <td className="border px-4 py-2" {...props} />,
                                }}
                            >
                                {blog.content.replace(/```(?:\s*)\[(\w+)\]/g, "```$1") || 'No content'}
                            </Markdown>
                        }
                    </div>
                </div>
            </div>
            {sessionUser ? (
                <BlogComments data={data} profile={profile} comments={comments} />
            ) : (
                <div className='container mx-auto px-4'>
                    <div className='relative w-full'>
                        <div className='relative break-words whitespace-pre-wrap bg-gray-200 dark:bg-[#0f172a] text-gray-800 dark:text-gray-200 rounded-xl p-4 sm:p-6 md:p-8 shadow dark:shadow-md mx-auto my-6 flex flex-col gap-4'>
                            {/* Header */}
                            <div className='flex items-center gap-2 text-2xl'>
                                <h1 className='font-bold'>Top comments</h1>
                                <span>&#40;{blog?.comments?.length || 0}&#41;</span>
                            </div>
                            <div className='flex flex-col sm:flex-row sm:items-center gap-1 text-sm sm:text-base text-gray-600 dark:text-gray-400'>
                                <span>Comments are disabled for guest users.</span>
                                <Link
                                    href={`/login?redirectTo=${encodeURIComponent(`/posts/${slug}`)}`}
                                    className='text-blue-500 hover:underline'
                                >
                                    Login to read
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="my-6 flex justify-center items-center px-4">
                <Link
                    href="/posts"
                    className="blue-btn"
                >
                    Discover more
                </Link>
            </div>
        </>
    )
}

export default BlogContent
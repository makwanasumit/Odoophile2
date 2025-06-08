"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    Bold, Italic, Code, Link, Heading1, Heading2, Heading3,
    Code2, AlignRight, AlignCenter, AlignLeft, AlignJustify,
    Trash,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useRouter } from "next/navigation";
import { PaginatedDocs } from 'payload';
import { Profile, Userblog } from '@/payload-types';
import Image from "next/image";
import { UpdateBlog } from "@/actions/Blog/UpdateBlog";
import { SaveBlog } from "@/actions/Blog/SaveBlog";
import { Media } from "../Media";

type Props = {
    data: PaginatedDocs<Profile>;
    blogPosts?: PaginatedDocs<Userblog>; // Add proper typing when available
    isEditMode?: boolean;
}

const MarkdownEditor: React.FC<Props> = ({ data, blogPosts, isEditMode }) => {

    const blogPost = blogPosts?.docs[0] || null;
    // Extract profile information
    const profile = data?.docs[0] || null;
    const userData = profile?.user;
    // const username = profile?.username || '';

    // References
    const titleRef = useRef<HTMLTextAreaElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    // State
    const [markdown, setMarkdown] = useState<string>("");
    const [processedMarkdown, setProcessedMarkdown] = useState<string>("");
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [cursorPosition, setCursorPosition] = useState<{ start: number, end: number }>({ start: 0, end: 0 });
    const [editorHeight, setEditorHeight] = useState<string>("100px");

    const [formData, setFormData] = useState({
        id: blogPost?.id || "",
        title: blogPost?.title || "",
        description: blogPost?.description || "",
        coverImage: blogPost?.coverImage || "",
        content: blogPost?.content || "",
        profile: profile?.id || "",
        userData: {
            id: userData && typeof userData === 'object' ? userData.id || "" : ""
        }
    });


    // Initialize data from blog post if in edit mode
    const router = useRouter();

    // Initialize data from blog post if in edit mode
    useEffect(() => {
        if (isEditMode && blogPost) {
            if (blogPost.content) {
                setMarkdown(blogPost.content);
            }
            // Don't set imagePreview here - we'll handle displaying existing image separately
        }
    }, [isEditMode, blogPost]);

    // Process markdown for rendering
    useEffect(() => {
        // Convert syntax highlighting notation for proper rendering
        const converted = markdown.replace(/```(?:\s*)\[(\w+)\]/g, "```$1");
        setProcessedMarkdown(converted);
        setFormData(prev => ({ ...prev, content: markdown }));
    }, [markdown]);

    // Calculate editor height based on window size
    useEffect(() => {
        const calculateEditorHeight = () => {
            const windowHeight = window.innerHeight;
            const headerHeight = 220; // Adjust for title and description
            const toolbarHeight = 60;
            const footerPadding = 100;
            const availableHeight = windowHeight - headerHeight - toolbarHeight - footerPadding;
            setEditorHeight(`${Math.max(300, availableHeight)}px`);
        };

        calculateEditorHeight();
        window.addEventListener("resize", calculateEditorHeight);

        return () => window.removeEventListener("resize", calculateEditorHeight);
    }, []);


    // Auto-resize textareas
    const autoResizeTextareas = useCallback(() => {
        const elements = [
            { ref: titleRef.current, minHeight: 40 },
            { ref: descriptionRef.current, minHeight: 40 },
        ];

        elements.forEach(({ ref, minHeight }) => {
            if (!ref) return;

            // Reset height to auto to get proper scrollHeight
            ref.style.height = "auto";

            // Set height to max of minHeight or scrollHeight
            const newHeight = Math.max(minHeight, ref.scrollHeight);
            ref.style.height = `${newHeight}px`;
        });
    }, []);

    // Initial auto-resize for textareas
    useEffect(() => {
        autoResizeTextareas();
    }, [autoResizeTextareas, formData.title, formData.description, markdown]);

    // Handle text insertion with cursor position preservation
    const insertText = useCallback((
        beforeSelection: string,
        afterSelection: string = beforeSelection,
        defaultText: string = ""
    ) => {
        const editor = editorRef.current;
        if (!editor) return;

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selected = markdown.slice(start, end) || defaultText;

        // Check if the selection is already wrapped
        const beforeText = markdown.slice(Math.max(0, start - beforeSelection.length), start);
        const afterText = markdown.slice(end, Math.min(markdown.length, end + afterSelection.length));
        const isWrapped = beforeText === beforeSelection && afterText === afterSelection;

        let newMarkdown;
        let newCursorStart;
        let newCursorEnd;

        if (isWrapped) {
            // If already wrapped, remove the wrapping
            newMarkdown =
                markdown.slice(0, start - beforeSelection.length) +
                selected +
                markdown.slice(end + afterSelection.length);

            newCursorStart = start - beforeSelection.length;
            newCursorEnd = newCursorStart + selected.length;
        } else {
            // Wrap the selection
            newMarkdown =
                markdown.slice(0, start) +
                beforeSelection +
                selected +
                afterSelection +
                markdown.slice(end);

            newCursorStart = start + beforeSelection.length;
            newCursorEnd = newCursorStart + selected.length;
        }

        setMarkdown(newMarkdown);

        // Save cursor position to restore after state update
        setCursorPosition({ start: newCursorStart, end: newCursorEnd });
    }, [markdown]);

    // Restore cursor position after state updates
    useEffect(() => {
        if (cursorPosition.start !== cursorPosition.end && !showPreview && editorRef.current) {
            // Only restore if not in preview mode
            const editor = editorRef.current;
            editor.focus();
            editor.setSelectionRange(cursorPosition.start, cursorPosition.end);
        }
    }, [cursorPosition, showPreview]);

    // Handle heading levels
    const setHeading = useCallback((level: 1 | 2 | 3) => {
        const editor = editorRef.current;
        if (!editor) return;

        const start = editor.selectionStart;
        const text = markdown;

        // Find the beginning of the current line
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;

        // Get the entire line
        const lineEnd = text.indexOf('\n', start);
        const currentLine = text.slice(
            lineStart,
            lineEnd > -1 ? lineEnd : text.length
        );

        // Determine current heading level if any
        const headingMatch = currentLine.match(/^(#{1,3})\s/);
        const currentHeading = headingMatch ? headingMatch[1] : "";
        const targetHeading = "#".repeat(level);

        let newLine;
        if (currentHeading === targetHeading) {
            // Remove heading if same level
            newLine = currentLine.replace(/^#{1,3}\s/, "");
        } else {
            // Replace heading or add new one
            newLine = currentHeading
                ? currentLine.replace(/^#{1,3}\s/, `${targetHeading} `)
                : `${targetHeading} ${currentLine}`;
        }

        // Create new content and update
        const newContent =
            text.slice(0, lineStart) +
            newLine +
            text.slice(lineEnd > -1 ? lineEnd : text.length);

        setMarkdown(newContent);

        // Calculate new cursor position
        const cursorOffset = newLine.length - currentLine.length;
        setCursorPosition({
            start: start + cursorOffset,
            end: start + cursorOffset
        });
    }, [markdown]);

    // Insert link
    const insertLink = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selected = markdown.slice(start, end) || "Link Text";

        // Check if selection is already a link
        const beforeText = markdown.slice(0, start);
        const afterText = markdown.slice(end);
        const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/;
        const isLink = linkPattern.test(selected);

        let newMarkdown;
        let newCursorStart;
        let newCursorEnd;

        if (isLink) {
            // Extract text from link
            const linkMatch = selected.match(linkPattern);
            if (linkMatch) {
                const linkText = linkMatch[1];
                if (linkText !== undefined) {
                    newMarkdown = beforeText + linkText + afterText;
                    newCursorStart = start;
                    newCursorEnd = start + linkText.length;
                } else {
                    // Handle the case where linkText is undefined
                    newMarkdown = markdown;
                    newCursorStart = start;
                    newCursorEnd = end;
                }
            } else {
                newMarkdown = markdown;
                newCursorStart = start;
                newCursorEnd = end;
            }
        } else {
            // Create new link
            const linkMarkdown = `[${selected}](https://example.com)`;
            newMarkdown = beforeText + linkMarkdown + afterText;
            newCursorStart = start + 1;
            newCursorEnd = start + 1 + selected.length;
        }

        setMarkdown(newMarkdown);
        setCursorPosition({ start: newCursorStart, end: newCursorEnd });
    }, [markdown]);

    // Handle special key events
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const editor = e.currentTarget;
        const { selectionStart, selectionEnd } = editor;

        // Tab key for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const indentation = '  '; // Two spaces for tab

            const newContent =
                markdown.slice(0, selectionStart) +
                indentation +
                markdown.slice(selectionEnd);

            setMarkdown(newContent);
            setCursorPosition({
                start: selectionStart + indentation.length,
                end: selectionStart + indentation.length
            });
            return;
        }

        // Smart handling for code blocks
    }, [markdown]);

    // Handle image upload
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedImage(file);

            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImagePreview(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    }, []);

    // Handle form submission
    const handleSave = async () => {
        if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim()) {
            alert("Title, description, and content cannot be empty.");
            return;
        }

        setIsUploading(true);
        try {
            let result;
            const updatedData = { ...formData };

            if (isEditMode) {
                if (uploadedImage) {
                    const formDataObj = new FormData();
                    formDataObj.append("coverImage", uploadedImage);
                    formDataObj.append("data", JSON.stringify(updatedData));
                    result = await UpdateBlog(formDataObj);
                } else {
                    result = await UpdateBlog(updatedData);
                }

                if (result?.success) {
                    router.push(`/posts/${result.slug}`);
                } else {
                    alert(result?.error || "Failed to update blog post.");
                }
            } else {
                if (uploadedImage) {
                    const formDataObj = new FormData();
                    formDataObj.append("coverImage", uploadedImage);
                    formDataObj.append("data", JSON.stringify(updatedData));
                    result = await SaveBlog(formDataObj);
                } else {
                    result = await SaveBlog(updatedData);
                }

                if (result?.slug) {
                    router.push(`/posts/${result.slug}`);
                } else {
                    alert(result?.error || "Failed to create blog post.");
                }
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("An error occurred while saving your post.");
        } finally {
            setIsUploading(false);
        }
    };

    // Remove cover image
    const removeCoverImage = useCallback(() => {
        setUploadedImage(null);
        setImagePreview(null);
        // If in edit mode and removing the existing image, update formData
        if (isEditMode && blogPost?.coverImage) {
            setFormData(prev => ({ ...prev, coverImage: "" }));
        }
    }, [isEditMode, blogPost]);

    // Toggle preview mode
    const togglePreview = useCallback(() => {
        setShowPreview(prev => !prev);
    }, []);

    // Determine what image to show
    const showImagePreview = imagePreview !== null;
    const showExistingImage = !showImagePreview && isEditMode && blogPost?.coverImage;

    // Helper component for media display - fixed to handle empty/null src


    // Safely get cover image URL
    const coverImage = blogPost?.coverImage;


    return (
        <div className="relative w-full container mt-2 flex flex-col gap-4">
            {/* Title + Description */}
            <div className="bg-gray-200 dark:bg-gray-800 rounded-t-2xl p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
                <textarea
                    ref={titleRef}
                    className="text-3xl w-full resize-none font-bold overflow-hidden bg-transparent outline-none break-words leading-tight"
                    placeholder="Enter title..."
                    rows={1}
                    maxLength={100}
                    value={formData.title}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, title: e.target.value }));
                    }}
                />
                <textarea
                    ref={descriptionRef}
                    className="text-lg w-full resize-none overflow-hidden bg-transparent outline-none break-words leading-tight text-gray-600 dark:text-gray-300"
                    placeholder="Enter description..."
                    rows={1}
                    maxLength={200}
                    value={formData.description}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, description: e.target.value }));
                    }}
                />
            </div>

            {/* Cover Image */}
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg py-4 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-medium">Cover Image</h3>

                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Image preview state handling */}
                        {showImagePreview ? (
                            <div className="relative">
                                <Image
                                    width={200}
                                    height={200}
                                    src={imagePreview}
                                    alt="Cover Preview"
                                    className="h-40 sm:h-48 w-auto object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                                />
                                <button
                                    onClick={removeCoverImage}
                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                                    title="Remove image"
                                    type="button"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        ) : showExistingImage ? (
                            <div className="relative">
                                {/* Use MediaDisplay for existing image with proper URL handling */}
                                <Media
                                    resource={coverImage}
                                    imgClassName="h-40 sm:h-48 w-auto object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-40 sm:h-48 w-full sm:w-64 bg-gray-300 dark:bg-gray-700 rounded-lg border border-dashed border-gray-400 dark:border-gray-500">
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                    No image uploaded yet.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="blue-btn cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md inline-block">
                                {(showImagePreview || showExistingImage)
                                    ? 'Change Image'
                                    : 'Upload Image'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Recommended: 1200×630px or larger
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="sticky top-0 z-10 bg-gray-200 dark:bg-gray-800 rounded-lg py-4 px-4 sm:px-6 lg:px-8 border-y-[10px] dark:border-y-[10px] border-white dark:border-black">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => insertText("**")} className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><Bold /></button>
                        <button onClick={() => insertText("_")} className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><Italic /></button>
                        <button onClick={() => insertText("`")} className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><Code /></button>
                        <button onClick={() => insertText("```[js]\n", "\n```", "// Your code here")} className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><Code2 /></button>
                        <button onClick={() => setHeading(1)} className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><Heading1 /></button>
                        <button onClick={() => setHeading(2)} className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><Heading2 /></button>
                        <button onClick={() => setHeading(3)} className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><Heading3 /></button>
                        <button onClick={insertLink} className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><Link /></button>
                        <button onClick={() => insertText("<div style='text-align:left;'>", "</div>")} className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><AlignLeft /></button>
                        <button onClick={() => insertText("<div style='text-align:center;'>", "</div>")} className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><AlignCenter /></button>
                        <button onClick={() => insertText("<div style='text-align:right;'>", "</div>")} className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><AlignRight /></button>
                        <button onClick={() => insertText("<div style='text-align:justify;'>", "</div>")} className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"><AlignJustify /></button>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                            onClick={togglePreview}
                            className="btn p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 !text-lg"
                        >
                            {showPreview ? "Editor" : "Preview"}
                        </button>
                        <button
                            onClick={handleSave}
                            className="blue-btn px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                            disabled={isUploading}
                        >
                            {isUploading
                                ? "Saving..."
                                : isEditMode ? "Update" : "Save"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor / Preview */}
            <div
                ref={editorContainerRef}
                className="bg-gray-200 dark:bg-gray-800 rounded-b-2xl p-4 sm:p-6 lg:p-8"
            >
                {showPreview ? (
                    <div className="prose max-w-none break-words whitespace-pre-wrap overflow-auto" style={{ minHeight: editorHeight }}>
                        <Markdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                h1: ({ node: _node, ...props }) => <h1 className="text-4xl dark:text-white font-bold mb-4" {...props} />,
                                h2: ({ node: _node, ...props }) => <h2 className="text-3xl dark:text-white font-semibold mt-6 mb-3" {...props} />,
                                h3: ({ node: _node, ...props }) => <h3 className="text-2xl dark:text-white font-medium mt-4 mb-2" {...props} />,
                                strong: ({ node: _node, ...props }) => <strong className="dark:text-white text-black font-bold" {...props} />,
                                em: ({ node: _node, ...props }) => <em className="dark:text-white text-black italic" {...props} />,
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                code: function Code({ node: _node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    const lang = match?.[1] || "";
                                    return !inline && lang ? (
                                        <div className="relative my-4">
                                            <div className="absolute top-0 right-0 px-2 py-1 text-xs bg-gray-800 text-white rounded-bl z-10">{lang}</div>
                                            <SyntaxHighlighter
                                                language={lang}
                                                style={oneDark}
                                                showLineNumbers
                                                wrapLines
                                                wrapLongLines
                                                PreTag="div"
                                                customStyle={{
                                                    borderRadius: "0.5rem",
                                                    padding: "1rem",
                                                    backgroundColor: "#282c34",
                                                    fontSize: "0.9rem",
                                                    overflowX: "auto",
                                                }}
                                                lineNumberStyle={{ color: "#888", marginRight: "1em" }}
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, "")}
                                            </SyntaxHighlighter>
                                        </div>
                                    ) : (
                                        <code className="relative before:content-[''] after:content-[''] !bg-black text-white px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                img: ({ node: _node, ..._props }) => null,
                                a: ({ node: _node, ...props }) => (
                                    <a
                                        {...props}
                                        className="text-indigo-500 hover:text-indigo-700 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    />
                                ),
                                div: ({ node: _node, ...props }) => {
                                    // Safe handling of style props
                                    let styleProps = {};
                                    if (props.style && typeof props.style === "object") {
                                        const { textAlign, ...otherStyles } = props.style as React.CSSProperties;
                                        styleProps = {
                                            ...otherStyles,
                                            textAlign: textAlign as React.CSSProperties["textAlign"],
                                        };
                                    }

                                    return (
                                        <div
                                            {...props}
                                            style={styleProps}
                                            className="dark:text-white"
                                        />
                                    );
                                },
                                p: ({ node: _node, ...props }) => <p className="dark:text-white" {...props} />
                            }}
                        >
                            {processedMarkdown}
                        </Markdown>
                    </div>
                ) : (
                    <>
                        <textarea
                            ref={editorRef}
                            className="w-full resize-none bg-transparent outline-none break-words"
                            placeholder="Enter content..."
                            style={{
                                minHeight: editorHeight,
                                height: editorHeight
                            }}
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            onKeyDown={handleKeyDown}
                            maxLength={4000}
                        />
                        <div className="text-right text-sm text-gray-500 mt-1">
                            {markdown.trim().split(/\s+/).filter(Boolean).length} words and &nbsp;
                            <span>{markdown.length} / 4000 characters</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MarkdownEditor;
"use client"
import SaveData from '@/actions/EditProfile/SaveData'
import MarqueeHeading from '@/components/MarqueeHeading/MarqueeHeading'
import { Media } from '@/components/Media'
import { Profile } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import { PaginatedDocs } from 'payload'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const fields = [
    { placeholder: 'First Name', name: 'firstname', type: 'text' },
    { placeholder: 'Last Name', name: 'lastname', type: 'text' },
    { placeholder: 'Bio', name: 'bio', type: 'textarea', maxLength: 500 },
    { placeholder: 'Display Email', name: 'displayemail', type: 'checkbox', defaultValue: false },
    { placeholder: 'Website URL', name: 'websiteurl', type: 'text' }
]

type Props = {
    data: PaginatedDocs<Profile>
}

const EditProfile: React.FC<Props> = ({ data }) => {
    const router = useRouter();
    const profile = data?.docs?.[0];

    const [imageHovered, setImageHovered] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        firstname: profile?.firstname || '',
        lastname: profile?.lastname || '',
        username: profile?.username || '',
        bio: profile?.bio || '',
        displayemail: profile?.displayemail || false,
        websiteurl: profile?.websiteurl || '',
    });

    // Load existing avatar from profile if available
    useEffect(() => {
        if (profile?.avatar && !imagePreview) {
            // You might want to display the profile avatar if no imagePreview is set
        }
    }, [profile, imagePreview]);


    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveMessage(null);

            const updatedData = { ...formData };
            const payload = {
                avatar: imageFile,
                data: JSON.stringify(updatedData)
            };

            const result = await SaveData(payload);

            if (result.success) {
                setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
                // Clear the image file state after successful upload
                setImageFile(null);
                // Refresh the page data
                router.refresh();

                // Optional: redirect back to profile after short delay
                setTimeout(() => {
                    router.push(`/profile/${profile?.username}`);
                }, 2000);
            } else {
                setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
            }
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'An error occurred while saving profile.' });
            console.error("Error saving profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = e.target;
        const { name, type, value } = target;

        let checked: boolean | undefined;
        if (target instanceof HTMLInputElement && type === 'checkbox') {
            checked = target.checked;
        } else {
            checked = undefined;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: checked !== undefined ? checked : value
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Check file type
            if (!file.type.startsWith('image/')) {
                setSaveMessage({ type: 'error', text: 'Please select an image file.' });
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setSaveMessage({ type: 'error', text: 'Image size should be less than 5MB.' });
                return;
            }

            setImageFile(file);

            // Create and set image preview
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImagePreview(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <>
            {!saveMessage ? (
                <div className="absolute h-[150px] sm:h-[200px] top-0 left-0  w-full flex items-center justify-center -z-10">
                    <MarqueeHeading text="Edit Profile" className="gradient" />
                </div>
            ) : saveMessage.type === 'success' ? (
                <div className="absolute h-[150px] sm:h-[200px] top-0 left-0 gradient-success w-full flex items-center justify-center -z-10">
                    <MarqueeHeading text={saveMessage.text} className='gradient-success' />
                </div>
            ) : (
                <div className="absolute h-[150px] sm:h-[200px] top-0 left-0 gradient w-full flex items-center justify-center -z-10">
                    <MarqueeHeading text={saveMessage.text} className='gradient-error' />
                </div>
            )}


            <div className="relative w-full container mt-24 bg-gray-200 dark:bg-gray-800 rounded-tl-2xl rounded-lg transition-all duration-200 p-6 sm:p-8">


                <div
                    className="absolute w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px] h-[120px] sm:h-[150px] md:h-[180px] lg:h-[200px] border-[6px] sm:border-[8px] md:border-[10px] dark:border-gray-800 border-black bg-black rounded-full flex items-center justify-center overflow-hidden -top-[4.5rem] sm:-top-[5rem] md:-top-[6rem] lg:-top-[6.2rem] select-none focus:outline-none"
                    onMouseEnter={() => setImageHovered(true)}
                    onMouseLeave={() => setImageHovered(false)}
                >
                    {imageHovered ? (
                        <div className="flex flex-col items-center justify-center">
                            <label
                                htmlFor="image-upload"
                                className="text-white text-center cursor-pointer hover:underline mb-2"
                            >
                                {imagePreview || profile?.avatar ? 'Change Avatar' : 'Add Avatar'}
                            </label>

                            <input id='image-upload' type="file" accept="image/*" className='hidden' onChange={handleImageUpload} />
                        </div>
                    ) : imagePreview ? (
                        // Show the preview image if available
                        <Image height={200} width={200} src={imagePreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : profile?.avatar ? (
                        <Media imgClassName="w-full h-full object-cover" fill resource={profile.avatar} />
                    ) : (
                        <div className="text-white text-center">No avatar</div>
                    )}
                </div>

                <div className="absolute top-6 sm:top-8 right-6 sm:right-8 flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`blue-btn ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <Link href={`/profile/${profile?.username}`} className='blue-btn'>Back to Profile</Link>
                </div>


                {/* Profile Form */}
                <div className="mt-16 sm:mt-16 md:mt-20 flex flex-col gap-4 sm:text-left">
                    {fields.map(({ placeholder, name, type, maxLength }) => (
                        <div key={name} className="flex flex-col">
                            {type === 'textarea' ? (
                                <textarea
                                    placeholder={placeholder}
                                    name={name}
                                    value={formData[name as keyof typeof formData].toString()} maxLength={maxLength}
                                    onChange={handleChange}
                                    className="p-2 bg-transparent dark:text-white outline-none border-gray-500 dark:border-gray-500 border-[2px] rounded-lg"
                                    rows={5}
                                />
                            ) : type === 'checkbox' ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name={name}
                                        checked={formData[name as keyof typeof formData] as boolean}
                                        onChange={handleChange}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-gray-600 dark:text-gray-300 outline-none">Show email on profile</span>
                                </div>
                            ) : (
                                <input
                                    type={type}
                                    name={name}
                                    placeholder={placeholder}
                                    value={formData[name as keyof typeof formData].toString()} onChange={handleChange}
                                    className="p-2 max-w-[40rem] rounded bg-transparent dark:text-white outline-none text-xl sm:text-2xl font-bold border-gray-500 dark:border-gray-500 border-[2px]"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default EditProfile
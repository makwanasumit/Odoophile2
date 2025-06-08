"use server"

import { getPayload } from "payload";
import configPromise from '@payload-config';
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

interface StringData {
    firstname: string;
    lastname: string;
    username: string;
    bio: string;
    displayemail: boolean;
    websiteurl: string;
}

interface FormDataInput {
    avatar: File | null;
    data: string;
}

export default async function SaveData(formData: FormDataInput) {
    const headerList = await headers();
    const cookieHeader = headerList.get("cookie");

    if (!cookieHeader) {
        return { success: false, error: "No cookies found" };
    }

    const match = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]*)/);
    const payloadToken = match ? match[1] : null;

    if (!payloadToken) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const parsedData: StringData = JSON.parse(formData.data);

        if (!parsedData.username) {
            return { success: false, error: "Username is required" };
        }

        console.log('Parsed Data:', parsedData);
        console.log('Avatar File:', formData.avatar ? `${formData.avatar.name} (${formData.avatar.size} bytes)` : 'No avatar file');

        const payload = await getPayload({ config: await configPromise });

        // Step 1: Find existing profile
        const existingProfile = await payload.find({
            collection: "profiles",
            where: { username: { equals: parsedData.username } },
        });

        if (!existingProfile?.docs?.length) {
            return { success: false, error: "Profile not found" };
        }

        const profileId = existingProfile?.docs[0]?.id;
        const existingAvatar = existingProfile?.docs[0]?.avatar;
        const existingAvatarId = typeof existingAvatar === 'object' && existingAvatar !== null && 'id' in existingAvatar
            ? existingAvatar.id
            : existingAvatar;

        let uploadedMediaId = null;

        // Step 2: First delete old avatar if exists and we have a new avatar to upload
        if (formData.avatar && formData.avatar.size > 0 && formData.avatar.name !== 'undefined' && existingAvatarId) {
            console.log('Deleting old avatar:', existingAvatarId);
            try {
                await payload.delete({
                    collection: "media",
                    id: existingAvatarId,
                });
                console.log('Old avatar deleted successfully');
            } catch (deleteError) {
                console.error('Error during avatar deletion:', deleteError);
                // Continue with the upload even if deletion fails
            }
        }

        // Step 3: Upload new avatar if provided
        if (formData.avatar && formData.avatar.size > 0 && formData.avatar.name !== 'undefined') {
            // Upload new avatar
            const uploadForm = new FormData();
            uploadForm.append('file', formData.avatar);

            const res = await fetch('http://localhost:3000/api/media', {
                method: 'POST',
                headers: {
                    Cookie: `payload-token=${payloadToken}`,
                },
                body: uploadForm,
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Failed to upload media:", errorText);
                throw new Error(`Failed to upload media: ${res.status} ${errorText}`);
            }

            const uploadResponse = await res.json();

            if (uploadResponse?.doc?.id) {
                uploadedMediaId = uploadResponse.doc.id;
                console.log('Uploaded new avatar:', uploadedMediaId);
            } else {
                console.error("Media upload failed:", uploadResponse);
                throw new Error("Media upload failed - couldn't get media ID");
            }
        }

        // Step 4: Prepare data for update
        const updateData: {
            firstname: string;
            lastname: string;
            bio: string;
            displayemail: boolean;
            websiteurl: string;
            avatar?: string | null; // Can be null to remove avatar
        } = {
            firstname: parsedData.firstname,
            lastname: parsedData.lastname,
            bio: parsedData.bio,
            displayemail: parsedData.displayemail,
            websiteurl: parsedData.websiteurl,
        };

        if (uploadedMediaId) {
            updateData.avatar = uploadedMediaId;
        }

        // Step 5: Update profile in Payload CMS
        if (!profileId) {
            throw new Error("Profile ID is required to update the profile");
        }

        const updatedProfile = await payload.update({
            collection: "profiles",
            id: profileId,
            data: updateData,
        });

        // Revalidate the profile page to show updates immediately
        revalidatePath(`/profile/${parsedData.username}`);
        revalidatePath(`/profile/edit/${parsedData.username}`);

        return {
            success: true,
            profile: updatedProfile,
        };
    } catch (error) {
        console.error("Error updating profile:", error);
        return {
            success: false,
            error: `Failed to update profile: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
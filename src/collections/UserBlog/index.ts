import type { CollectionConfig, FieldHook } from 'payload';
import { authenticated } from '../../access/authenticated';

const generateUniqueSlug: FieldHook = async ({ value, data, originalDoc, req }) => {
    const title = data?.title || originalDoc?.title || '';
    const baseSlug = value || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    let slug = baseSlug;
    let suffix = 1;

    const collection = 'userblog';

    while (true) {
        const existing = await req.payload.find({
            collection,
            where: {
                slug: {
                    equals: slug,
                },
            },
        });

        const isSameDoc = existing?.docs?.[0]?.id === originalDoc?.id;

        if (!existing.totalDocs || isSameDoc) break;

        slug = `${baseSlug}-${suffix}`;
        suffix++;
    }

    return slug;
};

export const UserBlog: CollectionConfig = {
    slug: 'userblog',
    access: {
        admin: authenticated,
        create: authenticated,
        delete: authenticated,
        update: authenticated,
    },
    admin: {
        defaultColumns: ['title', 'user', 'slug'],
        useAsTitle: 'title',
    },
    fields: [
        {
            label: 'Profile',
            name: 'profile',
            type: 'relationship',
            relationTo: 'profiles',
            required: true,
        },
        {
            label: 'User',
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
        },
        {
            label: 'Title',
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            label: 'Description',
            name: 'description',
            type: 'text',
            required: true,
        },
        {
            label: 'CoverImage',
            name: 'coverImage',
            type: 'upload',
            relationTo: 'media',
        },
        {
            type: 'collapsible',
            label: 'Content',
            fields: [
                {
                    name: 'content',
                    type: 'textarea',
                },
            ]
        },
        {
            name: 'featured',
            label: 'Featured',
            type: 'checkbox',
        },
        {
            name: 'comments',
            type: 'relationship',
            relationTo: 'comments',
            hasMany: true,
        },
        {
            label: 'UpVotes',
            name: 'upvotes',
            type: 'relationship',
            relationTo: 'profiles',
            hasMany: true,
        },
        {
            name: 'upvoteCount',
            type: 'number',
            defaultValue: 0,
            admin: {
                readOnly: true,
            },
        },
        {
            label: 'Saves',
            name: 'saves',
            type: 'relationship',
            relationTo: 'profiles',
            hasMany: true,
        },
        {
            label: 'Categories',
            name: 'categories',
            type: 'relationship',
            relationTo: 'categories',
            hasMany: true,
        },
        {
            label: 'Slug',
            name: 'slug',
            type: 'text',
            unique: true,
            admin: {
                position: 'sidebar',
            },
            hooks: {
                beforeValidate: [generateUniqueSlug],
            },
        },
    ],
    timestamps: true,
};

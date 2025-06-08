import type { CollectionConfig } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { authenticated } from '../../access/authenticated'

export const Profiles: CollectionConfig = {
    slug: 'profiles',
    access: {
        admin: authenticated,
        create: authenticated,
        delete: authenticated,
        read: () => true,
        update: authenticated,
    },


    admin: {
        defaultColumns: ['username', 'user'],
        useAsTitle: 'username',
    },
    fields: [
        {
            label: 'User',
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
        },
        {
            label: 'First Name',
            name: 'firstname',
            type: 'text',
        },
        {
            label: 'Last Name',
            name: 'lastname',
            type: 'text',
        },
        {
            label: 'Username',
            name: 'username',
            type: 'text',
            unique: true,
        },
        {
            label: 'Bio',
            name: 'bio',
            type: 'textarea',
            maxLength: 500,
        },
        {
            label: 'Display Email',
            name: 'displayemail',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            label: 'Avatar',
            name: 'avatar',
            type: 'upload',
            relationTo: 'media',
        },
        {
            label: 'Followers',
            name: 'followers',
            type: 'relationship',
            relationTo: 'profiles',
            hasMany: true,
        },
        {
            label: 'Following',
            name: 'following',
            type: 'relationship',
            relationTo: 'profiles',
            hasMany: true,
        },
        {
            label: 'Reading List',
            name: 'readinglist',
            type: 'relationship',
            relationTo: 'userblog',
            hasMany: true,
        },
        {
            label: 'Website URL',
            name: 'websiteurl',
            type: 'text'
        },
        linkGroup(),

    ],


    timestamps: true,
}

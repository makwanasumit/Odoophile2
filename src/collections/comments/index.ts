import { anyone } from "@/access/anyone";
import { authenticated } from "@/access/authenticated";
import { CollectionConfig } from "payload";

export const Comments: CollectionConfig<'comments'> = {
    slug: 'comments',
    access: {
        create: authenticated,
        delete: authenticated,
        read: anyone,
        update: authenticated,
    },
    admin: {
        useAsTitle: 'text',
    },
    fields: [
        {
            name: 'author',
            type: 'relationship',
            relationTo: 'profiles',
            // required: true,
        },
        {
            name: 'text',
            type: 'text',
            required: true,
        },
        {
            name: 'upvotedBy',
            type: 'relationship',
            relationTo: 'profiles',
            hasMany: true,
        },
        {
            name: 'post',
            type: 'relationship',
            relationTo: 'userblog',
            required: true,
        },
        {
            name: 'parent',
            type: 'relationship',
            relationTo: 'comments',
        },
        {
            name: 'createdAt',
            type: 'date',
            admin: {
                readOnly: true,
            },
            hooks: {
                afterChange: [() => new Date()],
            },
        },
    ],
}

import type { CollectionConfig, PayloadRequest } from 'payload';

// Create a function to check if the user has admin role
const isAdmin = ({ req: { user } }: { req: PayloadRequest }) => {
  return user?.role === 'admin';
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Replace authenticated with isAdmin for admin panel access
    admin: isAdmin,
    // Keep the rest of your access controls as they were
    create: () => true,
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'password',
      type: 'text',
    },
    {
      name: 'otp',
      type: 'number',
      label: 'OTP',
      admin: { hidden: true }, // Hide OTP from the admin panel
    },
    {
      name: 'otpExpiresAt',
      type: 'date',
      admin: { hidden: true },
    },
    {
      name: 'role',
      type: 'select',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Company Admin',
          value: 'companyadmin',
        },
        {
          label: 'Company Employee',
          value: 'companyemployee',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
      defaultValue: 'user',
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'token',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'isVerified',
      type: 'checkbox',
      defaultValue: false,
      // admin: { hidden: true },
    },
    {
      name: 'verificationToken',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'verificationTokenExpiry',
      type: 'date',
      admin: { hidden: true },
    },
  ],
  timestamps: true,
}
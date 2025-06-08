// This file should be placed in your access/ directory
// Example path: src/access/isAdmin.ts or similar based on your project structure

import { Access } from "payload"



// Function to check if the user has admin role
export const isAdmin: Access = ({ req: { user } }) => {
    // Only allow users with the 'admin' role to access the admin panel
    return Boolean(user?.role === 'admin')
}

// You can also create a function to check if user is a company admin
export const isCompanyAdmin: Access = ({ req: { user } }) => {
    return Boolean(user?.role === 'admin' || user?.role === 'companyadmin')
}

// For operations that should be restricted to admins
export const adminOnly: Access = ({ req: { user } }) => {
    return Boolean(user?.role === 'admin')
}
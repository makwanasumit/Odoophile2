import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import sha256 from 'crypto-js/sha256';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');
        const verificationToken = searchParams.get('verificationToken');
        const username = email?.split('@')[0];

        if (!email || !verificationToken) {
            return NextResponse.json({ error: 'Missing email or verification token' }, { status: 400 });
        }

        const hashedToken = sha256(verificationToken).toString();
        const payload = await getPayload({ config: configPromise });

        const users = await payload.find({
            collection: 'users',
            where: { email: { equals: email } }
        });

        if (!users.docs.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = users.docs[0];

        // Check if user is already verified
        if (user?.isVerified === true) {
            return NextResponse.json({ message: 'Email already verified', email: user.email });
        }

        // Check if token matches and is valid
        if (user?.verificationToken !== hashedToken) {
            return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 });
        }

        // Check if token is expired (if you store expiry time)
        if (user.verificationTokenExpiry && new Date(user.verificationTokenExpiry) < new Date()) {
            return NextResponse.json({ error: 'Verification token has expired' }, { status: 400 });
        }

        // Update user to verified status
        try {
            const updatedUser = await payload.update({
                collection: 'users',
                id: user.id,
                data: {
                    isVerified: true,
                    verificationToken: null,
                    verificationTokenExpiry: null
                }
            });


            if (updatedUser) {
                await payload.create({
                    collection: 'profiles',
                    data: {
                        user: updatedUser.id,
                        username
                    }
                })
            }







            return NextResponse.json({
                message: 'Email verified successfully',
                email: user.email,
                redirectUrl: '/login' // Optional: provide redirect URL for frontend
            });
        } catch (updateError) {
            console.error("Failed to update user verification status:", updateError);
            return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
        }





    } catch (error) {
        console.error("Email verification error:", error);
        return NextResponse.json({ error: 'Something went wrong during verification' }, { status: 500 });
    }
}
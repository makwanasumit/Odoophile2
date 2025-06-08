"use server"
import configPromise from '@payload-config';
import { getPayload } from 'payload';


export async function SignUpAction({ name, email, password, hashedToken, verificationTokenExpiry }: { name: string, email: string, password: string, hashedToken: string, verificationTokenExpiry: Date }) {

    const payload = await getPayload({ config: configPromise })

    const user = await payload.create({
        collection: 'users',
        data: {
            email,
            name,
            password,
            verificationToken: hashedToken,
            verificationTokenExpiry: verificationTokenExpiry.toISOString(),
            isVerified: false
        }
    })




    return user

}
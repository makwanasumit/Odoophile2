"use server";
import nodemailer from 'nodemailer';

export default async function sendEmail(to: string, subject: string, html: string) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // Set to `true` if using port 465
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,
            to,
            subject,
            html,
        });

        console.log('Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getStatus } from '@/lib/store';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, contact, message } = body;

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
        }

        const status = await getStatus();
        const settings = status.emailSettings;

        if (!settings || !settings.smtpHost || !settings.receiverEmail) {
            return NextResponse.json({ success: false, error: 'Email service is not configured by the professor.' }, { status: 503 });
        }

        const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: Number(settings.smtpPort),
            secure: settings.secure || false,
            auth: {
                user: settings.smtpUser,
                pass: settings.smtpPass,
            },
        });

        const mailOptions = {
            from: `"Doorboard Student" <${settings.smtpUser}>`, // Sender address (must be authenticated user usually)
            replyTo: contact || undefined, // Allow replying to student if contact provided
            to: settings.receiverEmail,
            subject: `[Doorboard] Message from ${name || 'Student'}`,
            text: `
Name: ${name || 'Anonymous'}
Contact: ${contact || 'Not provided'}
----------------------------------------
${message}
        `,
            html: `
        <h3>New Message from Doorboard</h3>
        <p><strong>Name:</strong> ${name || 'Anonymous'}</p>
        <p><strong>Contact:</strong> ${contact || 'Not provided'}</p>
        <hr/>
        <p>${message.replace(/\n/g, '<br>')}</p>
        `
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Message sent successfully!' });
    } catch (error: any) {
        console.error('Email Send Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to send email. Server error.' }, { status: 500 });
    }
}

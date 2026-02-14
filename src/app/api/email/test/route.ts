import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { smtpHost, smtpPort, smtpUser, smtpPass, receiverEmail, secure } = body;

        if (!smtpHost || !smtpUser || !smtpPass || !receiverEmail) {
            return NextResponse.json({ success: false, error: 'Missing required SMTP settings' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort),
            secure: secure || false, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            family: 4, // Force IPv4
        });

        // Verify connection config
        await transporter.verify();

        // Send test email
        await transporter.sendMail({
            from: `"Doorboard Admin" <${smtpUser}>`,
            to: receiverEmail,
            subject: "Doorboard SMTP Test Success",
            text: "If you are reading this, your SMTP settings are correct! You can now receive student messages via email.",
            html: "<b>SMTP Test Successful!</b><br>Your Doorboard is ready to send emails.",
        });

        return NextResponse.json({ success: true, message: 'Test email sent successfully!' });
    } catch (error: any) {
        console.error('SMTP Test Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

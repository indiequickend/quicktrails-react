import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEnquiryMail({ guestName, email, phone, numberOfTravelers, preferredDates, specialRequests, forLabel }) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn('Mail: SMTP not configured — skipping email notification.');
        return;
    }

    const rows = [
        ['Name', guestName],
        ['Email', email],
        ['Phone', phone],
        ['For', forLabel],
        ['Travelers', numberOfTravelers],
        ['Preferred dates', preferredDates || '—'],
        ['Special requests', specialRequests || '—'],
    ];

    const tableRows = rows
        .map(([label, value]) => `
            <tr>
                <td style="padding:8px 12px;font-weight:600;color:#374151;background:#f9fafb;white-space:nowrap;">${label}</td>
                <td style="padding:8px 12px;color:#111827;">${value}</td>
            </tr>`)
        .join('');

    await transporter.sendMail({
        from: `"QuickTrails" <${process.env.SMTP_USER}>`,
        to: 'contact@quicktrails.com',
        replyTo: email,
        subject: `New enquiry from ${guestName}${forLabel !== 'General enquiry' ? ` — ${forLabel}` : ''}`,
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <div style="background:#0f172a;padding:20px 24px;">
                    <h2 style="margin:0;color:#fbbf24;font-size:18px;letter-spacing:0.05em;">QUICKTRAILS</h2>
                    <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">New booking enquiry</p>
                </div>
                <table style="width:100%;border-collapse:collapse;">
                    ${tableRows}
                </table>
                <div style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;color:#6b7280;">Reply directly to this email to contact the guest.</p>
                </div>
            </div>`,
    });
}

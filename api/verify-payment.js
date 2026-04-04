import crypto from 'crypto';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import clientPromise from './lib/mongodb.js';
import { createBookingEvent } from './lib/google-calendar.js';

dotenv.config();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ status: 'verification_failed' });
    }

    // Signature verified ✅
    try {
        // 1. Update booking status in MongoDB
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || 'makeovers');
        const bookings = db.collection('bookings');

        const result = await bookings.updateOne(
            { id: booking_id },
            {
                $set: {
                    status: 'confirmed',
                    payment_status: 'paid',
                    razorpay_payment_id: razorpay_payment_id,
                    updated_at: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            throw new Error('Booking not found');
        }

        // Fetch the full booking for calendar + emails
        const booking = await bookings.findOne({ id: booking_id });

        // Helper to format time nicely
        const formatTime = (t) => {
            if (!t) return '';
            const [h, m] = t.split(':').map(Number);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hr = h % 12 || 12;
            return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
        };

        // 2. Create Google Calendar Event
        if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CALENDAR_ID) {
            try {
                await createBookingEvent({
                    date: booking.booking_date,
                    time: booking.booking_time,
                    clientName: booking.client_name,
                    clientEmail: booking.client_email,
                    clientPhone: booking.client_phone,
                    serviceName: booking.service_name || booking.service_id,
                    notes: booking.notes,
                });
                console.log('✅ Google Calendar event created for', booking_id);
            } catch (calErr) {
                console.error('Google Calendar Error:', calErr);
                // Don't fail the whole request – the payment is already verified
            }
        }

        // 3. Send emails via Resend
        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const adminEmail = process.env.ADMIN_EMAIL;
            const timeStr = formatTime(booking.booking_time);

            // ─── Email to Admin ───
            if (adminEmail) {
                try {
                    await resend.emails.send({
                        from: 'Bookings <onboarding@resend.dev>',
                        to: adminEmail,
                        subject: `New Booking Confirmed — ${booking.client_name} ✨`,
                        html: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #fffbf9; border-radius: 24px;">
  <h2 style="color: #be6d7d; margin: 0 0 8px;">New Booking Confirmed! 🎉</h2>
  <p style="color: #666; font-size: 14px;">A new client has confirmed their booking with a deposit.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
  <table style="width: 100%; font-size: 14px; color: #333;">
    <tr><td style="padding: 6px 0; color: #999;">Client</td><td style="text-align: right; font-weight: 600;">${booking.client_name}</td></tr>
    <tr><td style="padding: 6px 0; color: #999;">Email</td><td style="text-align: right;">${booking.client_email}</td></tr>
    <tr><td style="padding: 6px 0; color: #999;">Phone</td><td style="text-align: right;">${booking.client_phone || '—'}</td></tr>
    <tr><td style="padding: 6px 0; color: #999;">Service</td><td style="text-align: right; font-weight: 600;">${booking.service_name || booking.service_id}</td></tr>
    <tr><td style="padding: 6px 0; color: #999;">Date</td><td style="text-align: right; font-weight: 600;">${booking.booking_date}</td></tr>
    <tr><td style="padding: 6px 0; color: #999;">Time</td><td style="text-align: right; font-weight: 600;">${timeStr}</td></tr>
    <tr><td style="padding: 6px 0; color: #999;">Payment ID</td><td style="text-align: right; font-size: 12px;">${razorpay_payment_id}</td></tr>
  </table>
  ${booking.notes ? `<p style="margin-top: 16px; padding: 12px; background: #fff; border-radius: 12px; font-size: 13px; color: #555;"><strong>Notes:</strong> ${booking.notes}</p>` : ''}
</div>`
                    });
                } catch (emailError) {
                    console.error('Admin Email Error:', emailError);
                }
            }

            // ─── Email to Client ───
            if (booking.client_email) {
                try {
                    await resend.emails.send({
                        from: 'Makeovers by Simran <onboarding@resend.dev>',
                        to: booking.client_email,
                        subject: `Your Booking is Confirmed! 💄`,
                        html: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #fffbf9; border-radius: 24px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-block; background: #1c1c1c; color: #fff; font-family: serif; font-weight: bold; font-size: 18px; width: 44px; height: 44px; line-height: 44px; border-radius: 12px;">SM</div>
  </div>
  <h2 style="color: #1c1c1c; margin: 0 0 8px; text-align: center;">Booking Confirmed ✨</h2>
  <p style="color: #666; font-size: 14px; text-align: center;">Thank you, ${booking.client_name}! Your appointment is all set.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <table style="width: 100%; font-size: 14px; color: #333;">
    <tr><td style="padding: 8px 0; color: #999;">Service</td><td style="text-align: right; font-weight: 600;">${booking.service_name || booking.service_id}</td></tr>
    <tr><td style="padding: 8px 0; color: #999;">Date</td><td style="text-align: right; font-weight: 600;">${booking.booking_date}</td></tr>
    <tr><td style="padding: 8px 0; color: #999;">Time</td><td style="text-align: right; font-weight: 600;">${timeStr}</td></tr>
  </table>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <p style="font-size: 13px; color: #888; text-align: center;">
    If you have any questions, feel free to reply to this email or call us at <strong>+91 97735 94101</strong>.
  </p>
  <p style="font-size: 12px; color: #bbb; text-align: center; margin-top: 16px;">
    Makeovers by Simran Marwah — Delhi & NCR
  </p>
</div>`
                    });
                } catch (emailError) {
                    console.error('Client Email Error:', emailError);
                }
            }
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Verify-Payment Error:', error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
}

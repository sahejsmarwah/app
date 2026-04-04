import clientPromise from './lib/mongodb.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { name, email, phone, date, time, service, notes } = req.body;

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || 'makeovers');
        const bookings = db.collection('bookings');

        // Map service IDs to human-readable names
        const serviceNames = {
            bridal: 'Bridal Artistry',
            event: 'Events & Editorial',
            consult: 'Consultation',
        };

        const newBooking = {
            id: uuidv4(),
            client_name: name,
            client_email: email,
            client_phone: phone || '',
            service_id: service,
            service_name: serviceNames[service] || service,
            booking_date: date,
            booking_time: time || '',
            notes: notes || '',
            status: 'pending',
            payment_status: 'unpaid',
            created_at: new Date()
        };

        await bookings.insertOne(newBooking);

        res.status(200).json({
            id: newBooking.id,
            success: true
        });
    } catch (error) {
        console.error('MongoDB Insert Error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
}

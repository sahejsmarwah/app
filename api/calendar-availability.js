import { getAvailableSlots } from './lib/google-calendar.js';

export default async function handler(req, res) {
    // Allow GET for simple fetches from the frontend
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: 'Missing "date" query parameter (YYYY-MM-DD)' });
    }

    // Basic format check
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    try {
        const slots = await getAvailableSlots(date);
        return res.status(200).json({ date, slots });
    } catch (error) {
        console.error('Calendar Availability Error:', error);
        return res.status(500).json({ error: 'Failed to fetch availability' });
    }
}

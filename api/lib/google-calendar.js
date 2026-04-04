import { google } from 'googleapis';

// Build a JWT auth client from service-account env vars.
// The private key arrives from .env with escaped newlines – replace them.
function getAuth() {
    const auth = new google.auth.JWT(
        process.env.GOOGLE_CLIENT_EMAIL,
        null,
        (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/calendar']
    );
    return auth;
}

/**
 * Return a Google Calendar API v3 client.
 */
export function getCalendarClient() {
    const auth = getAuth();
    return google.calendar({ version: 'v3', auth });
}

/**
 * Return available time-slots for a given date.
 *
 * @param {string} dateStr  – ISO date, e.g. "2026-04-10"
 * @param {number} slotDurationMinutes – length of one slot (default 120)
 * @returns {Promise<string[]>} – e.g. ["10:00","12:00","14:00","16:00"]
 */
export async function getAvailableSlots(dateStr, slotDurationMinutes = 120) {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    // Working hours (IST-friendly: 10 AM – 6 PM)
    const workStart = 10; // hour
    const workEnd = 18;   // hour

    const dayStart = new Date(`${dateStr}T00:00:00+05:30`);
    const dayEnd = new Date(`${dateStr}T23:59:59+05:30`);

    // Fetch existing events for the day
    const eventsRes = await calendar.events.list({
        calendarId,
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    });

    const busySlots = (eventsRes.data.items || []).map((ev) => ({
        start: new Date(ev.start.dateTime || ev.start.date),
        end: new Date(ev.end.dateTime || ev.end.date),
    }));

    // Generate candidate slots
    const available = [];
    for (let hour = workStart; hour + slotDurationMinutes / 60 <= workEnd; hour += slotDurationMinutes / 60) {
        const slotStart = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00+05:30`);
        const slotEnd = new Date(slotStart.getTime() + slotDurationMinutes * 60 * 1000);

        // Check overlap with any busy slot
        const isBusy = busySlots.some(
            (b) => slotStart < b.end && slotEnd > b.start
        );

        if (!isBusy) {
            available.push(`${String(hour).padStart(2, '0')}:00`);
        }
    }

    return available;
}

/**
 * Create a calendar event for a confirmed booking.
 */
export async function createBookingEvent({ date, time, clientName, clientEmail, clientPhone, serviceName, notes }) {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const slotDuration = 120; // minutes

    const startDateTime = new Date(`${date}T${time}:00+05:30`);
    const endDateTime = new Date(startDateTime.getTime() + slotDuration * 60 * 1000);

    const event = {
        summary: `💄 ${serviceName} — ${clientName}`,
        description: [
            `Client: ${clientName}`,
            `Email: ${clientEmail}`,
            `Phone: ${clientPhone}`,
            notes ? `Notes: ${notes}` : '',
        ].filter(Boolean).join('\n'),
        start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'Asia/Kolkata',
        },
        end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'Asia/Kolkata',
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 60 },
            ],
        },
    };

    const res = await calendar.events.insert({
        calendarId,
        resource: event,
    });

    return res.data;
}

/**
 * Local development API server.
 * Mirrors the Vercel serverless function handlers so you can test
 * the full booking flow without deploying.
 *
 * Usage:  node api/dev-server.js   (runs on port 3001)
 * Then start Vite with:  npm run dev   (Vite proxies /api → localhost:3001)
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Lazy handler loading ───
// We wrap each handler so errors during import don't crash the server.
function lazyHandler(importPath) {
    let handlerPromise = null;

    return async (req, res) => {
        try {
            if (!handlerPromise) {
                handlerPromise = import(importPath).then(m => m.default);
            }
            const handler = await handlerPromise;
            await handler(req, res);
        } catch (err) {
            console.error(`Error in ${importPath}:`, err.message || err);
            // Reset so next call retries
            handlerPromise = null;
            if (!res.headersSent) {
                res.status(500).json({ error: err.message || 'Internal server error' });
            }
        }
    };
}

// Wire up routes
app.all('/api/create-booking', lazyHandler('./create-booking.js'));
app.all('/api/create-order', lazyHandler('./create-order.js'));
app.all('/api/verify-payment', lazyHandler('./verify-payment.js'));
app.all('/api/calendar-availability', lazyHandler('./calendar-availability.js'));
app.all('/api/log', lazyHandler('./log.js'));

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n  🚀 Local API server running at http://localhost:${PORT}`);
    console.log(`     Endpoints:`);
    console.log(`       POST /api/create-booking`);
    console.log(`       POST /api/create-order`);
    console.log(`       POST /api/verify-payment`);
    console.log(`       GET  /api/calendar-availability?date=YYYY-MM-DD`);
    console.log(`\n  Tip: Make sure Vite is also running (npm run dev)\n`);
});

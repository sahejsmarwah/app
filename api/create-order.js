import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order API (Serverless Handler)
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { amount, currency, receipt } = req.body;

        try {
            const options = {
                amount: amount * 100, // amount in the smallest currency unit (paise)
                currency,
                receipt,
            };

            const order = await razorpay.orders.create(options);
            res.status(200).json(order);
        } catch (error) {
            console.error('Razorpay Order Error:', error);
            res.status(500).json({ error: 'Failed to create order' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

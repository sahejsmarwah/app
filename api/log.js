export default async function handler(req, res) {
  if (req.method === 'POST') {
    const logEntry = req.body;
    console.log('Button Click Log:', JSON.stringify(logEntry));
    // Optionally, you can forward logs to a third-party service here
    res.status(200).json({ message: 'Log received' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
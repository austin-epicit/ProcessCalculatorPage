import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, source } = req.body;

  // Validate input
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing name or email' });
  }

  try {
    // Call Zapier webhook (URL stored in Vercel)
    const zapierResponse = await fetch(process.env.ZAPIER_WEBHOOK_URL as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, source })
    });

    if (!zapierResponse.ok) {
      throw new Error(`Zapier request failed with status ${zapierResponse.status}`);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send data to Zapier' });
  }
}

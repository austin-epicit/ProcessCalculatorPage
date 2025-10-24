import type { VercelRequest, VercelResponse } from '@vercel/node';

// --------------- CONFIG ---------------
// To be set in Vercel environment variables
const GHL_API_BASE = 'https://rest.gohighlevel.com/v1';
const GHL_API_KEY = process.env.GHL_API_KEY as string;
const PIPELINE_ID = process.env.GHL_PIPELINE_ID as string;
const STAGE_ID = process.env.GHL_STAGE_ID as string;
const TAGS = ['Process Calculator', 'Website Lead'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, source } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing name or email' });
  }

  try {
    // 1️⃣ Create or update the contact
    const contactResp = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        name,
        tags: TAGS,
        source,
      })
    });

    if (!contactResp.ok) {
      const err = await contactResp.text();
      throw new Error(`GHL contact create failed: ${err}`);
    }

    const contactData = await contactResp.json();
    const contactId = contactData.contact?.id;

    // 2️⃣ Create (or update) an opportunity in the chosen pipeline/stage
    if (contactId) {
      await fetch(`${GHL_API_BASE}/opportunities/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          contactId,
          pipelineId: PIPELINE_ID,
          stageId: STAGE_ID,
          status: 'open',
          monetaryValue: 0,
          tags: TAGS
        })
      });
    }

    res.status(200).json({ success: true, message: 'Lead sent to GoHighLevel' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send lead to GHL' });
  }
}

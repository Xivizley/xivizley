// ============================================================
// XIVIZLEY — SendPulse Official API & CRM Integration Client
// lib/sendpulse.ts
// ============================================================

const SENDPULSE_API_KEY = process.env.SENDPULSE_API_KEY || '';
const ADDRESS_BOOK_ID = 788650; // XIVIZLEY AI Destek
const PIPELINE_ID = 183494; // Varsayılan Satış Hattı
const STEP_ID = 639114;     // default_step_new (Yeni)

/**
 * Add subscriber to SendPulse Address Book (Triggers Automation 360)
 */
export async function addSubscriberToSendPulse(email: string, name?: string) {
  try {
    const res = await fetch(`https://api.sendpulse.com/addressbooks/${ADDRESS_BOOK_ID}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDPULSE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emails: [{ email, variables: name ? { name } : undefined }],
      }),
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.error('[SendPulse Add Subscriber Error]:', err);
    return { success: false, error: err };
  }
}

/**
 * Create a new Deal in SendPulse CRM (Triggers Mobile App Push Notification to Founder Alperen)
 */
export async function createCrmDeal(name: string, price = 0, currency = 'TRY') {
  try {
    const res = await fetch('https://api.sendpulse.com/crm/v1/deals', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDPULSE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pipelineId: PIPELINE_ID,
        stepId: STEP_ID,
        name,
        price,
        currency,
      }),
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.error('[SendPulse Create Deal Error]:', err);
    return { success: false, error: err };
  }
}

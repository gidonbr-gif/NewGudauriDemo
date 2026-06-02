const SERVICE_LABELS = {
  travel: 'הזמנת נסיעות',
  equipment: 'הזמנת ציוד',
  apartments: 'הזמנת דירות',
  investors: 'ליווי משקיעים'
};

const ALLOWED_SERVICES = new Set(Object.keys(SERVICE_LABELS));

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

export function validateLead(input) {
  const errors = [];
  const name = clean(input.name);
  const phone = clean(input.phone);
  const service = clean(input.service);

  if (!name) errors.push('name is required');
  if (!phone) errors.push('phone is required');
  if (service && !ALLOWED_SERVICES.has(service)) errors.push('service is invalid');

  return {
    valid: errors.length === 0,
    errors
  };
}

export function buildAirtableFields(input) {
  const service = ALLOWED_SERVICES.has(clean(input.service)) ? clean(input.service) : 'travel';
  const estimatedValue = Number(clean(input.estimatedValue));
  const fields = {
    'שם': clean(input.name),
    'טלפון': clean(input.phone),
    'שירות': SERVICE_LABELS[service],
    'מקור': clean(input.source) || 'website',
    'סטטוס': 'חדש',
    'הערות': clean(input.notes),
    'תאריך יצירה': new Date().toISOString()
  };

  if (clean(input.email)) fields['מייל'] = clean(input.email);
  if (input.marketingConsent === 'on') fields['הסכמה שיווקית'] = true;
  if (Number.isFinite(estimatedValue) && estimatedValue > 0) fields['שווי משוער'] = estimatedValue;

  if (service === 'equipment') {
    const eqLabels = {
      checkin: 'תאריך הגעה',
      checkout: 'תאריך עזיבה',
      equipmentType: 'סוג ציוד',
      equipmentLevel: 'רמת ציוד',
      bootSize: 'מידת נעל',
      helmetSize: 'מידת קסדה',
      jacketSize: "מידת ג'קט",
      pantsSize: 'מידת מכנסיים',
      goggles: 'משקפי סקי'
    };
    for (const key of Object.keys(eqLabels)) {
      const value = clean(input[key]);
      if (value) fields[eqLabels[key]] = value;
    }
  }

  return fields;
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.json(payload);
}

export async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204);
    return res.end('');
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'method not allowed' });
  }

  const body = parseBody(req.body);
  const validation = validateLead(body);
  if (!validation.valid) {
    return sendJson(res, 400, { ok: false, errors: validation.errors });
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_LEADS_TABLE || 'Leads';

  if (!apiKey || !baseId) {
    return sendJson(res, 500, { ok: false, error: 'CRM is not configured' });
  }

  const airtableResponse = await fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: buildAirtableFields(body) })
    }
  );

  const airtablePayload = await airtableResponse.json().catch(() => ({}));
  if (!airtableResponse.ok) {
    return sendJson(res, 502, {
      ok: false,
      error: 'Airtable rejected the lead',
      details: airtablePayload.error?.message || airtableResponse.status
    });
  }

  return sendJson(res, 201, { ok: true, id: airtablePayload.id });
}

export default handler;

import { applyCors } from './_cors.js';
import {
  EMAIL_RE, groupTotal, ilsRate, normalizePeople, rentalDays, validatePeople
} from './_equipment.js';

const SERVICE_LABELS = {
  travel: 'הזמנת נסיעות',
  equipment: 'הזמנת ציוד',
  apartments: 'הזמנת דירות',
  investors: 'ליווי משקיעים'
};

const ALLOWED_SERVICES = new Set(Object.keys(SERVICE_LABELS));

const TYPE_LABELS = { ski: 'סט סקי', snowboard: 'סט סנובורד', both: 'סקי + סנובורד' };
const LEVEL_LABELS = { kids: 'ילדים', basic: 'בסיסי', pro: 'פרו' };

// Equipment order details: form field -> Airtable column.
const EQUIPMENT_FIELDS = {
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

  // The shop and the team confirm equipment orders by email, so it is mandatory there.
  if (service === 'equipment') {
    const email = clean(input.email);
    if (!email) errors.push('email is required');
    else if (!EMAIL_RE.test(email)) errors.push('email is invalid');
  }

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
    for (const key of Object.keys(EQUIPMENT_FIELDS)) {
      const value = clean(input[key]);
      if (value) fields[EQUIPMENT_FIELDS[key]] = value;
    }
    const details = equipmentOrderNotes(input);
    if (details.length > 0) fields['הערות'] = [fields['הערות'], ...details].filter(Boolean).join('\n');
  }

  return fields;
}

function describePerson(person) {
  return [
    TYPE_LABELS[person.equipmentType],
    LEVEL_LABELS[person.equipmentLevel] && `רמה ${LEVEL_LABELS[person.equipmentLevel]}`,
    person.bootSize && `נעל ${person.bootSize}`,
    person.helmetSize && `קסדה ${person.helmetSize}`,
    person.jacketSize && `מעיל ${person.jacketSize}`,
    person.pantsSize && `מכנסיים ${person.pantsSize}`,
    person.goggles === 'yes' && 'גוגלס'
  ].filter(Boolean).join(', ') || '—';
}

// Lines for the notes column: who is coming and what each person rents (groups only),
// plus the price estimate. The structured equipment columns describe person 1.
function equipmentOrderNotes(input) {
  const people = normalizePeople(input);
  const lines = [];

  if (people.length > 1) {
    lines.push(`מספר אנשים: ${people.length}`);
    people.forEach((person, index) => lines.push(`אדם ${index + 1}: ${describePerson(person)}`));
  }

  const days = rentalDays(clean(input.checkin), clean(input.checkout));
  if (days && !validatePeople(people)) {
    const total = groupTotal(people, days);
    const who = people.length > 1 ? `${people.length} אנשים` : 'אדם אחד';
    lines.push(`הערכת עלות: ₾${total} (≈ ₪${Math.round(total * ilsRate())}) · ${days} ימים · ${who}`);
  }

  return lines;
}

// Same lead with the equipment details written into the notes instead of their own
// columns. Returns null when the lead has no equipment details to move.
function withEquipmentInNotes(fields) {
  const columns = Object.values(EQUIPMENT_FIELDS).filter((column) => column in fields);
  if (columns.length === 0) return null;

  const moved = { ...fields };
  const lines = columns.map((column) => {
    delete moved[column];
    return `${column}: ${fields[column]}`;
  });
  moved['הערות'] = [fields['הערות'], ...lines].filter(Boolean).join('\n');
  return moved;
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.json(payload);
}

export async function handler(req, res) {
  applyCors(req, res);

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

  const createRecord = (fields) => fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    }
  );

  const fields = buildAirtableFields(body);
  let airtableResponse = await createRecord(fields);

  // Airtable rejects the whole record (422) when one column refuses its value, e.g. a
  // select column that has no option for a new equipment level. An order must never be
  // lost over that: save it again with the equipment details in the notes.
  if (airtableResponse.status === 422) {
    const fallback = withEquipmentInNotes(fields);
    if (fallback) airtableResponse = await createRecord(fallback);
  }

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

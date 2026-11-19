import { applyCors } from './_cors.js';
import {
  EMAIL_RE, depositIls as depositIlsFor, groupTotal, normalizePeople, rentalDays, validatePeople
} from './_equipment.js';

const CARDCOM_API = 'https://secure.cardcom.solutions/api/v11/LowProfile/Create';

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') { try { return JSON.parse(body); } catch { return {}; } }
  return body;
}

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').json(payload);
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  const body = parseBody(req.body);
  const name     = (body.name     || '').trim();
  const phone    = (body.phone    || '').trim();
  const email    = (body.email    || '').trim();
  const checkin  = (body.checkin  || '').trim();
  const checkout = (body.checkout || '').trim();

  if (!name || !phone)
    return json(res, 400, { ok: false, error: 'Name and phone required' });
  if (!EMAIL_RE.test(email))
    return json(res, 400, { ok: false, error: 'Valid email required' });
  if (!checkin || !checkout)
    return json(res, 400, { ok: false, error: 'Dates required' });

  const people = normalizePeople(body);
  const problem = validatePeople(people);
  if (problem)
    return json(res, 400, { ok: false, error: problem });

  const days = rentalDays(checkin, checkout);
  if (!days)
    return json(res, 400, { ok: false, error: 'Invalid dates' });

  const totalGel   = groupTotal(people, days);
  const depositIls = depositIlsFor(totalGel);

  const terminal = process.env.CARDCOM_TERMINAL || '1000';
  const apiName  = process.env.CARDCOM_API_NAME  || 'test2025';
  const baseUrl  = process.env.SITE_URL          || 'https://new-gudauri-demo-zbmh.vercel.app';
  const ref      = `eq-${Date.now()}`;

  const TYPE_HE = { ski: 'סקי', snowboard: 'סנובורד', both: 'סקי + סנובורד' };
  const what = people.length > 1 ? `${people.length} אנשים` : TYPE_HE[people[0].equipmentType];
  const productName = `ציוד גודאורי — ${what} (${days} ימים) · מקדמה 10%`;

  const payload = {
    TerminalNumber:        terminal,
    ApiName:               apiName,
    Amount:                depositIls,
    Currency:              1,
    ProductName:           productName,
    SuccessRedirectUrl:    `${baseUrl}/payment-success.html?type=equipment&days=${days}&people=${people.length}&total=${totalGel}&dep=${depositIls}&ref=${encodeURIComponent(ref)}`,
    IndicatorUrl:          `${baseUrl}/api/payment-webhook`,
    Custom1:               ref,
    Custom2:               `${name}|${phone}|${email}|${checkin}|${checkout}|${people[0].equipmentType}|${days}|${people.length}`,
    IsShowBillingAddress:  false,
    IsVirtualTerminalMode: false,
  };

  try {
    const cardcomRes = await fetch(CARDCOM_API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await cardcomRes.json().catch(() => ({}));

    if (data.ResponseCode !== 0) {
      return json(res, 502, { ok: false, error: data.Description || 'Cardcom error', code: data.ResponseCode });
    }

    return json(res, 200, { ok: true, paymentUrl: data.Url, ref, depositIls, totalGel, people: people.length });
  } catch {
    return json(res, 500, { ok: false, error: 'Payment service unavailable' });
  }
}

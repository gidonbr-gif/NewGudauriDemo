import { applyCors } from './_cors.js';

const CARDCOM_API = 'https://secure.cardcom.solutions/api/v11/LowProfile/Create';

// Ski Boom prices — GEL per person per day. Keep in sync with equipment.html.
const PRICES = {
  ski:       { kids: 40, basic: 50, pro: 70 },
  snowboard: { kids: 60, basic: 70, pro: 90 },
  helmet:    10,
  jacket:    20,
  pants:     20,
  goggles:   10,
};

function calcTotal({ equipmentType, equipmentLevel, helmetSize, jacketSize, pantsSize, goggles, days }) {
  const base = equipmentType === 'snowboard'
    ? PRICES.snowboard[equipmentLevel]
    : equipmentType === 'both'
    ? (PRICES.ski[equipmentLevel] + PRICES.snowboard[equipmentLevel])
    : PRICES.ski[equipmentLevel];
  const daily = base
    + (helmetSize ? PRICES.helmet : 0)
    + (jacketSize ? PRICES.jacket : 0)
    + (pantsSize  ? PRICES.pants  : 0)
    + (goggles === 'yes' ? PRICES.goggles : 0);
  return daily * days;
}

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
  const name          = (body.name          || '').trim();
  const phone         = (body.phone         || '').trim();
  const email         = (body.email         || '').trim();
  const checkin       = (body.checkin       || '').trim();
  const checkout      = (body.checkout      || '').trim();
  const equipmentType = (body.equipmentType || '').trim();
  const equipmentLevel= (body.equipmentLevel|| '').trim();
  const helmetSize    = (body.helmetSize    || '').trim();
  const jacketSize    = (body.jacketSize    || '').trim();
  const pantsSize     = (body.pantsSize     || '').trim();
  const goggles       = (body.goggles       || '').trim();

  if (!name || !phone)
    return json(res, 400, { ok: false, error: 'Name and phone required' });
  if (!checkin || !checkout)
    return json(res, 400, { ok: false, error: 'Dates required' });
  if (!['ski', 'snowboard', 'both'].includes(equipmentType))
    return json(res, 400, { ok: false, error: 'Invalid equipment type' });
  if (!['kids', 'basic', 'pro'].includes(equipmentLevel))
    return json(res, 400, { ok: false, error: 'Invalid equipment level' });

  const days = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
  if (!days || days < 1 || days > 30)
    return json(res, 400, { ok: false, error: 'Invalid dates' });

  const totalGel   = calcTotal({ equipmentType, equipmentLevel, helmetSize, jacketSize, pantsSize, goggles, days });
  const ilsRate    = parseFloat(process.env.GEL_ILS_RATE || '1.35');
  const depositIls = Math.ceil(totalGel * 0.10 * ilsRate);

  const terminal = process.env.CARDCOM_TERMINAL || '1000';
  const apiName  = process.env.CARDCOM_API_NAME  || 'test2025';
  const baseUrl  = process.env.SITE_URL          || 'https://new-gudauri-demo-zbmh.vercel.app';
  const ref      = `eq-${Date.now()}`;

  const TYPE_HE = { ski: 'סקי', snowboard: 'סנובורד', both: 'סקי + סנובורד' };
  const productName = `ציוד גודאורי — ${TYPE_HE[equipmentType]} (${days} ימים) · מקדמה 10%`;

  const payload = {
    TerminalNumber:        terminal,
    ApiName:               apiName,
    Amount:                depositIls,
    Currency:              1,
    ProductName:           productName,
    SuccessRedirectUrl:    `${baseUrl}/payment-success.html?type=equipment&days=${days}&total=${totalGel}&dep=${depositIls}&ref=${encodeURIComponent(ref)}`,
    IndicatorUrl:          `${baseUrl}/api/payment-webhook`,
    Custom1:               ref,
    Custom2:               `${name}|${phone}|${email}|${checkin}|${checkout}|${equipmentType}|${days}`,
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

    return json(res, 200, { ok: true, paymentUrl: data.Url, ref, depositIls, totalGel });
  } catch {
    return json(res, 500, { ok: false, error: 'Payment service unavailable' });
  }
}

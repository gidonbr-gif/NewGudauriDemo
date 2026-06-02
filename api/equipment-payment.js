const CARDCOM_API = 'https://secure.cardcom.solutions/api/v11/LowProfile/Create';

const PRICES = {
  ski:       { beginner: 25, intermediate: 35, advanced: 50 },
  snowboard: { beginner: 28, intermediate: 38, advanced: 55 },
  helmet:    12,
  clothing:  20,
  goggles:   5,
};
const PACKAGE_DISCOUNT = 0.20;

function calcTotal({ equipmentType, equipmentLevel, jacketSize, pantsSize, goggles, days }) {
  const base = equipmentType === 'snowboard'
    ? PRICES.snowboard[equipmentLevel]
    : equipmentType === 'both'
    ? (PRICES.ski[equipmentLevel] + PRICES.snowboard[equipmentLevel])
    : PRICES.ski[equipmentLevel];
  const clo = (jacketSize || pantsSize) ? PRICES.clothing : 0;
  const gog = goggles === 'yes' ? PRICES.goggles : 0;
  const daily = base + PRICES.helmet + clo + gog;
  return Math.round(daily * days * (1 - PACKAGE_DISCOUNT));
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
  const jacketSize    = (body.jacketSize    || '').trim();
  const pantsSize     = (body.pantsSize     || '').trim();
  const goggles       = (body.goggles       || '').trim();

  if (!name || !phone)
    return json(res, 400, { ok: false, error: 'Name and phone required' });
  if (!checkin || !checkout)
    return json(res, 400, { ok: false, error: 'Dates required' });
  if (!['ski', 'snowboard', 'both'].includes(equipmentType))
    return json(res, 400, { ok: false, error: 'Invalid equipment type' });
  if (!['beginner', 'intermediate', 'advanced'].includes(equipmentLevel))
    return json(res, 400, { ok: false, error: 'Invalid equipment level' });

  const days = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
  if (!days || days < 1 || days > 30)
    return json(res, 400, { ok: false, error: 'Invalid dates' });

  const totalUsd   = calcTotal({ equipmentType, equipmentLevel, jacketSize, pantsSize, goggles, days });
  const depositUsd = Math.ceil(totalUsd * 0.10);
  const ilsRate    = parseFloat(process.env.USD_ILS_RATE || '3.7');
  const depositIls = Math.ceil(depositUsd * ilsRate);

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
    SuccessRedirectUrl:    `${baseUrl}/payment-success.html?type=equipment&days=${days}&total=${totalUsd}&ref=${encodeURIComponent(ref)}`,
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

    return json(res, 200, { ok: true, paymentUrl: data.Url, ref, depositIls, totalUsd });
  } catch {
    return json(res, 500, { ok: false, error: 'Payment service unavailable' });
  }
}

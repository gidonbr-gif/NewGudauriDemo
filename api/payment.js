const CARDCOM_API = 'https://secure.cardcom.solutions/api/v11/LowProfile/Create';

const APARTMENT_PRICES = {
  atrium: parseInt(process.env.PRICE_ATRIUM || '370', 10),
  suits:  parseInt(process.env.PRICE_SUITS  || '450', 10),
};

const APARTMENT_NAMES_HE = {
  atrium: 'לינה בגודאורי — דירת Atrium',
  suits:  'לינה בגודאורי — דירת Suits',
};

function clean(v) {
  return typeof v === 'string' ? v.trim() : '';
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

  const body    = parseBody(req.body);
  const apt     = clean(body.apartment);
  const nights  = parseInt(body.nights, 10);
  const name    = clean(body.name);
  const phone   = clean(body.phone);
  const email   = clean(body.email);
  const checkin = clean(body.checkin);
  const checkout= clean(body.checkout);

  if (!['atrium', 'suits'].includes(apt))      return json(res, 400, { ok: false, error: 'Invalid apartment' });
  if (!nights || nights < 1 || nights > 90)    return json(res, 400, { ok: false, error: 'Invalid nights' });
  if (!name || !phone)                          return json(res, 400, { ok: false, error: 'Name and phone required' });

  const pricePerNight = APARTMENT_PRICES[apt];
  const amount        = pricePerNight * nights;
  const ref           = `${apt}-${Date.now()}`;

  const terminal = process.env.CARDCOM_TERMINAL || '1000';
  const apiName  = process.env.CARDCOM_API_NAME || 'test2025';
  const baseUrl  = process.env.SITE_URL || 'https://new-gudauri-demo-zbmh.vercel.app';

  const payload = {
    TerminalNumber:     terminal,
    ApiName:            apiName,
    Amount:             amount,
    Currency:           1,
    ProductName:        APARTMENT_NAMES_HE[apt],
    SuccessRedirectUrl: `${baseUrl}/payment-success.html?apt=${apt}&nights=${nights}&ref=${encodeURIComponent(ref)}`,
    IndicatorUrl:       `${baseUrl}/api/payment-webhook`,
    Custom1:            ref,
    Custom2:            `${name}|${phone}|${email}|${checkin}|${checkout}`,
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
      return json(res, 502, {
        ok:    false,
        error: data.Description || 'Cardcom error',
        code:  data.ResponseCode,
      });
    }

    return json(res, 200, {
      ok:         true,
      paymentUrl: data.Url,
      ref,
      amount,
    });
  } catch {
    return json(res, 500, { ok: false, error: 'Payment service unavailable' });
  }
}

// Ski Boom equipment price list and order maths, shared by the deposit API
// (equipment-payment.js) and the CRM API (leads.js).
// Prices are Georgian lari (GEL) per person per day.
// Keep in sync with PRICES in equipment.html — tests/equipment.test.mjs enforces it.

export const PRICES = {
  ski:       { kids: 40, basic: 50, pro: 70 },
  snowboard: { kids: 60, basic: 70, pro: 90 },
  helmet:    10,
  jacket:    20,
  pants:     20,
  goggles:   10,
};

export const MAX_PEOPLE = 10;
export const TYPES = ['ski', 'snowboard', 'both'];
export const LEVELS = ['kids', 'basic', 'pro'];
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PERSON_FIELDS = ['equipmentType', 'equipmentLevel', 'bootSize', 'helmetSize', 'jacketSize', 'pantsSize', 'goggles'];

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Everyone on an order. New clients send `people` (one entry per person); an order
// without it is a single person described by the top-level fields.
export function normalizePeople(input) {
  const list = Array.isArray(input.people) && input.people.length > 0 ? input.people.slice(0, 50) : [input];
  return list.map((entry) => {
    const person = {};
    for (const field of PERSON_FIELDS) person[field] = clean(entry && entry[field]);
    return person;
  });
}

// Returns an error message, or null when the group can be priced.
export function validatePeople(people) {
  if (people.length < 1 || people.length > MAX_PEOPLE) return 'Invalid group size';
  for (const person of people) {
    if (!TYPES.includes(person.equipmentType)) return 'Invalid equipment type';
    if (!LEVELS.includes(person.equipmentLevel)) return 'Invalid equipment level';
  }
  return null;
}

// GEL per day for one valid person.
export function dailyPrice(person) {
  const base = person.equipmentType === 'snowboard'
    ? PRICES.snowboard[person.equipmentLevel]
    : person.equipmentType === 'both'
    ? PRICES.ski[person.equipmentLevel] + PRICES.snowboard[person.equipmentLevel]
    : PRICES.ski[person.equipmentLevel];
  return base
    + (person.helmetSize ? PRICES.helmet : 0)
    + (person.jacketSize ? PRICES.jacket : 0)
    + (person.pantsSize ? PRICES.pants : 0)
    + (person.goggles === 'yes' ? PRICES.goggles : 0);
}

// Whole rental days between two dates, or null when they are not a usable 1–30 day range.
export function rentalDays(checkin, checkout) {
  const days = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
  return Number.isFinite(days) && days >= 1 && days <= 30 ? days : null;
}

export function groupTotal(people, days) {
  return people.reduce((sum, person) => sum + dailyPrice(person), 0) * days;
}

export function ilsRate() {
  return parseFloat(process.env.GEL_ILS_RATE || '1.35');
}

// The deposit is 10% of the full price. It is deducted from the full price, so the
// customer pays the rest at the shop.
export const DEPOSIT_SHARE = 0.10;

// 10% of the lari total, in lari (two decimals).
export function depositGel(totalGel) {
  return Math.round(totalGel * DEPOSIT_SHARE * 100) / 100;
}

// What is left to pay at the shop, in lari.
export function balanceGel(totalGel) {
  return Math.round((totalGel - depositGel(totalGel)) * 100) / 100;
}

// What the card is charged: that 10% converted to shekels and rounded up to a whole shekel.
// The value is rounded to agorot first so floating-point noise cannot add a shekel
// (e.g. ₾1800 × 10% × 1.35 is 243 exactly, but 243.00000000000003 unrounded).
// equipment.html uses the same formula to show the amount before paying.
export function depositIls(totalGel) {
  return Math.ceil(Math.round(totalGel * DEPOSIT_SHARE * ilsRate() * 100) / 100);
}

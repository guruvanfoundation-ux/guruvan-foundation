const INDIAN_CITY_SUGGESTIONS = [
  'Ahmedabad', 'Ahemdabad', 'Ajmer', 'Allahabad', 'Amritsar', 'Bengaluru', 'Bhopal', 'Chandigarh', 'Chennai',
  'Coimbatore', 'Delhi', 'Dhanbad', 'Gandhinagar', 'Gujarat', 'Hyderabad', 'Jaipur', 'Jodhpur', 'Kanpur',
  'Kochi', 'Kolhapur', 'Kolkata', 'Lucknow', 'Mumbai', 'Nagpur', 'Nashik', 'Pune', 'Rajkot', 'Surat',
  'Thane', 'Vadodara', 'Varanasi', 'Visakhapatnam'
];

export function normalizePhone(value = '') {
  const digits = `${value}`.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return digits.length >= 10 ? `+${digits}` : digits;
}

export function validatePhone(value = '') {
  const normalized = normalizePhone(value);
  const digits = normalized.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91');
}

export function validateEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function getCitySuggestions(input = '') {
  const q = String(input || '').trim().toLowerCase();
  if (!q) return [];
  return INDIAN_CITY_SUGGESTIONS.filter((city) => city.toLowerCase().includes(q)).slice(0, 6);
}

export function validateVolunteerPayload(payload = {}) {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim();
  const phone = normalizePhone(payload.phone || '');
  const city = String(payload.city || '').trim();
  const interest = String(payload.interest || 'Volunteer').trim() || 'Volunteer';

  if (!name || !email || !phone || !city) {
    return { valid: false, error: 'Name, email, phone and city are required.' };
  }

  if (!validateEmail(email)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  if (!validatePhone(phone)) {
    return { valid: false, error: 'Please enter a valid Indian mobile number.' };
  }

  const cleaned = {
    name,
    email,
    phone,
    city,
    interest,
  };

  return { valid: true, cleaned };
}

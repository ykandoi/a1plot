"use client";
import React, { useMemo } from 'react';
import { Phone } from 'lucide-react';

// Country dial codes. India first (the site's primary market), then the rest
// alphabetically. `iso` only exists to keep React keys unique — several
// countries share a dial code (+1 is US and Canada, +7 is Russia and
// Kazakhstan), so the code alone can't be the key.
export const COUNTRY_CODES = [
  { iso: 'IN', code: '+91', label: 'India' },
  { iso: 'AU', code: '+61', label: 'Australia' },
  { iso: 'BD', code: '+880', label: 'Bangladesh' },
  { iso: 'CA', code: '+1', label: 'Canada' },
  { iso: 'CN', code: '+86', label: 'China' },
  { iso: 'FR', code: '+33', label: 'France' },
  { iso: 'DE', code: '+49', label: 'Germany' },
  { iso: 'ID', code: '+62', label: 'Indonesia' },
  { iso: 'IE', code: '+353', label: 'Ireland' },
  { iso: 'IT', code: '+39', label: 'Italy' },
  { iso: 'JP', code: '+81', label: 'Japan' },
  { iso: 'KE', code: '+254', label: 'Kenya' },
  { iso: 'MY', code: '+60', label: 'Malaysia' },
  { iso: 'NP', code: '+977', label: 'Nepal' },
  { iso: 'NL', code: '+31', label: 'Netherlands' },
  { iso: 'NZ', code: '+64', label: 'New Zealand' },
  { iso: 'NG', code: '+234', label: 'Nigeria' },
  { iso: 'OM', code: '+968', label: 'Oman' },
  { iso: 'PK', code: '+92', label: 'Pakistan' },
  { iso: 'PH', code: '+63', label: 'Philippines' },
  { iso: 'QA', code: '+974', label: 'Qatar' },
  { iso: 'SA', code: '+966', label: 'Saudi Arabia' },
  { iso: 'SG', code: '+65', label: 'Singapore' },
  { iso: 'ZA', code: '+27', label: 'South Africa' },
  { iso: 'LK', code: '+94', label: 'Sri Lanka' },
  { iso: 'CH', code: '+41', label: 'Switzerland' },
  { iso: 'TH', code: '+66', label: 'Thailand' },
  { iso: 'AE', code: '+971', label: 'UAE' },
  { iso: 'GB', code: '+44', label: 'United Kingdom' },
  { iso: 'US', code: '+1', label: 'United States' },
];

export const DEFAULT_DIAL_CODE = '+91';

// Split a stored "+91 98765 43210" back into its dial code and local number so
// the field can be re-populated when editing an existing profile.
export function splitPhone(value) {
  const raw = String(value || '').trim();
  if (!raw) return { code: DEFAULT_DIAL_CODE, number: '' };
  if (!raw.startsWith('+')) return { code: DEFAULT_DIAL_CODE, number: raw };
  // Longest dial code first, so +971 isn't mistaken for +97/+9.
  const match = [...COUNTRY_CODES]
    .sort((a, b) => b.code.length - a.code.length)
    .find(c => raw.startsWith(c.code));
  if (!match) return { code: DEFAULT_DIAL_CODE, number: raw.replace(/^\+/, '') };
  return { code: match.code, number: raw.slice(match.code.length).trim() };
}

// True once there are enough digits to be a plausible phone number. Deliberately
// loose — national lengths vary from 7 to 12 digits — it only catches empty or
// obviously-truncated input.
export function isValidPhone(value) {
  const { number } = splitPhone(value);
  const digits = number.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * PhoneField — country-code dropdown + national number, emitting a single
 * combined "+91 9876543210" string via onChange.
 */
export default function PhoneField({ value, onChange, required = true, label = 'Phone Number', id }) {
  const { code, number } = useMemo(() => splitPhone(value), [value]);

  const emit = (nextCode, nextNumber) => {
    const trimmed = String(nextNumber).replace(/[^\d\s-]/g, '').trim();
    onChange(trimmed ? `${nextCode} ${trimmed}` : '');
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>
        <Phone size={14} style={{ display: 'inline', marginRight: 5 }} />
        {label} {required && <span style={{ color: 'var(--accent-red)' }}>*</span>}
      </label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <select
          className="form-input"
          aria-label="Country code"
          style={{ flex: '0 0 8.5rem', minWidth: 0 }}
          value={code}
          onChange={(e) => emit(e.target.value, number)}
        >
          {COUNTRY_CODES.map(c => (
            <option key={c.iso} value={c.code}>{c.code} {c.label}</option>
          ))}
        </select>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          className="form-input"
          style={{ flex: 1, minWidth: 0 }}
          placeholder="98765 43210"
          required={required}
          value={number}
          onChange={(e) => emit(code, e.target.value)}
        />
      </div>
    </div>
  );
}

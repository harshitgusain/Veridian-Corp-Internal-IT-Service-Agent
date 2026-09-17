/**
 * Timezone and Timestamp Formatting Utilities for Veridian Corp IT Support Agent
 * Provides accurate localization for employees across India (IST), UTC, and HQ (US Pacific).
 */

export type TimezoneMode = 'local' | 'IST' | 'UTC' | 'HQ';

export interface TimezoneInfo {
  id: TimezoneMode;
  label: string;
  timeZone: string;
  abbr: string;
}

export const TIMEZONE_OPTIONS: TimezoneInfo[] = [
  {
    id: 'local',
    label: 'Your Local Device Time',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
    abbr: 'Local',
  },
  {
    id: 'IST',
    label: 'India Standard Time (IST, UTC+5:30)',
    timeZone: 'Asia/Kolkata',
    abbr: 'IST',
  },
  {
    id: 'UTC',
    label: 'Coordinated Universal Time (UTC)',
    timeZone: 'UTC',
    abbr: 'UTC',
  },
  {
    id: 'HQ',
    label: 'Veridian HQ (US Pacific Time)',
    timeZone: 'America/Los_Angeles',
    abbr: 'PT',
  },
];

/**
 * Parses any timestamp string into a valid Date object.
 * Handles ISO-8601 with Z, or legacy "YYYY-MM-DD HH:mm:ss" UTC strings.
 */
export function parseDate(dateStr?: string | null): Date {
  if (!dateStr) return new Date();

  // If already full ISO or has timezone offset
  if (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.length > 20)) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }

  // If format is "YYYY-MM-DD HH:mm:ss" or similar without timezone, treat as UTC
  const normalized = dateStr.replace(' ', 'T') + (dateStr.includes('Z') ? '' : 'Z');
  const d = new Date(normalized);
  if (!isNaN(d.getTime())) return d;

  return new Date(dateStr);
}

/**
 * Formats a timestamp into human-readable text respecting the chosen timezone mode.
 */
export function formatTimestamp(
  dateStr?: string | null,
  mode: TimezoneMode = 'local',
  formatStyle: 'full' | 'time-only' | 'compact' = 'full'
): string {
  const date = parseDate(dateStr);
  if (isNaN(date.getTime())) return dateStr || '—';

  const tzInfo = TIMEZONE_OPTIONS.find((t) => t.id === mode) || TIMEZONE_OPTIONS[0];
  const targetTz = mode === 'local' ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata') : tzInfo.timeZone;

  try {
    if (formatStyle === 'time-only') {
      const timeStr = new Intl.DateTimeFormat('en-IN', {
        timeZone: targetTz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(date);
      const abbr = getTimezoneAbbr(targetTz, date);
      return `${timeStr} ${abbr}`;
    }

    if (formatStyle === 'compact') {
      const datePart = new Intl.DateTimeFormat('en-IN', {
        timeZone: targetTz,
        day: '2-digit',
        month: 'short',
      }).format(date);
      const timePart = new Intl.DateTimeFormat('en-IN', {
        timeZone: targetTz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);
      const abbr = getTimezoneAbbr(targetTz, date);
      return `${datePart}, ${timePart} ${abbr}`;
    }

    // Default 'full'
    const fullStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: targetTz,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
    const abbr = getTimezoneAbbr(targetTz, date);
    return `${fullStr} (${abbr})`;
  } catch {
    return date.toLocaleString();
  }
}

/**
 * Returns clean timezone abbreviation like IST, UTC, PDT, PST
 */
export function getTimezoneAbbr(timeZone: string, date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : timeZone;
  } catch {
    return timeZone;
  }
}

/**
 * Helper to get user's local timezone name and offset
 */
export function getUserLocalTimezoneSummary(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    const abbr = getTimezoneAbbr(tz);
    const offsetMinutes = -new Date().getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const mins = Math.abs(offsetMinutes) % 60;
    const formattedOffset = `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    return `${abbr} (${formattedOffset}) • ${tz}`;
  } catch {
    return 'IST (UTC+05:30) • Asia/Kolkata';
  }
}

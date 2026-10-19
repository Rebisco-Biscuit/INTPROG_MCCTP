/** Display helpers for the Student Information module. */

export function fullName(person: { firstName: string; middleName?: string; lastName: string }): string {
  return [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' ') || 'Unnamed trainee';
}

/** "Dela Cruz, Juan A." for list rows, which are sorted by last name. */
export function listName(person: { firstName: string; middleName: string; lastName: string }): string {
  const middleInitial = person.middleName ? ` ${person.middleName.charAt(0)}.` : '';
  if (!person.lastName) return fullName(person);
  return `${person.lastName}, ${person.firstName}${middleInitial}`;
}

/** "HIGH_SCHOOL" -> "High School" */
export function enumLabel(value: string | null | undefined): string {
  if (!value) return '—';
  if (value === 'NA') return 'N/A';
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Calendar date (YYYY-MM-DD) shown as-is, without a time zone shift. */
export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return '—';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Timestamp shown as a local calendar date. */
export function formatTimestamp(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** "08:00" -> "8:00 AM" */
export function formatTime(value: string): string {
  const [hours, minutes] = value.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

export function valueOrDash(value: string | null | undefined): string {
  return value?.trim() ? value : '—';
}

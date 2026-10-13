/**
 * Date helpers for FitFuel
 */

export function toIsoDate(date = new Date()) {
  if (!date) return new Date().toISOString().split('T')[0];
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  return d.toISOString().split('T')[0];
}

export function formatDisplayDate(date = new Date()) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(date = new Date()) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getWeekDays(referenceDate = new Date()) {
  const now = new Date(referenceDate);
  const monday = new Date(now);
  const dayIndex = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
  monday.setDate(now.getDate() - dayIndex);
  monday.setHours(0, 0, 0, 0);

  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const fullNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label,
      fullDay: fullNames[i],
      dateStr: toIsoDate(d),
      dateObj: d,
      isToday: toIsoDate(d) === toIsoDate(now),
    };
  });
}

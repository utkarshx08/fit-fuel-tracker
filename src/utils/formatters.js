/**
 * Number and string formatting utilities
 */

export function formatNumber(val, decimals = 0) {
  const num = Number(val);
  if (isNaN(num)) return '0';
  if (decimals === 0) {
    return Math.round(num).toLocaleString('en-US');
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCalories(cal) {
  return `${formatNumber(cal)} kcal`;
}

export function formatGrams(g) {
  return `${formatNumber(g)} g`;
}

export function getGreeting(date = new Date()) {
  const hours = date.getHours();
  if (hours < 12) return 'Good morning';
  if (hours < 18) return 'Good afternoon';
  return 'Good evening';
}

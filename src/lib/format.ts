export function formatPrice(cents: number, locale = 'fr-FR', currency = 'EUR') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0 }).format(cents / 100);
}

export function formatDate(date: Date | string, locale = 'fr-FR') {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(typeof date === 'string' ? new Date(date) : date);
}

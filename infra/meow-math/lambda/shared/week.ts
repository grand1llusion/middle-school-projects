const pad = (n: number) => String(n).padStart(2, '0');

export function getWeekId(now = new Date()): string {
  const denverDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Denver',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);

  const [year, month, day] = denverDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  // 0=Sun, 1=Mon, ..., 6=Sat → offset to previous Monday
  const dow = date.getUTCDay();
  const daysToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(date.getTime() + daysToMonday * 86400000);

  return `${monday.getUTCFullYear()}-${pad(monday.getUTCMonth() + 1)}-${pad(monday.getUTCDate())}`;
}

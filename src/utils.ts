const formatter = new Intl.DateTimeFormat('ru', {
  timeZone: 'Europe/Moscow',
  hour12: false,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});

export function formatTs(ts: string): string {
  return formatter.format(new Date(+ts * 1000));
}

export function filterRepeated(arr: string[]) {
  return [...new Set(arr)];
}

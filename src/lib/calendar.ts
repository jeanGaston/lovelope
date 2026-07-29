function toGCalDate(d: Date) {
  return d.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
}

export function makeIcs(title: string, startsAt: Date, description: string) {
  const start = toGCalDate(startsAt);
  const end = toGCalDate(new Date(startsAt.getTime() + 60 * 60 * 1000));
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//lovelope.app//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:${title}`, `DESCRIPTION:${description}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

export function makeGCalUrl(title: string, startsAt: Date, description: string) {
  const start = toGCalDate(startsAt);
  const end = toGCalDate(new Date(startsAt.getTime() + 60 * 60 * 1000));
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description)}`;
}

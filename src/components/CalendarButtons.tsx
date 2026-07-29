'use client';

import { makeIcs, makeGCalUrl } from '@/lib/calendar';

interface Props {
  title: string;
  startsAt: Date;
  description: string;
}

export default function CalendarButtons({ title, startsAt, description }: Props) {
  function downloadIcs() {
    const blob = new Blob([makeIcs(title, startsAt, description)], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'date.ics';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-2">
      <a
        href={makeGCalUrl(title, startsAt, description)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700
                   border border-blue-200 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
      >
        📅 Add to Google Calendar
      </a>
      <button
        onClick={downloadIcs}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700
                   border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
      >
        📥 Download .ics
      </button>
    </div>
  );
}

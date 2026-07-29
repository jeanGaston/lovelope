import Link from 'next/link';

const GITHUB_URL = 'https://github.com/jeangaston/lovelope';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-sm mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col gap-3 text-sm text-gray-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💌</span>
            <span>
              <Link
                href="/"
                className="font-semibold text-gray-600 hover:text-pink-500 transition-colors rounded
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
              >
                lovelope.app
              </Link>
              {' '}· the adorable way to ask someone out
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs hidden sm:inline text-gray-300">Proposals auto-delete after 30 days</span>
            <Link
              href="/create"
              className="text-pink-500 hover:underline font-medium text-xs rounded
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
            >
              Create a proposal →
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 text-xs text-gray-300 border-t border-gray-100 pt-3">
          <span>Made with ❤️ by jeangaston</span>
          <span className="text-gray-200">·</span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-pink-500 transition-colors rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55v-2.14c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.29-1.68-1.29-1.68-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a10.98 10.98 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.16v3.2c0 .3.21.66.8.55C20.21 21.39 23.5 17.08 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

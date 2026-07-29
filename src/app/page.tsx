import Link from 'next/link';
import LoveFusion from '@/components/LoveFusion';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-400 via-pink-500 to-rose-500 flex flex-col items-center justify-center px-4 py-16 text-white">
      {/* Ambient glow, purely decorative */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-yellow-300/10 blur-3xl" />
      </div>

      <div className="relative text-center max-w-2xl w-full">
        <LoveFusion className="mb-6" />
        <h1 className="font-display text-5xl md:text-6xl font-extrabold mb-4 text-balance">
          The adorable way to ask someone out
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-10 text-balance">
          Create a personalized proposal, share the link, and watch the magic happen.
        </p>

        {/* Primary CTA */}
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30 shadow-xl">
          <Link
            href="/create"
            className="block w-full bg-white text-pink-600 font-extrabold px-8 py-5 rounded-2xl text-xl
                       shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all
                       focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
          >
            Create your proposal 🚀
          </Link>
        </div>
      </div>
    </main>
  );
}

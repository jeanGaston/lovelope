import Link from 'next/link';
import LoveFusion from '@/components/LoveFusion';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-rose-500 flex flex-col items-center justify-center px-4 text-white">
      <div className="text-center max-w-2xl w-full">
        <LoveFusion className="mb-6" />
        <h1 className="font-display text-5xl md:text-6xl font-extrabold mb-4 text-balance">
          The adorable way to ask someone out
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-10 text-balance">
          Create a personalized proposal, share the link, and watch the magic happen.
        </p>

        {/* Primary CTA */}
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-white/30">
          <Link
            href="/create"
            className="block w-full bg-white text-pink-600 font-extrabold px-8 py-5 rounded-2xl text-xl
                       shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            Create your proposal 🚀
          </Link>
          <p className="text-white/60 text-sm mt-3">
            You&apos;ll get two private links: one to share, one to manage.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { emoji: '🎨', title: 'Pick a theme', desc: 'Sunset, ocean, midnight… or design your own gradient.' },
            { emoji: '🗓', title: 'Real date picker', desc: 'Offer specific date & time slots for each activity.' },
            { emoji: '🎭', title: 'Add a GIF', desc: 'Make your proposal even more irresistible with a GIF.' },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30"
            >
              <div className="text-3xl mb-2">{step.emoji}</div>
              <h3 className="font-display font-bold text-lg mb-1">{step.title}</h3>
              <p className="text-white/70 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

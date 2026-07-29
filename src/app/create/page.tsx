import CreateClient from './CreateClient';

export const metadata = { title: 'Create a proposal, no account needed' };

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-rose-500 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 text-white">
          <div className="text-5xl mb-3">💌</div>
          <h1 className="font-display text-3xl font-extrabold mb-1 text-balance">Create your proposal</h1>
          <p className="text-white/80 text-balance">No account needed, you get two private links when you&apos;re done.</p>
        </div>
        <CreateClient />
      </div>
    </div>
  );
}

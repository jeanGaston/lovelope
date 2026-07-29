import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-rose-500 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-2">Not found</h1>
        <p className="text-gray-500 mb-8">
          This proposal doesn&apos;t exist or has been removed.
        </p>
        <Link href="/" className={buttonVariants({ size: 'lg', className: 'px-8' })}>
          Go home
        </Link>
      </div>
    </div>
  );
}

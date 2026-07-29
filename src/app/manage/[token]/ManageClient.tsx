'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { themes, getGradientStyle, formatSlotDate, type Theme } from '@/lib/themes';
import { keyFromHash, decryptField, decryptOptional } from '@/lib/crypto-client';
import Card from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';
import CalendarButtons from '@/components/CalendarButtons';
import type { Proposal, ActivityOption, TimeSlot, Response } from '@prisma/client';

type FullProposal = Proposal & {
  activities: (ActivityOption & { slots: TimeSlot[] })[];
  response: (Response & {
    selectedActivity: ActivityOption | null;
    selectedTimeSlot: TimeSlot | null;
  }) | null;
};

interface DecryptedSlot { id: string; label: string; startsAt: string | null }
interface DecryptedActivity { id: string; emoji: string; title: string; description: string | null; slots: DecryptedSlot[] }
interface DecryptedManage {
  title: string;
  recipientName: string;
  activities: DecryptedActivity[];
  response: { answer: string; note: string | null } | null;
}

const answerEmoji = { yes: '🎉', maybe: '🤔', no: '💔' };
const answerLabel = { yes: 'Yes!', maybe: 'Maybe', no: 'No' };
const statusBadge: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  answered: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-600',
};

export default function ManageClient({
  proposal, token, publicUrl, manageUrl,
}: {
  proposal: FullProposal;
  token: string;
  publicUrl: string;
  manageUrl: string;
}) {
  const router = useRouter();
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedManage, setCopiedManage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // End-to-end decryption: the key lives only in this page's URL fragment,
  // which the server never sees.
  const [decrypted, setDecrypted] = useState<DecryptedManage | null>(null);
  const [keyMissing, setKeyMissing] = useState(false);
  const [hash, setHash] = useState('');

  const theme = themes[proposal.theme as Theme];
  const customGradient =
    proposal.gradientFrom && proposal.gradientVia && proposal.gradientTo
      ? { from: proposal.gradientFrom, via: proposal.gradientVia, to: proposal.gradientTo }
      : null;
  const gradStyle = getGradientStyle(proposal.theme as Theme, customGradient);

  useEffect(() => {
    const h = window.location.hash;
    setHash(h);
    const k = keyFromHash(h);
    if (!k) { setKeyMissing(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const [title, recipientName] = await Promise.all([
          decryptField(k, proposal.title),
          decryptField(k, proposal.recipientName),
        ]);
        const activities = await Promise.all(proposal.activities.map(async (a) => {
          const [aTitle, aDesc] = await Promise.all([
            decryptField(k, a.title),
            decryptOptional(k, a.description),
          ]);
          const slots = await Promise.all(a.slots.map(async (s) => {
            const [label, startsAt] = await Promise.all([
              decryptField(k, s.label),
              decryptOptional(k, s.startsAt),
            ]);
            return { id: s.id, label, startsAt: startsAt ?? null };
          }));
          return { id: a.id, emoji: a.emoji, title: aTitle, description: aDesc ?? null, slots };
        }));
        let response: DecryptedManage['response'] = null;
        if (proposal.response) {
          const [answer, note] = await Promise.all([
            decryptField(k, proposal.response.answer),
            decryptOptional(k, proposal.response.note),
          ]);
          response = { answer, note: note ?? null };
        }
        if (!cancelled) setDecrypted({ title, recipientName, activities, response });
      } catch {
        if (!cancelled) setKeyMissing(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fullPublicUrl = `${publicUrl}${hash}`;
  const fullManageUrl = `${manageUrl}${hash}`;

  useEffect(() => {
    if (!showQr || !hash) return;
    let cancelled = false;
    QRCode.toDataURL(fullPublicUrl, { width: 200, margin: 2 })
      .then((url) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { if (!cancelled) setQrDataUrl(''); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQr, hash]);

  function copy(url: string, which: 'public' | 'manage') {
    navigator.clipboard.writeText(url);
    if (which === 'public') { setCopiedPublic(true); setTimeout(() => setCopiedPublic(false), 2000); }
    else { setCopiedManage(true); setTimeout(() => setCopiedManage(false), 2000); }
  }

  async function handlePublish() {
    setPublishing(true);
    await fetch(`/api/manage/${token}/publish`, { method: 'POST' });
    setPublishing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm('Delete this proposal? This removes all data including the response.')) return;
    setDeleting(true);
    await fetch(`/api/manage/${token}`, { method: 'DELETE' });
    router.push('/');
  }

  const selectedActivity = decrypted?.activities.find((a) => a.id === proposal.response?.selectedActivityId);
  const selectedSlot = selectedActivity?.slots.find((s) => s.id === proposal.response?.selectedTimeSlotId) ?? null;

  const calendarSlot =
    decrypted?.response?.answer === 'yes' && selectedSlot?.startsAt
      ? {
          startsAt: new Date(selectedSlot.startsAt),
          title: `${selectedActivity?.title ?? 'Date'} with ${decrypted.recipientName}`,
        }
      : null;

  if (keyMissing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center max-w-md w-full border border-gray-100">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-display text-2xl font-extrabold text-gray-900 mb-2">
            This link looks incomplete
          </h1>
          <p className="text-gray-500">
            Make sure you copied the whole link, including everything after the “#”.
          </p>
        </div>
      </div>
    );
  }

  if (!decrypted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-6xl animate-pulse">💌</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header banner */}
      <div className={gradStyle.className ?? ''} style={gradStyle.style}>
        <div className="max-w-3xl mx-auto px-4 py-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors">💌 lovelope.app</Link>
            <span className="text-white/40">›</span>
            <span className="text-sm font-semibold">Manage proposal</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold mb-1">{decrypted.title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-white/80 text-sm">For <strong>{decrypted.recipientName}</strong></span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge[proposal.status]} bg-white/20 text-white`}>
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-5">
        {/* Response card */}
        {decrypted.response ? (
          <Card>
            <h2 className="font-display font-bold text-gray-900 mb-4">Response received</h2>
            <div className="flex items-center gap-4">
              <span className="text-5xl">
                {answerEmoji[decrypted.response.answer as keyof typeof answerEmoji]}
              </span>
              <div>
                <p className="font-display text-2xl font-extrabold text-gray-900">
                  {answerLabel[decrypted.response.answer as keyof typeof answerLabel]}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(proposal.response!.respondedAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            {selectedActivity && (
              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Chose</p>
                <p className="font-semibold text-gray-900">
                  {selectedActivity.emoji} {selectedActivity.title}
                </p>
                {selectedSlot && (
                  <p className="text-sm text-gray-500 mt-1">
                    🗓 {formatSlotDate(selectedSlot.startsAt, selectedSlot.label)}
                  </p>
                )}
              </div>
            )}
            {decrypted.response.note && (
              <div className="mt-3 bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Note</p>
                <p className="text-gray-700 italic">&ldquo;{decrypted.response.note}&rdquo;</p>
              </div>
            )}
            {calendarSlot && (
              <CalendarButtons
                title={calendarSlot.title}
                startsAt={calendarSlot.startsAt}
                description={`Arranged via lovelope.app: ${decrypted.title}`}
              />
            )}
          </Card>
        ) : (
          <Card className="text-center">
            <div className="text-4xl mb-2">⏳</div>
            <p className="font-semibold text-gray-700">Waiting for a response</p>
            <p className="text-sm text-gray-400 mt-1">
              Share the public link with {decrypted.recipientName} to get started.
            </p>
          </Card>
        )}

        {/* Links + QR */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-gray-900">Your links</h2>
            <button
              onClick={() => setShowQr((v) => !v)}
              className="text-xs font-semibold text-gray-500 hover:text-pink-500 transition-colors flex items-center gap-1"
            >
              📱 {showQr ? 'Hide QR' : 'Show QR code'}
            </button>
          </div>

          {showQr && (
            <div className="flex flex-col items-center gap-2 py-2">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="QR code for public proposal link"
                  width={200}
                  height={200}
                  className="rounded-xl border border-gray-100 shadow-sm"
                />
              ) : (
                <div className="w-[200px] h-[200px] rounded-xl border border-gray-100 bg-gray-50 animate-pulse" />
              )}
              <p className="text-xs text-gray-400">Scan to open the proposal</p>
            </div>
          )}

          {([
            { emoji: '📤', label: 'Public link (share with them)', url: fullPublicUrl, which: 'public' as const, copied: copiedPublic },
            { emoji: '🔒', label: 'Management link (keep private)', url: fullManageUrl, which: 'manage' as const, copied: copiedManage },
          ] as const).map(({ emoji, label, url, which, copied }) => (
            <div key={which}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{emoji} {label}</p>
              <div className="flex gap-2">
                <input readOnly value={url} aria-label={label}
                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 min-w-0
                             focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition" />
                <button onClick={() => copy(url, which)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 ${
                    copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                  <span aria-live="polite">{copied ? '✓' : 'Copy'}</span>
                </button>
              </div>
              {which === 'public' && (
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-pink-600 hover:underline mt-1 block">
                  Preview →
                </a>
              )}
            </div>
          ))}
        </Card>

        {/* Activities summary */}
        <Card>
          <h2 className="font-display font-bold text-gray-900 mb-4">Activities ({decrypted.activities.length})</h2>
          <div className="space-y-2">
            {decrypted.activities.map((a) => (
              <div key={a.id} className={`rounded-xl border p-3 flex items-start gap-3 ${
                proposal.response?.selectedActivityId === a.id ? 'border-green-300 bg-green-50' : 'border-gray-100'
              }`}>
                <span className="text-xl shrink-0">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{a.title}</p>
                  {a.description && <p className="text-xs text-gray-500">{a.description}</p>}
                  {a.slots.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {a.slots.map((s) => (
                        <span key={s.id}
                          className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                            proposal.response?.selectedTimeSlotId === s.id
                              ? 'bg-green-200 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                          {formatSlotDate(s.startsAt, s.label)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {proposal.response?.selectedActivityId === a.id && (
                  <span className="text-green-600 text-xs font-bold shrink-0">✓ Chosen</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <Card className="space-y-3">
          {proposal.status === 'draft' && (
            <button onClick={handlePublish} disabled={publishing}
              className={buttonVariants({ size: 'lg', className: 'w-full' })}>
              {publishing ? 'Publishing…' : '📤 Publish & share'}
            </button>
          )}
          <button onClick={handleDelete} disabled={deleting}
            className={buttonVariants({ variant: 'danger', size: 'lg', className: 'w-full' })}>
            {deleting ? 'Deleting…' : '🗑 Delete proposal & all data'}
          </button>
        </Card>

        <p className="text-center text-xs text-gray-400 pb-4">
          Want to ask someone else out?{' '}
          <Link href="/create" className="text-pink-600 font-semibold hover:underline">Create a new proposal →</Link>
        </p>
      </div>
    </div>
  );
}

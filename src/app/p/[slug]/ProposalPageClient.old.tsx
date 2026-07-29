'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes, getGradientStyle, formatSlotDate, type Theme } from '@/lib/themes';
import LoveFusion from '@/components/LoveFusion';
import { keyFromHash, decryptField, decryptOptional, encryptField, encryptOptional } from '@/lib/crypto-client';
import type { ActivityOption, TimeSlot, Proposal } from '@prisma/client';

type FullProposal = Proposal & {
  activities: (ActivityOption & { slots: TimeSlot[] })[];
};

interface Props {
  proposal: FullProposal;
  slug: string;
  isExpired: boolean;
  isAnswered: boolean;
  existingAnswer: string | null;
}

interface DecryptedSlot { id: string; label: string; startsAt: string | null }
interface DecryptedActivity { id: string; emoji: string; title: string; description: string | null; slots: DecryptedSlot[] }
interface Decrypted {
  key: string;
  senderName: string;
  recipientName: string;
  title: string;
  message: string;
  gifUrl: string | null;
  activities: DecryptedActivity[];
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

function toGCalDate(d: Date) {
  return d.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
}

function makeIcs(title: string, startsAt: Date, description: string) {
  const start = toGCalDate(startsAt);
  const end = toGCalDate(new Date(startsAt.getTime() + 60 * 60 * 1000));
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//lovelope.app//EN',
    'BEGIN:VEVENT', `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:${title}`, `DESCRIPTION:${description}`,
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}

function CalendarButtons({ title, startsAt, description }: {
  title: string; startsAt: Date; description: string;
}) {
  function downloadIcs() {
    const blob = new Blob([makeIcs(title, startsAt, description)], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'date.ics'; a.click();
    URL.revokeObjectURL(url);
  }
  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${toGCalDate(startsAt)}/${toGCalDate(new Date(startsAt.getTime() + 60 * 60 * 1000))}&details=${encodeURIComponent(description)}`;
  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-2">
      <a href={gCalUrl} target="_blank" rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700
                   border border-blue-200 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
        📅 Add to Google Calendar
      </a>
      <button onClick={downloadIcs}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700
                   border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
        📥 Download .ics
      </button>
    </div>
  );
}

export default function ProposalPageClient({
  proposal, slug, isExpired, isAnswered, existingAnswer,
}: Props) {
  const theme = themes[proposal.theme as Theme];
  const customGradient =
    proposal.gradientFrom && proposal.gradientVia && proposal.gradientTo
      ? { from: proposal.gradientFrom, via: proposal.gradientVia, to: proposal.gradientTo }
      : null;
  const bgStyle = getGradientStyle(proposal.theme as Theme, customGradient);

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [answer, setAnswer] = useState<'yes' | 'maybe' | 'no' | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // existingAnswer is ciphertext until the decrypt effect below resolves it.
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  // End-to-end decryption: the key lives only in the URL fragment, which
  // the server never sees. Everything personal is ciphertext until this runs.
  const [decrypted, setDecrypted] = useState<Decrypted | null>(null);
  const [keyMissing, setKeyMissing] = useState(false);

  // Moving "No" button state
  const [noTransform, setNoTransform] = useState('translate(0px, 0px)');
  const [noRuns, setNoRuns] = useState(0);

  const confettiRef = useRef<(() => void) | null>(null);
  const selectedActivity = decrypted?.activities.find((a) => a.id === selectedActivityId);
  const selectedSlot = selectedActivity?.slots.find((s) => s.id === selectedSlotId) ?? null;
  const isDark = theme.dark;
  const canSubmit = answer !== null && (answer !== 'yes' || selectedActivityId !== null);
  const evasiveNo = proposal.evasiveNo;

  function evadeNo() {
    setNoRuns((prev) => {
      const runs = prev + 1;
      const spread = Math.min(80 + runs * 20, 300);
      const x = (Math.random() - 0.5) * spread * 2;
      const y = (Math.random() - 0.5) * spread;
      const scale = runs > 4 ? Math.max(0.3, 1 - (runs - 4) * 0.12) : 1;
      setNoTransform(`translate(${x}px, ${y}px) scale(${scale})`);
      return runs;
    });
  }

  const noOpacity = noRuns > 7 ? Math.max(0.15, 1 - (noRuns - 7) * 0.15) : 1;

  useEffect(() => {
    import('canvas-confetti').then((mod) => {
      const confetti = mod.default;
      confettiRef.current = () => {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 },
          colors: ['#f97316', '#ec4899', '#a855f7', '#facc15', '#34d399'] });
        setTimeout(() => {
          confetti({ particleCount: 80, spread: 120, origin: { x: 0, y: 0.8 } });
          confetti({ particleCount: 80, spread: 120, origin: { x: 1, y: 0.8 } });
        }, 400);
      };
    });
  }, []);

  useEffect(() => {
    const k = keyFromHash(window.location.hash);
    if (!k) { setKeyMissing(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const [senderName, recipientName, title, message, gifUrl, decryptedExistingAnswer] = await Promise.all([
          decryptField(k, proposal.senderName),
          decryptField(k, proposal.recipientName),
          decryptField(k, proposal.title),
          decryptField(k, proposal.message),
          decryptOptional(k, proposal.gifUrl),
          decryptOptional(k, existingAnswer ?? undefined),
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
        if (!cancelled) {
          setDecrypted({ key: k, senderName, recipientName, title, message, gifUrl: gifUrl ?? null, activities });
          if (decryptedExistingAnswer) setSubmittedAnswer(decryptedExistingAnswer);
        }
      } catch {
        if (!cancelled) setKeyMissing(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    if (!answer || !decrypted) return;
    if (answer === 'yes' && !selectedActivityId) return;
    setSubmitting(true);
    try {
      const [encAnswer, encNote] = await Promise.all([
        encryptField(decrypted.key, answer),
        encryptOptional(decrypted.key, note || undefined),
      ]);
      const res = await fetch(`/api/p/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: encAnswer,
          selectedActivityId: selectedActivityId ?? undefined,
          selectedTimeSlotId: selectedSlotId ?? undefined,
          note: encNote,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setSubmittedAnswer(answer);
        if (answer === 'yes') setTimeout(() => confettiRef.current?.(), 300);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const bgClassName = bgStyle.className ? `min-h-screen ${bgStyle.className}` : 'min-h-screen';

  if (isExpired) {
    return (
      <div className={bgClassName} style={bgStyle.style}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center max-w-md w-full">
            <div className="text-5xl mb-4">⏰</div>
            <h1 className="font-display text-2xl font-extrabold text-gray-900 mb-2">
              This proposal has expired
            </h1>
            <p className="text-gray-500">Looks like you missed the window, maybe next time!</p>
          </div>
        </div>
      </div>
    );
  }

  if (keyMissing) {
    return (
      <div className={bgClassName} style={bgStyle.style}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center max-w-md w-full">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="font-display text-2xl font-extrabold text-gray-900 mb-2">
              This link looks incomplete
            </h1>
            <p className="text-gray-500">
              Make sure you copied the whole link, including everything after the “#”.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!decrypted) {
    return (
      <div className={bgClassName} style={bgStyle.style}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="text-6xl"
          >
            💌
          </motion.div>
        </div>
      </div>
    );
  }

  if ((isAnswered || submitted) && submittedAnswer) {
    const isYes = submittedAnswer === 'yes';
    const isMaybe = submittedAnswer === 'maybe';
    const calendarSlot =
      isYes && submitted && selectedSlot?.startsAt
        ? { startsAt: new Date(selectedSlot.startsAt), title: `${selectedActivity?.title ?? 'Date'} with ${decrypted.recipientName}` }
        : null;

    return (
      <div className={bgClassName} style={bgStyle.style}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center max-w-md w-full"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: isYes ? Infinity : 0, duration: 1.5 }}
              className="text-6xl mb-4"
            >
              {isYes ? '🎉' : isMaybe ? '🤔' : '💔'}
            </motion.div>
            <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-2">
              {isYes ? 'You said YES! 🎊' : isMaybe ? 'Maybe… intriguing! 🤔' : 'Oof. Maybe another time 💔'}
            </h1>
            <p className="text-gray-500">
              {isYes
                ? `${decrypted.recipientName}, get ready for an amazing time!`
                : isMaybe
                ? 'Your answer has been sent. The ball is in their court now.'
                : 'Your response has been sent. You never know what the future holds.'}
            </p>
            {submitted && isYes && selectedActivity && (
              <div className="mt-6 bg-orange-50 rounded-2xl p-4 border border-orange-100 text-left">
                <p className="text-sm text-orange-700 font-semibold">
                  {selectedActivity.emoji} You chose: {selectedActivity.title}
                </p>
                {selectedSlot && (
                  <p className="text-xs text-orange-500 mt-1">
                    🗓 {formatSlotDate(selectedSlot.startsAt, selectedSlot.label)}
                  </p>
                )}
              </div>
            )}
            {calendarSlot && (
              <CalendarButtons
                title={calendarSlot.title}
                startsAt={calendarSlot.startsAt}
                description={`Arranged via lovelope.app: ${decrypted.title}`}
              />
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  if (!revealed) {
    return (
      <div className={bgClassName} style={bgStyle.style}>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="flex flex-col items-center justify-center min-h-screen w-full px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <LoveFusion className="mb-6" />
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white text-balance">
              {decrypted.senderName} has a message for you
            </h1>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="text-white/70 mt-4 text-sm font-semibold uppercase tracking-widest"
            >
              Tap to open
            </motion.p>
          </motion.div>
        </button>
      </div>
    );
  }

  return (
    <div className={bgClassName} style={bgStyle.style}>
      <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-5">
          {/* Header */}
          <motion.div variants={item}
            className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border ${theme.cardBorder}`}>
            <p className={`text-xs font-semibold uppercase tracking-widest ${theme.accentText} mb-2`}>
              A special message from {decrypted.senderName}
            </p>
            <h1 className={`font-display text-2xl sm:text-3xl font-extrabold ${theme.textPrimary} mb-4 text-balance`}>
              {decrypted.title}
            </h1>
            <p className={`${theme.textSecondary} leading-relaxed whitespace-pre-wrap text-sm sm:text-base`}>
              {decrypted.message}
            </p>
            {decrypted.gifUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-white/20 bg-black/10 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={decrypted.gifUrl}
                  alt="GIF"
                  className="max-h-80 w-full object-contain"
                  loading="lazy"
                />
              </div>
            )}
          </motion.div>

          {/* Activities */}
          <motion.div variants={item}>
            <p className="text-xs font-bold text-white/80 uppercase tracking-widest mb-3 px-1">
              Pick your favourite 👇
            </p>
            <div className="space-y-3">
              {decrypted.activities.map((activity) => {
                const isSelected = selectedActivityId === activity.id;
                return (
                  <motion.div key={activity.id} whileTap={{ scale: 0.98 }}>
                    <button type="button"
                      onClick={() => { setSelectedActivityId(isSelected ? null : activity.id); setSelectedSlotId(null); }}
                      className={`w-full text-left ${theme.cardBg} rounded-2xl border-2 p-4 sm:p-5 transition-all shadow-md ${
                        isSelected
                          ? `border-white shadow-lg ${isDark ? 'bg-white/20' : 'bg-white'}`
                          : `${theme.cardBorder} hover:border-white/50`
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <span className="text-2xl sm:text-3xl shrink-0">{activity.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-display font-bold text-base sm:text-lg ${theme.textPrimary} mb-0.5`}>
                            {activity.title}
                          </h3>
                          {activity.description && (
                            <p className={`text-sm ${theme.textSecondary}`}>{activity.description}</p>
                          )}
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                          isSelected
                            ? `bg-gradient-to-br ${theme.buttonGradient} border-transparent`
                            : `border-gray-300 ${isDark ? 'border-gray-500' : ''}`
                        }`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                    </button>

                    {/* Time slots */}
                    <AnimatePresence>
                      {isSelected && activity.slots.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className={`${theme.cardBg} rounded-b-2xl border-2 border-t-0 ${
                            isSelected ? 'border-white' : theme.cardBorder
                          } p-4`}>
                            <p className={`text-xs font-semibold uppercase tracking-wider ${theme.textSecondary} mb-3`}>
                              Pick a time
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {activity.slots.map((slot) => (
                                <button key={slot.id} type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSlotId(selectedSlotId === slot.id ? null : slot.id);
                                  }}
                                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                                    selectedSlotId === slot.id
                                      ? `bg-gradient-to-r ${theme.buttonGradient} text-white shadow-md`
                                      : isDark
                                      ? 'bg-white/10 text-white hover:bg-white/20'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  🗓 {formatSlotDate(slot.startsAt, slot.label)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Note */}
          <motion.div variants={item}
            className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} p-4 sm:p-5 shadow-md`}>
            <label className={`block text-sm font-semibold ${theme.textSecondary} mb-2`}>
              Leave a note (optional)
            </label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3}
              placeholder="Anything you want to say…"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition resize-none text-sm ${
                isDark
                  ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40'
                  : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-100'
              }`}
            />
          </motion.div>

          {/* Answer buttons */}
          <motion.div variants={item}
            className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} p-4 sm:p-5 shadow-md`}>
            <p className={`text-sm font-semibold ${theme.textSecondary} mb-3`}>
              And your answer is…
            </p>

            <div className="relative" style={{ minHeight: '80px' }}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {([
                  { key: 'yes' as const, emoji: '🎉', label: 'Yes!' },
                  { key: 'maybe' as const, emoji: '🤔', label: 'Maybe' },
                ]).map(({ key, emoji, label }) => (
                  <motion.button key={key} type="button" whileTap={{ scale: 0.94 }}
                    onClick={() => setAnswer(answer === key ? null : key)}
                    className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 font-semibold transition-all ${
                      answer === key
                        ? `bg-gradient-to-br ${theme.buttonGradient} border-transparent text-white shadow-lg`
                        : isDark
                        ? 'border-white/20 text-white hover:border-white/40'
                        : 'border-gray-200 text-gray-600 hover:border-pink-300'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-sm">{label}</span>
                  </motion.button>
                ))}
              </div>

              {/* No button: runs away when evasiveNo is enabled */}
              <div
                style={evasiveNo ? {
                  transform: noTransform,
                  opacity: noOpacity,
                  transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
                  display: 'inline-block',
                  position: 'relative',
                  zIndex: 10,
                } : { display: 'inline-block' }}
                onMouseEnter={evasiveNo ? evadeNo : undefined}
              >
                <motion.button type="button" whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    if (evasiveNo && noRuns < 5) {
                      evadeNo();
                      return;
                    }
                    setAnswer(answer === 'no' ? null : 'no');
                  }}
                  className={`flex flex-col items-center gap-1.5 py-4 px-8 rounded-2xl border-2 font-semibold transition-colors ${
                    answer === 'no'
                      ? `bg-gradient-to-br ${theme.buttonGradient} border-transparent text-white shadow-lg`
                      : isDark
                      ? 'border-white/20 text-white hover:border-white/40'
                      : 'border-gray-200 text-gray-600 hover:border-pink-300'
                  }`}
                >
                  <span className="text-2xl">💔</span>
                  <span className="text-sm">No</span>
                </motion.button>
              </div>
            </div>

            {answer === 'yes' && !selectedActivityId && (
              <p className={`mt-2 text-xs font-semibold text-center ${isDark ? 'text-yellow-300' : 'text-orange-500'}`}>
                ☝️ Pick an activity above before sending!
              </p>
            )}

            <motion.button type="button" whileTap={{ scale: 0.97 }}
              disabled={!canSubmit || submitting}
              onClick={() => void handleSubmit()}
              className={`mt-4 w-full py-4 rounded-2xl font-display font-bold text-lg text-white shadow-lg
                          bg-gradient-to-r ${theme.buttonGradient}
                          hover:shadow-xl transform hover:-translate-y-0.5 transition-all
                          disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {submitting ? 'Sending…' : 'Send my answer 💌'}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

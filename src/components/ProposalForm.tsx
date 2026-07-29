'use client';

import { useEffect, useState } from 'react';
import { themes, type Theme } from '@/lib/themes';
import Card from '@/components/ui/Card';
import Field, { inputClasses } from '@/components/ui/Field';
import { buttonVariants } from '@/components/ui/Button';

export interface SlotData {
  label: string;
  startsAt: string;
}

export interface ActivityData {
  title: string;
  description: string;
  emoji: string;
  slots: SlotData[];
}

export interface ProposalFormData {
  senderName: string;
  recipientName: string;
  title: string;
  message: string;
  theme: Theme;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  gifUrl?: string;
  evasiveNo: boolean;
  activities: ActivityData[];
}

interface Props {
  onSubmit: (data: ProposalFormData, publish: boolean) => Promise<void>;
  submitError?: string;
  publishLabel?: string;
  hideDraft?: boolean;
}

const EMOJI_PRESETS = ['🎉', '🍷', '🎨', '🌅', '🎭', '🎸', '🏄', '🍕', '☕', '🎬', '🎮', '🌙'];
const BLANK_ACTIVITY: ActivityData = { title: '', description: '', emoji: '🎉', slots: [] };

const DEFAULT_COLORS: Record<Theme, [string, string, string]> = {
  sunset:   ['#fb923c', '#ec4899', '#f43f5e'],
  neon:     ['#4ade80', '#06b6d4', '#2563eb'],
  pastel:   ['#d8b4fe', '#f9a8d4', '#fecdd3'],
  cherry:   ['#ef4444', '#f43f5e', '#db2777'],
  ocean:    ['#60a5fa', '#22d3ee', '#14b8a6'],
  midnight: ['#3730a3', '#6b21a8', '#1e3a8a'],
};

const COLOR_SWATCHES = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
  '#fca5a5', '#fed7aa', '#fef9c3', '#bbf7d0',
  '#bfdbfe', '#ddd6fe', '#fce7f3', '#f1f5f9',
  '#ffffff', '#94a3b8', '#334155', '#0f172a',
];

const inputCls = inputClasses;
const primaryBtn = buttonVariants({ variant: 'primary', size: 'lg', className: 'w-full' });
const secondaryBtn = buttonVariants({ variant: 'secondary', size: 'lg', className: 'flex-1' });

type GradientStop = 'From' | 'Via' | 'To';

const STOP_LABELS: Record<GradientStop, string> = { From: 'From', Via: 'Via', To: 'To' };

function ColorPicker({
  gradFrom, gradVia, gradTo, setGradFrom, setGradVia, setGradTo,
}: {
  gradFrom: string; gradVia: string; gradTo: string;
  setGradFrom: (c: string) => void; setGradVia: (c: string) => void; setGradTo: (c: string) => void;
}) {
  const [activeStop, setActiveStop] = useState<GradientStop>('From');
  const vals: Record<GradientStop, string> = { From: gradFrom, Via: gradVia, To: gradTo };
  const setters: Record<GradientStop, (c: string) => void> = { From: setGradFrom, Via: setGradVia, To: setGradTo };
  const currentColor = vals[activeStop];

  return (
    <div className="space-y-3 mt-3">
      <div className="flex gap-2">
        {(['From', 'Via', 'To'] as GradientStop[]).map((stop) => (
          <button key={stop} type="button" onClick={() => setActiveStop(stop)}
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-sm font-semibold ${
              activeStop === stop ? 'border-pink-400 bg-pink-50' : 'border-gray-100 hover:border-gray-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-gray-300 shadow-sm shrink-0"
              style={{ backgroundColor: vals[stop] }} />
            <span className="text-gray-700 text-xs">{STOP_LABELS[stop]}</span>
            {activeStop === stop && <span className="ml-auto text-pink-400 text-xs">✓</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-8 gap-1.5 p-3 bg-gray-50 rounded-xl">
        {COLOR_SWATCHES.map((color) => (
          <button key={color} type="button" onClick={() => setters[activeStop](color)}
            title={color}
            className={`w-full aspect-square rounded-lg border-2 transition-all ${
              currentColor.toLowerCase() === color.toLowerCase()
                ? 'border-gray-900 scale-110 shadow-md'
                : 'border-transparent hover:scale-110 hover:shadow-sm'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="w-9 h-9 rounded-xl border-2 border-gray-200 shrink-0"
          style={{ backgroundColor: currentColor }} />
        <input
          type="text" value={currentColor}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setters[activeStop](v);
          }}
          maxLength={7} placeholder="#000000"
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 font-mono text-sm
                     focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition"
        />
      </div>
    </div>
  );
}

interface GifResult { id: string; title: string; url: string; preview: string; }

function GifPicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GifResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setSearched(false); return; }

    setSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/gif/search?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((json: { data: GifResult[] }) => setResults(json.data ?? []))
        .finally(() => { setSearching(false); setSearched(true); });
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (value) {
    return (
      <div className="mt-2 relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 max-h-48 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Selected GIF" className="max-h-48 object-contain" />
        <button type="button" onClick={() => onChange('')}
          className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center
                     justify-center text-sm font-bold hover:bg-black/80 transition-colors">
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      <input
        type="text" value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a GIF…"
        className={inputCls}
      />

      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto rounded-xl">
          {results.map((g) => (
            <button key={g.id} type="button" onClick={() => onChange(g.url)}
              className="aspect-video rounded-lg overflow-hidden border-2 border-transparent
                         hover:border-pink-400 transition-all bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.preview} alt={g.title} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {searching && (
        <p className="text-sm text-gray-400 text-center py-2">Searching…</p>
      )}

      {searched && !searching && results.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-2">No results, try another search</p>
      )}

      <p className="text-xs text-gray-300 text-center pt-1">Powered by Giphy</p>
    </div>
  );
}

function formatDatetimeLabel(dt: string): string {
  if (!dt) return '';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return dt;
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export default function ProposalForm({
  onSubmit, submitError, publishLabel = '🚀 Publish!', hideDraft = false,
}: Props) {
  const [step, setStep] = useState<'details' | 'activities' | 'theme'>('details');
  const [submitting, setSubmitting] = useState(false);

  // Details
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // Activities
  const [activities, setActivities] = useState<ActivityData[]>([
    { ...BLANK_ACTIVITY },
    { ...BLANK_ACTIVITY },
  ]);

  // Theme
  const [theme, setTheme] = useState<Theme>('sunset');
  const [useCustom, setUseCustom] = useState(false);
  const [gradFrom, setGradFrom] = useState(DEFAULT_COLORS.sunset[0]);
  const [gradVia, setGradVia] = useState(DEFAULT_COLORS.sunset[1]);
  const [gradTo, setGradTo] = useState(DEFAULT_COLORS.sunset[2]);

  // GIF + evasive No
  const [gifUrl, setGifUrl] = useState('');
  const [evasiveNo, setEvasiveNo] = useState(false);

  function updateActivity(i: number, patch: Partial<ActivityData>) {
    setActivities((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  }

  function addSlot(ai: number) {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setDate(now.getDate() + 7);
    const isoLocal = now.toISOString().slice(0, 16);
    updateActivity(ai, {
      slots: [...activities[ai].slots, { label: formatDatetimeLabel(isoLocal), startsAt: isoLocal }],
    });
  }

  function updateSlot(ai: number, si: number, startsAt: string) {
    updateActivity(ai, {
      slots: activities[ai].slots.map((s, idx) =>
        idx === si ? { label: formatDatetimeLabel(startsAt), startsAt } : s
      ),
    });
  }

  function removeSlot(ai: number, si: number) {
    updateActivity(ai, { slots: activities[ai].slots.filter((_, idx) => idx !== si) });
  }

  function removeActivity(i: number) {
    setActivities((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addActivity() {
    setActivities((prev) => [...prev, { ...BLANK_ACTIVITY }]);
  }

  function handleThemeChange(t: Theme) {
    setTheme(t);
    const [f, v, o] = DEFAULT_COLORS[t];
    setGradFrom(f); setGradVia(v); setGradTo(o);
  }

  async function handleSubmit(publish: boolean) {
    setSubmitting(true);
    try {
      await onSubmit(
        {
          senderName,
          recipientName,
          title,
          message,
          theme,
          ...(useCustom ? { gradientFrom: gradFrom, gradientVia: gradVia, gradientTo: gradTo } : {}),
          ...(gifUrl.trim() ? { gifUrl: gifUrl.trim() } : {}),
          evasiveNo,
          activities: activities.map((a) => ({
            ...a,
            slots: a.slots.filter((s) => s.startsAt),
          })),
        },
        publish
      );
    } finally {
      setSubmitting(false);
    }
  }

  const themeList = Object.entries(themes) as [Theme, (typeof themes)[Theme]][];
  const gradientPreview = useCustom
    ? { style: { background: `linear-gradient(to bottom right, ${gradFrom}, ${gradVia}, ${gradTo})` } }
    : { className: `bg-gradient-to-br ${themes[theme].gradient}` };

  const detailsOk = senderName.trim() && recipientName.trim() && title.trim() && message.trim();
  const activitiesOk = activities.length >= 2 && activities.every((a) => a.title.trim());

  const steps = ['Details', 'Activities', 'Theme'] as const;

  return (
    <div className="space-y-5">
      {/* Step tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
        {(['details', 'activities', 'theme'] as const).map((s, i) => (
          <button key={s} type="button" onClick={() => setStep(s)}
            aria-current={step === s ? 'step' : undefined}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 ${
              step === s ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {i + 1}. {steps[i]}
          </button>
        ))}
      </div>

      {/* ── Step 1: Details ── */}
      {step === 'details' && (
        <Card className="space-y-4">
          <Field label="Your first name" htmlFor="senderName">
            <input id="senderName" type="text" required maxLength={60}
              value={senderName} onChange={(e) => setSenderName(e.target.value)}
              placeholder="Jordan"
              className={inputCls}
            />
          </Field>
          <Field label="Their first name" htmlFor="recipientName">
            <input id="recipientName" type="text" required maxLength={60}
              value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Alex"
              className={inputCls}
            />
          </Field>
          <Field label="Proposal title" htmlFor="title">
            <input id="title" type="text" required maxLength={120}
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Want to go on an adventure with me?"
              className={inputCls}
            />
          </Field>
          <Field label="Personal message" htmlFor="message">
            <textarea id="message" required maxLength={2000} rows={4}
              value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hey ${recipientName || '…'} !`}
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{message.length}/2000</p>
          </Field>
          <button type="button" disabled={!detailsOk} onClick={() => setStep('activities')}
            className={primaryBtn}>
            Next: Activities →
          </button>
        </Card>
      )}

      {/* ── Step 2: Activities ── */}
      {step === 'activities' && (
        <div className="space-y-4">
          {activities.map((act, ai) => (
            <Card key={ai} className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-gray-700 text-sm">Activity {ai + 1}</span>
                {activities.length > 2 && (
                  <button type="button" onClick={() => removeActivity(ai)}
                    className="text-red-400 hover:text-red-600 text-sm transition-colors">
                    Remove
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <div className="relative">
                  <button type="button"
                    className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 hover:border-pink-300 transition-colors">
                    {act.emoji}
                  </button>
                  <select value={act.emoji} onChange={(e) => updateActivity(ai, { emoji: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full">
                    {EMOJI_PRESETS.map((em) => <option key={em} value={em}>{em}</option>)}
                  </select>
                </div>
                <input type="text" required maxLength={100}
                  value={act.title} onChange={(e) => updateActivity(ai, { title: e.target.value })}
                  placeholder="Activity name"
                  className={`flex-1 ${inputCls}`}
                />
              </div>

              <textarea maxLength={300} rows={2}
                value={act.description}
                onChange={(e) => updateActivity(ai, { description: e.target.value })}
                placeholder="Short description (optional)"
                className={`w-full text-sm resize-none ${inputCls}`}
              />

              {/* Time slots */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date & time options
                  </p>
                  <button type="button" onClick={() => addSlot(ai)}
                    className="text-xs text-pink-600 font-semibold hover:underline">
                    + Add slot
                  </button>
                </div>
                <div className="space-y-2">
                  {act.slots.map((slot, si) => (
                    <div key={si} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <input type="datetime-local" value={slot.startsAt}
                          onChange={(e) => updateSlot(ai, si, e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm
                                     focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition"
                        />
                        {slot.label && <p className="text-xs text-gray-400 mt-0.5 ml-1">{slot.label}</p>}
                      </div>
                      <button type="button" onClick={() => removeSlot(ai, si)}
                        className="text-gray-400 hover:text-red-500 transition-colors px-2 text-lg shrink-0">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          {activities.length < 5 && (
            <button type="button" onClick={addActivity}
              className="w-full py-3.5 border-2 border-dashed border-gray-200 rounded-2xl
                         text-gray-500 hover:border-pink-300 hover:text-pink-500 font-semibold transition-all text-sm">
              + Add activity (max 5)
            </button>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('details')} className={secondaryBtn}>
              ← Back
            </button>
            <button type="button" disabled={!activitiesOk} onClick={() => setStep('theme')} className={primaryBtn}>
              Next: Theme →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Theme + GIF ── */}
      {step === 'theme' && (
        <div className="space-y-4">
          {/* Gradient preview */}
          <div
            {...gradientPreview}
            className={`h-20 rounded-2xl shadow-md transition-all ${gradientPreview.className ?? ''}`}
            style={gradientPreview.style}
          />

          <Card className="space-y-5">
            <h2 className="font-display font-bold text-gray-900">Choose a vibe</h2>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {themeList.map(([key, t]) => (
                <button key={key} type="button"
                  onClick={() => { handleThemeChange(key); setUseCustom(false); }}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    theme === key && !useCustom
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.gradient} shrink-0`} />
                  <span className="text-sm font-semibold text-gray-700">{t.emoji} {t.label}</span>
                  {theme === key && !useCustom && <span className="ml-auto text-pink-500 text-xs">✓</span>}
                </button>
              ))}
            </div>

            {/* Custom colors */}
            <div>
              <button type="button" onClick={() => setUseCustom((v) => !v)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  useCustom ? 'border-pink-400 bg-pink-50' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <span className="font-semibold text-gray-700 text-sm">🎨 Custom colors</span>
                <span className="text-xs text-gray-400">{useCustom ? '▲ Hide' : '▼ Pick colors'}</span>
              </button>

              {useCustom && (
                <ColorPicker
                  gradFrom={gradFrom} gradVia={gradVia} gradTo={gradTo}
                  setGradFrom={setGradFrom} setGradVia={setGradVia} setGradTo={setGradTo}
                />
              )}
            </div>

            {/* GIF section */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                🎭 Add a GIF (optional)
              </label>
              <GifPicker value={gifUrl} onChange={setGifUrl} />
            </div>

            {/* Evasive No toggle */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-700 text-sm">🎪 Make &ldquo;No&rdquo; nearly impossible</p>
                  <p className="text-xs text-gray-400 mt-0.5">The No button runs away when they try to click it</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvasiveNo((v) => !v)}
                  aria-pressed={evasiveNo}
                  className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
                    evasiveNo ? 'bg-pink-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform absolute top-0.5 ${
                    evasiveNo ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </Card>

          {submitError && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {submitError}
            </p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('activities')} className={secondaryBtn}>
              ← Back
            </button>
            {!hideDraft && (
              <button type="button" disabled={submitting} onClick={() => void handleSubmit(false)}
                className={secondaryBtn}>
                Save as draft
              </button>
            )}
            <button type="button" disabled={submitting} onClick={() => void handleSubmit(true)}
              className={primaryBtn}>
              {submitting ? '…' : publishLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

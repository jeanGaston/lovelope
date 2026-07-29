'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProposalForm, { type ProposalFormData } from '@/components/ProposalForm';
import { generateKey, encryptField, encryptOptional } from '@/lib/crypto-client';

interface Links {
  publicUrl: string;
  manageUrl: string;
}

// Encrypts every personal/narrative field client-side before it ever reaches
// the network; the server only ever receives and stores ciphertext. The key
// itself is generated here and never sent to the server; it only travels in
// the URL fragment of the links shown to the user.
async function encryptPayload(key: string, data: ProposalFormData) {
  const activities = await Promise.all(
    data.activities.map(async (a) => ({
      title: await encryptField(key, a.title),
      description: await encryptOptional(key, a.description),
      emoji: a.emoji,
      slots: await Promise.all(
        a.slots.map(async (s) => ({
          label: await encryptField(key, s.label),
          startsAt: await encryptOptional(key, s.startsAt),
        }))
      ),
    }))
  );

  return {
    senderName: await encryptField(key, data.senderName),
    recipientName: await encryptField(key, data.recipientName),
    title: await encryptField(key, data.title),
    message: await encryptField(key, data.message),
    theme: data.theme,
    gradientFrom: data.gradientFrom,
    gradientVia: data.gradientVia,
    gradientTo: data.gradientTo,
    gifUrl: await encryptOptional(key, data.gifUrl),
    evasiveNo: data.evasiveNo,
    activities,
  };
}

export default function CreateClient() {
  const [links, setLinks] = useState<Links | null>(null);
  const [error, setError] = useState('');
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedManage, setCopiedManage] = useState(false);

  async function handleSubmit(data: ProposalFormData, _publish: boolean) {
    setError('');
    const key = await generateKey();
    const payload = await encryptPayload(key, data);
    const res = await fetch('/api/proposals/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setError('Something went wrong. Please check your inputs and try again.');
      return;
    }
    setLinks({
      publicUrl: `${json.publicUrl}#k=${key}`,
      manageUrl: `${json.manageUrl}#k=${key}`,
    });
  }

  function copyLink(url: string, which: 'public' | 'manage') {
    navigator.clipboard.writeText(url);
    if (which === 'public') { setCopiedPublic(true); setTimeout(() => setCopiedPublic(false), 2000); }
    else { setCopiedManage(true); setTimeout(() => setCopiedManage(false), 2000); }
  }

  if (links) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6">
        <div className="text-5xl">🎉</div>
        <div>
          <h2 className="font-display text-2xl font-extrabold text-gray-900">Your proposal is ready!</h2>
          <p className="text-gray-500 mt-1">Share the first link, keep the second one private.</p>
        </div>

        <div className="text-left space-y-4">
          <LinkBox
            emoji="📤"
            label="Share with them"
            sublabel="Send this link to the person you're asking out"
            url={links.publicUrl}
            copied={copiedPublic}
            onCopy={() => copyLink(links.publicUrl, 'public')}
            highlight
          />
          <LinkBox
            emoji="🔒"
            label="Your private management link"
            sublabel="Bookmark this: it lets you see their response and delete the proposal"
            url={links.manageUrl}
            copied={copiedManage}
            onCopy={() => copyLink(links.manageUrl, 'manage')}
          />
        </div>

        <p className="text-xs text-gray-400">
          Want to create another one?{' '}
          <Link href="/create" className="text-pink-600 font-semibold hover:underline">
            Make a new proposal →
          </Link>
        </p>
      </div>
    );
  }

  return <ProposalForm onSubmit={handleSubmit} submitError={error} publishLabel="🚀 Create & share!" hideDraft />;
}

function LinkBox({
  emoji, label, sublabel, url, copied, onCopy, highlight,
}: {
  emoji: string; label: string; sublabel: string; url: string;
  copied: boolean; onCopy: () => void; highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 border-2 ${highlight ? 'border-pink-300 bg-pink-50' : 'border-gray-100 bg-gray-50'}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-500">{sublabel}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          readOnly value={url}
          className="flex-1 text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-600 min-w-0"
        />
        <button
          onClick={onCopy}
          className={`shrink-0 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
            copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="block text-xs text-pink-600 hover:underline mt-1.5 truncate">
        {url}
      </a>
    </div>
  );
}

# lovelope.app 💌

*lovelope: a little mashup of* love *and* envelope.

The adorable way to ask someone out. Pick a theme, add some date ideas and a GIF, share one link, and they pick a time and answer.

No accounts, no friction, just a sweet little link. Everything personal is encrypted right in the browser before it ever leaves your device (see [Encryption](#encryption) below).

> Made with care through conversational, AI-assisted development rather than hand-written line by line, so there's no professional security audit behind it. The encryption itself is real and does exactly what this doc says, but treat this as a fun personal project, not battle-tested production software.

## Quick start

You need [Docker](https://www.docker.com/) installed. That's it.

```bash
git clone https://github.com/jeangaston/lovelope.git && cd lovelope
cp .env.example .env
docker compose up --build
```

Open **http://localhost:3000**. Everything (the app and its database) runs in one container; your data lives in `./data/askedout.db` on your machine.

Want GIF search to work? Grab a free key at [developers.giphy.com](https://developers.giphy.com/) and put it in `.env` as `GIPHY_API_KEY`, then restart. Without it, the app still runs fine, GIF search is just disabled.

## Features

- **3-step proposal builder:** your name, their name, date ideas with real time slots, a custom gradient theme, an optional GIF
- **Animated reveal:** "{sender} has a message for you" before the proposal shows
- **"Impossible No" mode:** the No button runs away from the cursor 🎪
- **Two private links:** one to share, one to manage, no login required
- **QR code**, generated locally in the browser
- **Add to calendar:** Google Calendar link + `.ics` download once they say yes
- **Auto-delete:** proposals purge after 30 days

## Encryption

Every personal detail (both names, the title and message, the date ideas, the recipient's answer and note) is encrypted in the browser (AES-GCM) before it's sent anywhere. The server and its database only ever store unreadable ciphertext.

The decryption key is generated in the browser and lives only in the link itself, after the `#`. Links look like:

```
http://localhost:3000/p/AbC123xy#k=<key>
```

Browsers never send the part after `#` to any server, so that key never reaches the backend. This has real consequences, on purpose:

- **Lose the link, lose the proposal.** There's no password reset for this: nobody, including you running the server, can recover it.
- **Link previews stay generic.** Pasting the link into iMessage/WhatsApp/Slack shows a plain "You have a message 💌" card, not the real title, since the server can't read it to build a preview.
- A few non-personal fields stay in plain text because the server needs them to work at all: the theme/colors you picked, the proposal's status, timestamps, and which activity/time got picked (just an ID, not what it says).

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | SQLite file path, default `file:/app/data/askedout.db` works out of the box with Docker |
| `APP_URL` | ✅ | Base URL used to build share links, e.g. `http://localhost:3000` |
| `GIPHY_API_KEY` | optional | Enables GIF search. Free key at [developers.giphy.com](https://developers.giphy.com/), leave blank to disable |

## Local development (no Docker)

```bash
npm install
cp .env.example .env
# edit .env: DATABASE_URL="file:./prisma/dev.db"

npx prisma migrate dev
npm run dev
```

Useful scripts:

```bash
npm run db:migrate:dev   # create a new Prisma migration
npm run db:studio        # open Prisma Studio (DB GUI)
npm run db:seed          # seed a demo proposal
```

## Architecture

```
src/
├── app/
│   ├── create/              # Proposal creation (guest, no auth)
│   ├── manage/[token]/      # Creator management page
│   ├── p/[slug]/            # Public proposal page (recipient)
│   └── api/
│       ├── proposals/guest/ # POST: create & publish
│       ├── manage/[token]/  # GET / DELETE: manage by token
│       ├── manage/[token]/publish/  # POST: publish draft
│       ├── p/[slug]/        # GET proposal + POST response
│       └── gif/search/      # Giphy proxy
├── components/
│   ├── ProposalForm.tsx     # 3-step creation form
│   └── Footer.tsx
├── lib/
│   ├── db.ts                # Prisma singleton + 30-day auto-purge
│   ├── crypto-client.ts     # AES-GCM encrypt/decrypt (Web Crypto, browser-only)
│   ├── proposal-schema.ts   # Zod validation (ciphertext blobs, size-bounded only)
│   ├── proposal-create.ts   # Prisma create helper
│   ├── rate-limit.ts        # Token-bucket (5 req/min per IP)
│   └── themes.ts            # 6 built-in themes + custom gradient
└── public/
    ├── manifest.webmanifest # PWA manifest
    └── icon.svg             # App icon
```

## Security

- **End-to-end encryption:** see [Encryption](#encryption) above.
- Response endpoint rate-limited (5 req/min per IP, in-memory)
- Slugs are 10-char nanoid, unguessable
- Management tokens are 20-char nanoid, unguessable, no auth required
- `DELETE /api/manage/:token` hard-deletes the proposal + response (GDPR erasure)
- Proposals auto-delete after 30 days (background interval in `db.ts`)

---

Made with ❤️ by [jeangaston](https://github.com/jeangaston/lovelope)

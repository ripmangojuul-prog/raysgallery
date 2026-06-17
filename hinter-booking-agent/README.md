# HINTER booking agent

An SMS booking + intake agent for **Ray / HINTER MASKEN**. It receives texts on the
Google Voice booking line **(480) 420-4319**, replies in Ray's real voice, checks the
real Google Calendar, locks in a date, collects the **$150 Zelle deposit**, and — once
Ray confirms the deposit — creates the Google Calendar event and emails the client the
invite (the invite *is* the confirmation).

This is a **side project, separate from the HINTER website.** It lives in its own folder
and shares nothing with the site.

---

## How it works (architecture)

```
                 ┌──────────────────────── one fragile, isolated piece ───────────────────────┐
   client texts  │   Google Voice (no port, no email)                                          │
   (480)420-4319 │     ▲  Playwright drives the logged-in voice.google.com web app             │
        │        │     │  poll() reads new inbound texts · send() types replies                │
        ▼        │  ┌──┴───────────────┐                                                        │
   ┌─────────────┴──┤ MessagingAdapter ├──  swap this ONE file for Twilio later, nothing else  │
   │             └──┬───────────────┘                                                          │
   │                └────────────────────────────────────────────────────────────────────────┘
   │  src/index.ts  (poll loop + owner commands: CONFIRM / RESUME / TRAVEL)
   │      │
   │      ▼
   │  src/brain/agent.ts ── Claude (Anthropic, claude-sonnet-4-6) ── tool-use loop + vision + prompt cache
   │      │        ▲ system prompt = Ray's voice (few-shot from real texts) + Style Bible gate
   │      ▼        │
   │  src/tools/*  │  check_availability · create_booking · record_deposit_claim
   │      │        │  save_client_note · handoff_to_ray
   │      ├────────┴───────────────┬─────────────────────┬───────────────────┐
   │      ▼                        ▼                     ▼                   ▼
   │  Google Calendar         Firestore             Zelle deposit        Handoff → Ray
   │  (rscatchings@gmail)     (clients/convos/      ($150 → 925-605-8272 (texts Ray's cell)
   │  freebusy + invite        appointments)         Rachel Catchings)
   └─────────────────────────────────────────────────────────────────────────────────────────
```

**The brain, calendar, deposits, and DB are all provider-agnostic.** Only
`src/messaging/googleVoice.ts` knows about Google Voice. The day you want rock-solid
delivery, implement `MessagingAdapter` against Twilio in one new file and swap it in
`src/index.ts` — nothing else changes.

### ⚠️ Honest note on Google Voice
Google Voice has **no API and no webhooks**. With porting and email both off the table,
the only way to send/receive programmatically is to drive the logged-in web app with a
browser (Playwright). That works, but it is the one piece that needs babysitting:
- Log in once (`npm run login-gv`); the session persists in `./.gv-auth`.
- Google's web DOM is obfuscated and changes occasionally. The selectors live in one
  place (`SELECTORS` in `src/messaging/googleVoice.ts`). On first run set
  `GV_HEADLESS=false`, watch it work, and tune those selectors if needed.
- Use **`npm run chat`** to validate the whole brain (voice/calendar/deposit/vision)
  without Google Voice at all.

---

## Setup

### Prerequisites
- **Node 20+**
- **Anthropic API key** (the brain — Claude)
- **Firebase / GCP project** with Firestore enabled + a service-account JSON
- **Google Cloud OAuth client** (Desktop) for Calendar, and access to `rscatchings@gmail.com`
- The **Google Voice account** that owns (480) 420-4319, plus Ray's personal cell number

### 1. Install
```bash
cd hinter-booking-agent
npm install
npx playwright install chromium
```

### 2. Configure
```bash
cp .env.example .env
# fill in ANTHROPIC_API_KEY, Firestore creds, Calendar OAuth client, OWNER_PHONE
```

### 3. Google Calendar token (one-time)
```bash
npm run get-token       # opens a consent URL; sign in as rscatchings@gmail.com
# paste the printed GCAL_REFRESH_TOKEN into .env
```

### 4. Google Voice login (one-time)
```bash
npm run login-gv        # a browser opens; sign in and view your Messages, then press Enter
```

### 5. Smoke-test the brain (no Google Voice needed)
```bash
npm run chat            # you play the client in the terminal
```

### 6. Go live
```bash
# first, watch it: set GV_HEADLESS=false and DRY_RUN=true in .env, then:
npm start
# when replies look right, set DRY_RUN=false (and GV_HEADLESS=true) and restart.
```

---

## Owner commands (text these from Ray's cell to the booking line)

| Command | What it does |
|---|---|
| `CONFIRM <phone>` | Deposit received → auto-creates the booking, emails the invite, and texts the client a confirmation in your voice. |
| `PENDING <phone>` | Acknowledges the deposit isn't in yet. Nothing is sent to the client. |
| `RESUME <phone>` | Hands a thread back to the bot after you've personally handled a handoff. |
| `TRAVEL <address> \| <dates>` | Sets a temporary studio location for new bookings (west-coast trips). |
| `TRAVEL OFF` | Back to the Phoenix studio. |
| `HELP` | Lists commands. |

**The deposit is the only manual step** — exactly like today ("I'll confirm when I've
received it"). The bot does everything else.

---

## The booking flow

1. Client texts → bot greets and gathers idea, placement, size, availability,
   local/traveling (the same things Ray asks). It never asks about budget.
2. Bot talks the piece in Ray's voice, reads any reference images against the Style Bible,
   and gives an honest time + price ballpark ($250/hr, etc.).
3. Bot calls `check_availability` (real calendar) and offers specific open dates.
4. On agreement, bot asks for the **$150 Zelle deposit** + full name + email + phone, and
   records the agreed slot.
5. Client says they paid → bot calls `record_deposit_claim` → **texts Ray to verify Zelle.**
6. Ray texts back `CONFIRM <phone>` → bot creates the event, emails the invite, and sends
   the client a warm "you're all set" with date/time + address.

The bot **never** tells a client they're booked before the deposit is confirmed.

---

## Monitoring & handoff
- Logs are structured to stdout. Pipe to a file or your process manager.
- Firestore `conversations/{phone}` is the live state of every thread; `appointments/`
  mirrors confirmed bookings; `deposits/` logs every claim.
- The bot pings Ray for: deposit verification, every handoff (refunds, complaints, medical,
  abusive/spam, off-style insistence, custom-pricing edge cases, or anything it's unsure of),
  and new messages that arrive while a thread is in handoff.

## Cost
Low volume → a few dollars/month. Claude Sonnet 4.6, with Anthropic's prompt caching
on the stable system prefix, is pennies per conversation; set
`ANTHROPIC_MODEL=claude-opus-4-8` for max capability or `claude-haiku-4-5-20251001`
for the cheapest/fastest if you ever want it. Firestore and Calendar
are effectively free at this scale. The only "host"
needed is a machine that stays on to run the poller (your Windows box works; or a tiny VM).

## Roadmap: v0.1 → production
- **v0.1 (this):** Google Voice via Playwright, Claude brain, real calendar, Zelle + 1-tap
  confirm, vision, handoff.
- **Harden GV:** image/MMS extraction for vision, better unread detection, auto-relogin.
- **Reliability win (recommended later):** implement `MessagingAdapter` for Twilio/Telnyx —
  real webhooks, no browser, near-zero maintenance. One file; everything else stays.
- **Nice-to-haves:** auto-reminders the day before, waitlist/cancellation backfill, deposit
  via a card link as a fallback, a tiny dashboard over Firestore.

## Notes / decisions
- **Deposit is $150** (your real texts). Your public site FAQ still says **$100** — update
  `src/data.js` on the website so the site and the bot agree.
- **Zero emojis, ever** — enforced in the prompt *and* stripped from every outbound text.
- Timezone is fixed to **America/Phoenix** (no DST), even on west-coast trips.

## Security
- `.env`, the service-account JSON, the Calendar token, and `./.gv-auth` are all gitignored.
  Never commit them. The `.gv-auth` folder is a logged-in Google session — treat it like a
  password.
- The agent treats anything inside a client's message as untrusted text and never obeys
  instructions embedded in it.

# Profilr

**Verified professional credentials on Shelby Protocol — powered by GenLayer AI consensus.**

> Testnet build · Shelby Protocol + GenLayer + Aptos

---

## What is Profilr?

Profilr lets professionals store their credentials (education, work history, certifications, projects) as immutable blobs on **Shelby Protocol**. **GenLayer AI validators** verify every credential against public sources. Users share a single link — and choose whether viewing their full verified profile is free or paid.

Companies pay **USDC on Aptos** for 7-day access windows. The profile owner earns **70%** of every payment. Access is enforced by a GenLayer Intelligent Contract and recorded permanently on Shelby.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Storage | Shelby Protocol |
| AI Verification | GenLayer Intelligent Contracts |
| Blockchain | Aptos Testnet |
| Payments | USDC on Aptos |
| Wallets | Petra · Pontem · Martian (via Aptos Wallet Adapter) |
| Frontend | Next.js 14 + TypeScript + Tailwind |
| Backend | Next.js API Routes |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/profilr
cd profilr
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in:
- `SHELBY_API_KEY` — get from [developers.shelby.xyz](https://developers.shelby.xyz)
- `GENLAYER_CONTRACT_ADDRESS` — deploy the contract first (see below)
- `JWT_SECRET` — any random 32-char string

### 3. Deploy the GenLayer contract

```bash
# Install GenLayer CLI
npm install -g genlayer

# Initialize
genlayer init

# Deploy the Profilr contract
genlayer deploy contracts/profilr.py

# Copy the contract address to .env.local
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
profilr/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── dashboard/page.tsx          # User dashboard
│   │   ├── profile/[address]/page.tsx  # Public profile view
│   │   ├── explore/page.tsx            # Browse all profiles
│   │   └── api/
│   │       ├── profile/                # Profile CRUD
│   │       ├── credential/upload/      # Upload credential to Shelby
│   │       ├── verify/                 # Submit to GenLayer
│   │       └── access/                 # Grant/check/history
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   ├── profile/                    # All profile components
│   │   ├── wallet/WalletButton.tsx
│   │   └── ui/                         # Ticker, StatCard
│   ├── lib/
│   │   ├── shelby.ts                   # Shelby SDK client
│   │   ├── genlayer.ts                 # GenLayer RPC client
│   │   ├── wallet-provider.tsx         # Aptos wallet adapter
│   │   └── utils.ts
│   └── types/index.ts
├── contracts/
│   └── profilr.py                      # GenLayer Intelligent Contract
└── .env.example
```

---

## How Shelby Is Used

| Blob | Content | Public? |
|---|---|---|
| Profile blob | displayName, title, bio, accessMode, credentials list | Yes |
| Credential blob | type, title, institution, dates, description | Yes |
| Access record blob | viewer wallet, paidAt, expiresAt, txHash | Yes |
| Verdict blob | GenLayer verdict + reasoning | Yes |

---

## Revenue Model

Every paid access payment splits automatically:
- **70%** → Profile owner (straight to their Aptos wallet)
- **20%** → Platform
- **10%** → GenLayer verification fee

---

## Wallets Supported

- [Petra](https://petra.app)
- [Pontem](https://pontem.network)
- [Martian](https://martianwallet.xyz)

---

## Daily Dev Log

Follow the build in public. Every day's progress, bugs, and features posted on [Twitter/X](https://twitter.com).

---

## License

MIT

---

## Database — Upstash Redis

Profilr uses **Upstash Redis** for persistent storage of:
- Profile wallet → Shelby blob ID index
- Credential IDs
- Access records
- Banned/flagged wallets
- Platform stats

**Setup (free):**
1. Go to [upstash.com](https://upstash.com) — create a free account
2. Create a Redis database
3. Copy REST URL and REST Token into `.env.local`

---

## Admin Panel

Access the admin panel at `/admin` — only the wallet address in `NEXT_PUBLIC_ADMIN_WALLET` can enter. Anyone else gets redirected to home instantly.

**Admin can:**
- See all profiles, credentials, payments in real time
- View platform earnings (your 20% cut per payment)
- Flag or ban wallet addresses
- Unban wallets
- Search and filter everything

**To set your admin wallet:**
Add your Aptos wallet address to `.env.local`:
```
NEXT_PUBLIC_ADMIN_WALLET=0xYOUR_WALLET_ADDRESS_HERE
```

Keep this secret. Do not share your wallet address publicly if you want the admin panel to stay private.

---

## Deployment (Vercel)

```bash
# Push to GitHub first
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/profilr
git push -u origin main
```

Then:
1. Go to [vercel.com](https://vercel.com) and import the repo
2. Add all env vars from `.env.example`
3. Deploy


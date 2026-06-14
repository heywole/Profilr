# Profilr

**Verified professional credentials on Shelby Protocol, powered by GenLayer AI consensus.**

> Testnet build · Shelby Protocol + GenLayer + Aptos

---

## What is Profilr?

Profilr lets professionals store their credentials (education, work history, certifications, projects) as immutable blobs on **Shelby Protocol**. **GenLayer AI validators** verify every credential against public sources. Users share a single link and choose whether viewing their full verified profile is free or paid.

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
## License

MIT

---




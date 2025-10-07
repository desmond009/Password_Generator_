# Minimal Password Manager (Next.js + MongoDB)

Privacy-focused, client-side encrypted password manager.

## Live Demo
- Production: https://password-generator-l7xl.vercel.app

## Features
- Client-side encryption using PBKDF2 (SHA-256, 210k iters) and AES-GCM 256-bit
- Register/Login with email + password, session via HttpOnly cookie (JWT HS256)
- Create, view, delete vault items (title, username, password, URL, notes, tags)
- Strong password generator with look-alike exclusion
- Copy to clipboard with auto-clear after 15s
- Minimal UI, Tailwind, dark mode

## Crypto design
- Master password never leaves the browser.
- PBKDF2 with per-user salt (from server), derives AES-GCM key client-side.
- Each field encrypted with fresh 12-byte IV using WebCrypto `AES-GCM`.
- Server stores only ciphertext (ivB64, ctB64). No plaintext stored or logged.

## Tech
- Next.js App Router, React 19, TypeScript
- MongoDB with Mongoose
- jose for JWT, bcryptjs for password hashes

## Setup
1. Copy env and fill values:
   ```bash
   cp .env.local.example .env.local
   ```
2. Install and run:
   ```bash
   pnpm install
   pnpm dev
   ```
3. Open http://localhost:3000

## Deployment
- Vercel recommended. Add env vars `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET` in project settings.

## Notes
- Searching/filtering of secret fields is client-side after decryption. Server can filter plaintext tags only.
- Consider enabling 2FA (TOTP) and encrypted export/import as future work.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

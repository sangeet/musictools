# Music Tools Web App

A minimalist, web app for musicians, built with Next.js, React, and Tailwind CSS. This project provides interactive tools for music theory, practice, and composition.

## Features & Tools

- **Chord Progression Generator**: Select keys, generate jazz/blues/pop progressions, visualize chords, and use a built-in metronome. This was created when I had difficulties trying to stay in sync while playing certain blues chord progressions.

## Tech Stack

- **Next.js** (React framework)
- **React** (UI library)
- **Tailwind CSS** (utility-first CSS)
- **Supabase** (authentication & database)
- **TypeScript** (type safety)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sangeet/musictools.git
   cd musictools
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local` (or use the provided `.env.local`).
   - Add your Supabase project keys and database credentials.

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open the app:**
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup

To use authentication and save progressions, you need a [Supabase](https://supabase.com/) project:

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com/) and sign up/log in.
   - Click "New Project" and follow the instructions.

2. **Get your API keys:**
   - In your Supabase project dashboard, go to Project Settings > API.
   - Copy the `Project URL` and `anon` public key.
   - Add these to your `.env.local` file as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

3. **(Optional) Set up authentication and tables:**
   - Enable email/password authentication in the Auth settings.
   - Create tables for storing user data or custom progressions as needed.
   - See [Supabase docs](https://supabase.com/docs) for details.

4. **Restart your dev server** after updating `.env.local`.

## Editing & Customization

- Start editing the homepage by modifying `src/app/page.tsx`.
- Tool pages and components are in `src/app/tools/` and `src/components/`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy

Deploy easily on [Vercel](https://vercel.com/) or your preferred platform. See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).

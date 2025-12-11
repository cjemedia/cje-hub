# CJE Hub - Ciara J. Evans Digital Platform

A comprehensive digital platform for CJE Media and CJE Experiences, featuring a main website and client portal.

## Tech Stack

- **Framework**: Next.js 14
- **Database & Auth**: Supabase
- **Email**: Resend
- **Deployment**: Vercel
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Project Structure

- `/app` - Next.js app router pages
- `/components` - Reusable React components
- `/lib` - Utilities, Supabase client, etc.
- `/public` - Static assets

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
```

## Development

```bash
npm install
npm run dev
```

## Deployment

The project is configured for Vercel deployment. Connect your repository and set environment variables in the Vercel dashboard.

 

# Legacy Express Backend

This folder contains the original Express.js backend API that was used before migrating to Next.js API routes.

## Contents

- `server.js` - Express server entry point
- `api/` - Express API routes, middleware, and services

## Migration Status

✅ **Migrated to Next.js API Routes**

All API functionality has been migrated to Next.js API routes located in:
- `src/app/api/v1/` - All API endpoints

The Express backend is kept here for reference only and is **not used** in the current fullstack Next.js application.

## Why Keep This?

- Reference for API structure
- Potential fallback if needed
- Documentation of original architecture

## Current Architecture

The application now uses:
- **Frontend**: Next.js App Router (`src/app/`)
- **Backend**: Next.js API Routes (`src/app/api/v1/`)
- **Database**: Supabase PostgreSQL
- **Deployment**: Single Next.js application on Vercel





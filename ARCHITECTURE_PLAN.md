# Project Kultur AdTech & Media Platform: Master Architecture & Implementation Plan

> **Project:** Kultur (Next.js 16 App Router + Supabase)  
> **Target Deployments:** Bhubaneswar High-Density Hubs (Ganesh Pandals, Kalinga Stadium, University Fests)  
> **Scale Target:** 50,000+ concurrent scans with zero-DB read latency and non-blocking telemetry writes

---

## 1. Executive Summary & Design Principles

The platform connects physical water bottles (bearing dynamic QR codes `/scan/[batchId]/[bottleId]`) to an instantaneous edge web application.

### Key Pillars
1. **Extreme Performance Under Load**: Sub-second First Contentful Paint (<1s) and sub-150ms Time-to-Interactive. Absorbs up to 50,000 concurrent scans without exhausting PostgreSQL connection pools or causing latency spikes.
2. **Zero-Trust Security & Fraud Prevention**:
   - Device fingerprinting and IP rate limiting (sliding-window token bucket) to stop bots and QR brute-forcing.
   - Comprehensive Row-Level Security (RLS) policies in Supabase PostgreSQL: unauthenticated visitors can only read active campaign configs and submit leads/telemetry; lead reading is strictly forbidden. Advertisers are strictly sandboxed to their assigned `batch_id`.
   - Zod schema validation on all Server Actions with E.164 phone normalization and unique coupon claim constraints.
3. **Clean Code & Modular Architecture**:
   - Built on Next.js 16 App Router, React 19, TypeScript strict mode, and Tailwind CSS v4.
   - Zero-dependency code-split loading via `next/dynamic` for headers (`PANDAL_TRACKER`, `SPORTS_SCOREBOARD`, `CONCERT_ANNOUNCEMENT`) and interactive micro-games (`CATCH_MODAK`, `SPORTS_TRIVIA`).
4. **Cultural Brand Heritage Integration**:
   - Preserves the Odia cultural identity (Konark wheel, Odissi dance, Sambalpuri textiles) on the main hub (`/`) while framing the mobile conversion funnel.

---

## 2. Multi-Tenant Role-Based Schema & Security (Supabase PostgreSQL)

### Schema Definition (`supabase/schema.sql`)

```sql
-- Enable cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('MASTER_ADMIN', 'VENUE_ORGANISER', 'ADVERTISER', 'VOLUNTEER');
CREATE TYPE header_type AS ENUM ('PANDAL_TRACKER', 'SPORTS_SCOREBOARD', 'CONCERT_ANNOUNCEMENT');
CREATE TYPE game_type AS ENUM ('CATCH_MODAK', 'SPORTS_TRIVIA', 'FAN_VOTING');

-- 1. Profiles (Tied to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'ADVERTISER',
    meta JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"assigned_batch_id": "VISTARA_SAHEED_2026", "company": "Vistara Infra"}
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Campaigns (Dynamic Layout Configurator)
CREATE TABLE IF NOT EXISTS campaigns (
    batch_id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    total_bottles INTEGER NOT NULL DEFAULT 10000 CHECK (total_bottles > 0),
    venue_id TEXT NOT NULL,
    ui_header_type header_type NOT NULL DEFAULT 'PANDAL_TRACKER',
    game_type game_type NOT NULL DEFAULT 'CATCH_MODAK',
    reward_text TEXT NOT NULL,
    theme_dark_bg TEXT NOT NULL DEFAULT '#0a0a0a',
    sponsor_logo_url TEXT,
    header_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- live queue info, teams, or artist schedule
    game_config JSONB NOT NULL DEFAULT '{}'::jsonb,   -- trivia questions or game parameters
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Scan Logs (High-Throughput Ingested Telemetry)
CREATE TABLE IF NOT EXISTS scan_logs (
    id BIGSERIAL PRIMARY KEY,
    batch_id TEXT NOT NULL REFERENCES campaigns(batch_id) ON DELETE CASCADE,
    bottle_id TEXT NOT NULL,
    device_fingerprint TEXT,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_scan_logs_batch_timestamp ON scan_logs(batch_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scan_logs_bottle_id ON scan_logs(bottle_id);

-- 4. Leads (Verified Conversion Records)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id TEXT NOT NULL REFERENCES campaigns(batch_id) ON DELETE CASCADE,
    bottle_id TEXT,
    phone_number TEXT NOT NULL,
    coupon_code_issued TEXT NOT NULL,
    claimed_ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_phone_per_campaign_batch UNIQUE (batch_id, phone_number)
);

CREATE INDEX IF NOT EXISTS idx_leads_batch_id ON leads(batch_id);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone_number);

-- RLS Configuration
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Campaigns RLS
CREATE POLICY "Public read active campaigns" 
ON campaigns FOR SELECT 
TO anon, authenticated 
USING (is_active = TRUE);

CREATE POLICY "Master admins manage campaigns" 
ON campaigns FOR ALL 
TO authenticated 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'MASTER_ADMIN');

-- Scan Logs RLS
CREATE POLICY "Allow public insert of telemetry" 
ON scan_logs FOR INSERT 
TO anon, authenticated 
WITH CHECK (TRUE);

CREATE POLICY "Advertiser and admin view scan logs" 
ON scan_logs FOR SELECT 
TO authenticated 
USING (
    batch_id = (SELECT (meta->>'assigned_batch_id') FROM profiles WHERE id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'MASTER_ADMIN'
);

-- Leads RLS (Strict Anti-Leak Protection)
CREATE POLICY "Allow public insert of verified leads" 
ON leads FOR INSERT 
TO anon, authenticated 
WITH CHECK (TRUE);

CREATE POLICY "Advertisers and admin view their leads" 
ON leads FOR SELECT 
TO authenticated 
USING (
    batch_id = (SELECT (meta->>'assigned_batch_id') FROM profiles WHERE id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'MASTER_ADMIN'
);
```

---

## 3. High-Concurrency Edge Engine (50,000 Scans/Sec)

```
                  ┌──────────────────────────────────────────────┐
                  │ HTTP GET: /scan/[batchId]/[bottleId]         │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │ Edge Middleware (Rate limit + Fingerprint)   │
                  └──────────────────────┬───────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
                   ▼ (Read Path - 0ms DB)                      ▼ (Write Path - 5ms return)
    ┌─────────────────────────────┐             ┌─────────────────────────────┐
    │ Next.js `unstable_cache`    │             │ Async Telemetry Ingest Box  │
    │ In-Memory Tag Revalidate    │             │ (Memory Buffer / QStash)    │
    │ TTL = 300 seconds           │             └──────────────┬──────────────┘
    └──────────────┬──────────────┘                            │ Flush 500 rows
                   │ Cache Hit                                 ▼
                   ▼                            ┌─────────────────────────────┐
    ┌─────────────────────────────┐             │ Supabase PostgreSQL         │
    │ Fast SSR Edge Page Delivery │             │ scan_logs.insert(chunk)     │
    └─────────────────────────────┘             └─────────────────────────────┘
```

1. **Read Path (0% DB Pressure)**:
   - Metadata for `campaigns` is cached using `unstable_cache` with a 300s TTL.
   - Cache key: `['campaign', batchId]`.
   - Revalidation tags allow instant invalidation when an admin updates campaign details without restarting servers.
2. **Write Path (Asynchronous Telemetry Ingest Buffer)**:
   - The scan path pushes a light telemetry payload (`batch_id`, `bottle_id`, `ip`, `fingerprint`, `timestamp`) into a memory batching queue (`src/lib/telemetry-queue.ts`).
   - The server response returns to the client immediately (< 50ms) without waiting for PostgreSQL.
   - A background queue ticker flushes records in chunks of 500 rows into `scan_logs`.
3. **Edge Rate Limiting (`middleware.ts`)**:
   - Token bucket algorithm checks client IP + user-agent hash.
   - Limits single IPs to a maximum of 30 scans/minute to block automated scanners and brute-force bots.

---

## 4. Dynamic Component Pipeline (`/scan/[batchId]/[bottleId]`)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                           # Main B2B Brand Hub
│   ├── scan/
│   │   └── [batchId]/
│   │       └── [bottleId]/
│   │           ├── page.tsx               # High-speed Edge Server Component
│   │           └── error.tsx              # Clean fallback for invalid/expired batches
├── components/
│   ├── b2b/
│   │   └── partner-modal.tsx              # Interactive B2B Campaign & ROI Simulator
│   ├── dynamic-headers/
│   │   ├── pandal-tracker.tsx             # Live queue wait-time & darshan status
│   │   ├── sports-scoreboard.tsx          # Real-time tournament match score
│   │   └── concert-announcement.tsx       # Festival lineup and stage schedule
│   ├── games/
│   │   ├── catch-modak.tsx                # 60fps HTML5 Canvas touch interaction
│   │   └── sports-trivia.tsx              # Multi-choice rapid quiz state machine
│   ├── scan/
│   │   ├── scan-shell.tsx                 # Glassmorphic responsive wrapper
│   │   └── sponsor-reward-drawer.tsx      # Phone verification & voucher reveal
│   ├── cover-flow.tsx
│   ├── keycap-button.tsx
│   └── logo-lockup.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      # Client-side Supabase helper
│   │   ├── server.ts                      # Server-side Supabase client (service role)
│   │   └── types.ts                       # Strictly-typed database schema interfaces
│   ├── telemetry-queue.ts                 # High-throughput batch writer
│   ├── cache.ts                           # unstable_cache campaign retrieval
│   └── actions/
│       └── claim-reward.ts                # Server Action: phone validation & voucher generation
└── middleware.ts                          # Edge rate limiting & bot defense
```

---

## 5. Implementation Phases

- **Phase 1: Brand Hub Polish & B2B Partner Drawer**: Anchor scenery, mount `ksaree.png`, wire ROI calculator modal.
- **Phase 2: Core Database & Caching Foundation**: Schema migration, types, client, `unstable_cache`, async buffer, rate limiting.
- **Phase 3: Dynamic Scanner Route & Modules**: Dynamic coordinator, header switch (`PANDAL_TRACKER`, `SPORTS_SCOREBOARD`), game switch (`CATCH_MODAK`, `SPORTS_TRIVIA`), `SponsorRewardDrawer` lead gate.
- **Phase 4: Quality & Performance Verification**: End-to-end testing, build validation, mobile touch responsiveness.

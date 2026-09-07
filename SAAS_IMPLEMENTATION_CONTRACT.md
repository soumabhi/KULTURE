# KULTUR SaaS Implementation Contract

Date: 2026-09-06
Status: Active
Scope: Phase 1 Ganesh Puja SaaS build in a single Next.js monolith

## 1. Product Contract

KULTUR provides one integrated product with two user surfaces:

1. Public campaign interaction surface
   Path family: /scan/[batchCode]
   Purpose: campaign experience entry, claim initiation, conversion path

2. Authenticated SaaS surface
   Path family: /app/\*
   Purpose: operations, advertiser visibility, venue operations, volunteer workflows

Root path / remains the customer-facing brand experience.

## 2. Route Contract

Mandatory routes:

1. /login
2. /auth/callback
3. /logout
4. /app
5. /app/admin
6. /app/advertiser
7. /app/venue
8. /app/volunteer
9. /scan/[batchCode]
10. /scan/[batchCode]/claim

Routing rules:

1. Unauthenticated access to /app/\* redirects to /login with next path.
2. Unconfigured environment renders setup-required state and does not fabricate data.
3. Role-constrained routes return explicit unauthorized state when membership lacks required role.

## 3. Identity and Authorization Contract

Identity source:

1. Supabase Auth user identity
2. Application profile and organization membership relationships in PostgreSQL

Authorization source of truth:

1. organization_members role records
2. role checks at server route/page boundary
3. database-level RLS policies (to be applied when Supabase access is provided)

## 4. Data Contract (Phase 1)

Core domain contracts are defined in src/lib/domain/contracts.ts and include:

1. Organization and membership roles
2. Event, venue, and campaign hierarchy
3. Production batch and scan session lifecycle
4. Claim and voucher lifecycle states

Constraint contract:

1. One verified phone claim per campaign
   Unique key: campaign_id + phone_hash in claims (hard DB rule, no configurable override).
   Consent: terms consent required to claim; sponsor marketing consent optional and separately recorded with capture timestamp and policy versions (consent_terms_version, consent_privacy_version). Advertisers see only consented leads.

## 5. UX Contract

Design constraints for implemented routes:

1. Preserve current visual language from landing site
2. Preserve keycap button component for CTA affordance
3. Use the same warm stage palette and tactile controls

## 6. Operational Contract

The product remains a modular monolith:

1. One Next.js codebase
2. One Supabase project
3. No separate microservices in Phase 1

## 7. Security Contract

Required security behavior:

1. No OTP values stored in app database
2. No sensitive service credentials exposed to client code
3. Public claims use normalized E.164 phone format and hashed phone identity
4. Role checks never rely on client-only gating

## 8. Acceptance Contract

Current acceptance targets for this codebase revision:

1. Route architecture compiles cleanly
2. Supabase config checks fail safely and explicitly
3. Auth callback and logout handlers are present
4. Public scan and claim routes are operationally wired to real tables

## 8A. Public Journey Contract (implemented)

1. /scan/[batchCode] renders the Ganesh experience from campaign config via the public_scan_context RPC and creates a scan session via start_public_scan (rate-limited: 60/IP/hour; raw IP never stored, only peppered hash).
2. /scan/[batchCode]/play hosts the Catch Modak game (30 seconds, pointer/keyboard, reduced-motion fallback) and records GAME_STARTED/GAME_COMPLETED events. The game is engagement, not a security boundary — eligibility is enforced by verified phone, not game score.
3. /scan/[batchCode]/claim runs phone -> OTP -> voucher steps. OTP codes are generated server-side, stored only as salted SHA-256 hashes with expiry and attempt limits, and delivered via MSG91 (KULTUR_OTP_WEBHOOK_URL fallback). One verified claim per (campaign, phone_hash) is a hard DB rule.
4. Vouchers are issued transactionally inside verify_public_otp with retry-safe unique code generation (row-locked, collision-regenerating).
5. Voucher redemption runs through redeem_voucher with row locking and advertiser-tenant authorization; every redemption writes an audit row.

## 8B. Admin Chain Contract (implemented)

Admin can complete the full chain without touching code: organizations -> members -> venues -> events -> event venue links -> campaigns -> campaign configs -> activations -> production batches. Partner workspaces (advertiser metrics + redemption, venue live updates, volunteer assignments) read only organization-scoped records.

## 9. Next Integration Contract

Once Supabase access is provided, this contract requires:

1. SQL schema migration creation in dependency order
2. RLS policy creation and validation for all protected tables
3. OTP provider wiring and verification_attempts persistence
4. end-to-end verification of scan -> claim -> voucher flow

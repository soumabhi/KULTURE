YES. And after going through everything, **I think we should now stop adding random features and lock the actual architecture.**

Also, based on the current official Next.js and Supabase guidance, your choice of a **Next.js monolith + Supabase** is a good fit for Phase 1. Next.js explicitly supports multi-tenant applications, Server Components, Server Actions, Route Handlers, and caching; Supabase gives us Postgres, Auth, Realtime, and database-level RLS. ([Next.js][1])

# 🚨 First: What KULTUR actually is

Forget the complicated words for a second.

## KULTUR is this:

> **A system that connects a physical bottle → a real-world event → a sponsor → a digital experience → a verified customer → measurable campaign data.**

For **Ganesh Puja Phase 1**, we are NOT building a generic India-wide platform yet.

We build:

# 🕉️ KULTUR × GANESH PUJA

```text
KULTUR
   │
   ├── Ganesh Puja Event
   │
   ├── Multiple Pandal Locations
   │
   ├── Sponsors / Companies
   │
   ├── Campaigns
   │
   ├── Bottle Batches
   │
   ├── Volunteers
   │
   └── QR Scan Experience
```

---

# 🧠 THE MOST IMPORTANT ARCHITECTURAL DECISION

You previously asked:

> **"Venue organiser is location or does it come under event or campaign?"**

My expert answer:

# ❌ A venue organizer is NOT a location.

# ❌ A venue organizer is NOT directly a campaign.

A **Venue Organizer is an Organization/User relationship connected to an Event Venue.**

Let's separate the real-world concepts.

---

# 🏗️ THE REAL-WORLD HIERARCHY

For Ganesh Puja:

```text
KULTUR
   │
   ▼
EVENT
Ganesh Puja 2026
   │
   ├───────────────┬────────────────┐
   ▼               ▼                ▼
LOCATION        LOCATION         LOCATION
Pandal A        Pandal B         Pandal C
   │               │
   ▼               ▼
VENUE           VENUE
ORGANIZER       ORGANIZER
```

Example:

```text
EVENT
Ganesh Puja 2026

        │
        ▼

LOCATION
Saheed Nagar

        │
        ▼

VENUE
Saheed Nagar Ganesh Pandal

        │
        ▼

VENUE ORGANIZATION
Saheed Nagar Pandal Committee

        │
        ▼

VENUE USERS
Organizer A
Organizer B
```

This distinction will save us **massive database problems later**.

---

# 🎯 THE COMPLETE KULTUR ARCHITECTURE

I would design the system in **8 major domains**.

```text
┌─────────────────────────────────────┐
│            KULTUR CORE              │
│                                     │
│  1. Identity & Users                │
│  2. Companies                       │
│  3. Events                          │
│  4. Venues                          │
│  5. Campaigns                       │
│  6. Bottle Production               │
│  7. Consumer Experience             │
│  8. Analytics & Leads               │
└─────────────────────────────────────┘
```

Now let's go through the actual architecture.

---

# 🥇 DOMAIN 1 — USERS, ADMINS & ROLES

Everything starts with a human.

```text
USER
 │
 ├── Master Admin
 │
 ├── Kultur Admin
 │
 ├── Company User
 │
 ├── Venue Organizer
 │
 └── Volunteer
```

## Example

```text
Abhishek
   │
   └── MASTER_ADMIN

Rahul
   │
   └── VOLUNTEER

Amit
   │
   └── COMPANY_USER

Suresh
   │
   └── VENUE_ORGANIZER
```

### Important:

A **user should not permanently equal one role**.

Why?

Imagine:

```text
Rahul

2026:
Volunteer

2027:
Venue Manager

2028:
Kultur Admin
```

Therefore:

# User ≠ Role

Instead:

```text
USERS
   │
   │
   ▼
USER_ROLES
   │
   ▼
ROLES
```

Supabase supports database-level authorization through RLS, and roles/permissions can also be modeled for RBAC rather than trusting only frontend route checks. ([Supabase][2])

---

# 🥈 DOMAIN 2 — COMPANIES

Companies are the advertisers.

For example:

```text
COMPANY

Khimji Jewellers
DN Homes
XYZ Restaurant
ABC Clothing
```

Database concept:

```text
COMPANY
│
├── id
├── name
├── logo
├── contact details
├── status
└── created_at
```

Then:

```text
COMPANY
     │
     ├── Company User
     │
     ├── Campaign
     │
     └── Leads / Results
```

Example:

```text
DN HOMES
   │
   ├── Amit → Marketing Manager
   │
   ├── Priya → Campaign Manager
   │
   └── Campaign → Ganesh Puja Offer
```

---

# 🥉 DOMAIN 3 — EVENTS

This is where I want us to be extremely strict.

## Ganesh Puja is an EVENT.

```text
EVENT

Ganesh Puja 2026
```

Fields:

```text
EVENT

id
name
type
start_date
end_date
city
state
status
```

Example:

```text
Ganesh Puja 2026

Type:
FESTIVAL

Start:
September XX

End:
September XX

City:
Bhubaneswar
```

Later:

```text
EVENT

Ganesh Puja 2026
Durga Puja 2026
Cricket Tournament
College Fest
Music Concert
```

But for now:

# 🕉️ ONLY GANESH PUJA

No unnecessary generic complexity.

---

# 🏟️ DOMAIN 4 — LOCATIONS & VENUES

This needs two separate entities.

## LOCATION

A geographical area.

Example:

```text
Saheed Nagar
Rasulgarh
Khandagiri
Patia
```

Then:

## VENUE

The actual physical place.

```text
LOCATION
Saheed Nagar

       │
       ▼

VENUE
Saheed Nagar Ganesh Pandal
```

So:

```text
EVENT
 │
 └──── LOCATION
          │
          └──── VENUE
```

But an event can have many venues.

Therefore:

```text
GANESH PUJA 2026
      │
      ├── Venue A
      │
      ├── Venue B
      │
      ├── Venue C
      │
      └── Venue D
```

---

# 🏛️ DOMAIN 5 — VENUE ORGANIZERS

Now comes the answer to your earlier question.

```text
VENUE
   │
   ▼
VENUE ORGANIZATION
   │
   ▼
VENUE USERS
```

Example:

```text
Saheed Nagar Ganesh Pandal

          │

          ▼

Saheed Nagar Ganesh Committee

          │

     ┌────┴────┐
     │         │
     ▼         ▼

Organizer 1  Organizer 2
```

So our relationship is:

```text
EVENT
 │
 ▼
VENUE
 │
 ▼
VENUE_ORGANIZATION
 │
 ▼
USERS
```

---

# 💰 DOMAIN 6 — CAMPAIGNS

Now we introduce the sponsor.

Example:

```text
COMPANY

Khimji Jewellers
      │
      ▼
CAMPAIGN

Ganesh Puja Gold Offer
```

A campaign should belong to:

```text
COMPANY
```

And participate in:

```text
EVENT
```

And target:

```text
VENUES
```

Therefore:

```text
COMPANY
   │
   ▼
CAMPAIGN
   │
   ├──── EVENT
   │
   └──── VENUES
```

Example:

```text
DN HOMES
   │
   ▼
Ganesh Puja 2026 Campaign
   │
   ├── Saheed Nagar Pandal
   ├── Rasulgarh Pandal
   └── Patia Pandal
```

---

# 🚨 VERY IMPORTANT: CAMPAIGN ≠ EVENT

This is a crucial distinction.

```text
EVENT
Ganesh Puja 2026

      │

      ├─────────────┐
      │             │
      ▼             ▼

CAMPAIGN A      CAMPAIGN B

Khimji          DN Homes
```

So:

```text
ONE EVENT

CAN HAVE

MANY CAMPAIGNS
```

---

# 🧃 DOMAIN 7 — BOTTLE PRODUCTION

Now we enter the physical world.

We need:

```text
CAMPAIGN
   │
   ▼
PRODUCTION ORDER
   │
   ▼
BOTTLE BATCH
   │
   ▼
DISTRIBUTION
```

Example:

```text
DN Homes Campaign

        │
        ▼

Production Order

10,000 Bottles

        │
        ▼

Batch 001

5,000 bottles

        │
        ▼

Batch 002

5,000 bottles
```

---

# 🏭 Why Production Order and Batch should be separate

Imagine:

```text
Production Order

20,000 bottles
```

The factory might produce:

```text
Batch A
5,000

Batch B
5,000

Batch C
5,000

Batch D
5,000
```

Each batch can go somewhere different.

```text
Batch A
→ Saheed Nagar

Batch B
→ Rasulgarh

Batch C
→ Patia

Batch D
→ Khandagiri
```

This is extremely important for analytics.

---

# 🧍 DOMAIN 8 — VOLUNTEERS

Volunteers should NOT directly belong permanently to a venue.

Instead:

```text
VOLUNTEER

can receive

TASKS
```

Example:

```text
Rahul
   │
   ▼

TASK

Deliver Batch 001

   │
   ▼

Saheed Nagar
```

Tomorrow:

```text
Rahul

TASK

Deliver Batch 002

   │
   ▼

Patia
```

Therefore:

# Volunteer → Assignment

Not:

# Volunteer → Venue forever

---

# 📦 DISTRIBUTION SYSTEM

Now:

```text
BATCH
   │
   ▼
DISTRIBUTION ASSIGNMENT
   │
   ├── Volunteer
   │
   ├── Venue
   │
   └── Quantity
```

Example:

```text
BATCH-001

Volunteer:
Rahul

Destination:
Saheed Nagar Pandal

Quantity:
500 bottles
```

Status:

```text
ASSIGNED

↓

PICKED_UP

↓

IN_TRANSIT

↓

DELIVERED

↓

CONFIRMED
```

---

# 📍 GEOLOCATION

For Phase 1:

```text
VENUE

latitude
longitude
allowed_radius
```

Example:

```text
Saheed Nagar

Latitude: X
Longitude: Y

Radius:
100 meters
```

Volunteer:

```text
CLICK

CONFIRM DELIVERY
```

Browser gets location:

```text
Volunteer GPS

        │

        ▼

Compare with

VENUE GPS

        │

        ▼

Inside Radius?

YES
 │
 ▼

DELIVERY CONFIRMED
```

Next.js itself notes that browser geolocation is a client-side Web API concern, so this part naturally belongs in a Client Component rather than a Server Component. ([Next.js][3])

---

# 🔳 DOMAIN 9 — QR CODE

Now comes your brilliant manufacturing decision.

We do NOT need:

```text
10,000 unique QR codes
```

Instead:

```text
BATCH

↓

ONE QR URL
```

Example:

```text
kultur.live/scan/BATCH-001
```

Every bottle in that batch:

```text
┌─────────────┐
│             │
│      QR     │
│             │
└─────────────┘

/scan/BATCH-001
```

This keeps printing cheap.

---

# 📱 THE SCAN FLOW

The consumer scans:

```text
BOTTLE

   │

   ▼

QR CODE

   │

   ▼

/scan/BATCH-001
```

Then:

```text
Next.js
   │
   ▼
Find Batch
   │
   ▼
Find Campaign
   │
   ▼
Find Event
   │
   ▼
Find Sponsor
   │
   ▼
Render Experience
```

So:

```text
QR

↓

BATCH

↓

CAMPAIGN

↓

EVENT

↓

EXPERIENCE
```

This is the central relationship.

---

# 🎮 THE CONSUMER SCREEN

For Ganesh Puja only:

```text
SCAN PAGE

┌───────────────────────────┐
│                           │
│ 🕉️ GANESH PUJA            │
│                           │
│ [PANDAL INFORMATION]      │
│                           │
│ [LIVE ANNOUNCEMENT]       │
│                           │
│ ─────────────────────     │
│                           │
│     SPONSOR BRAND         │
│                           │
│   "Catch the Modak" 🎮    │
│                           │
│                           │
│     PLAY GAME             │
│                           │
└───────────────────────────┘
```

For Phase 1:

# ONE EXPERIENCE TYPE

```text
GANESH PUJA
```

We should **not build Sports, Concerts, Stadiums yet**.

That is future architecture.

---

# 🎮 GAME → REWARD FLOW

```text
USER SCANS

↓

GANESH SCREEN

↓

PLAYS GAME

↓

GAME COMPLETED

↓

CLAIM OFFER

↓

PHONE NUMBER

↓

OTP

↓

VERIFY

↓

CREATE LEAD

↓

GENERATE VOUCHER
```

---

# 📞 THE PHONE NUMBER IS NOT JUST "A LEAD"

This is important.

The process is:

```text
PHONE ENTERED

↓

OTP VERIFIED

↓

IDENTITY VERIFIED

↓

LEAD CREATED

↓

VOUCHER CREATED
```

So ideally:

```text
LEAD
      │
      └── VOUCHER
```

Not:

```text
Phone Number
      │
      ▼
Random Coupon
```

---

# 🎟️ VOUCHER SYSTEM

Our database relationship:

```text
CAMPAIGN
   │
   ▼
LEAD
   │
   ▼
VOUCHER
```

Example:

```text
DN HOMES CAMPAIGN

       │

       ▼

USER

+91XXXXXXXXXX

       │

       ▼

VOUCHER

KULTUR-DNH-8X92AB
```

The database constraint:

```text
ONE PHONE

+

ONE CAMPAIGN

=

ONE CLAIM
```

Not necessarily batch.

This is something I would change from the previous design.

---

# 🚨 IMPORTANT CORRECTION TO OUR OLD DESIGN

Previously we discussed:

```text
UNIQUE

(batch_id, phone_number)
```

But I would ask:

## What if the same campaign runs in three batches?

```text
DN Homes Campaign

Batch A
Batch B
Batch C
```

The same person scans:

```text
Batch A
```

And then:

```text
Batch B
```

Should they receive another reward?

Probably **NO**.

Therefore:

# Better Phase 1 rule:

```text
UNIQUE

(campaign_id, phone_identity)
```

NOT:

```text
(batch_id, phone_number)
```

Because the **campaign owns the reward**, not the bottle batch.

🔥 This is exactly why we need proper architecture before coding.

---

# 📊 DATA COLLECTION

Every scan creates an event.

```text
SCAN EVENT
```

Possible data:

```text
scan_id

batch_id
campaign_id
venue_id

timestamp

device information

utm information

session identifier
```

Then:

```text
USER

↓

GAME_STARTED

↓

GAME_COMPLETED

↓

CLAIM_OPENED

↓

PHONE_SUBMITTED

↓

OTP_SENT

↓

OTP_VERIFIED

↓

VOUCHER_CREATED
```

This gives us a funnel.

---

# 📈 THE ANALYTICS FUNNEL

```text
BOTTLES DISTRIBUTED
       │
       ▼
QR SCANS
       │
       ▼
PAGE OPENED
       │
       ▼
GAME STARTED
       │
       ▼
GAME COMPLETED
       │
       ▼
CLAIM ATTEMPTED
       │
       ▼
PHONE VERIFIED
       │
       ▼
VOUCHER GENERATED
       │
       ▼
VOUCHER REDEEMED
```

Now the advertiser can see:

```text
10,000 bottles

↓

3,000 scans

↓

1,800 games

↓

700 OTP verifications

↓

700 leads

↓

150 redemptions
```

THIS is the actual commercial product.

Not the QR code.

Not the game.

# 📊 The measurable funnel is the product.

---

# 🏢 ADMIN FLOW

Now let's see what YOU, the Kultur Master Admin, do.

```text
MASTER ADMIN
```

Creates:

### Step 1

```text
EVENT

Ganesh Puja 2026
```

### Step 2

```text
VENUES

Saheed Nagar
Patia
Rasulgarh
```

### Step 3

```text
VENUE ORGANIZATIONS
```

### Step 4

```text
COMPANY

Khimji
DN Homes
```

### Step 5

```text
CAMPAIGN
```

Example:

```text
DN Homes

Ganesh Puja Campaign
```

### Step 6

Choose:

```text
TARGET VENUES
```

### Step 7

Create:

```text
PRODUCTION ORDER
```

### Step 8

Create:

```text
BATCHES
```

### Step 9

Assign:

```text
VOLUNTEERS
```

### Step 10

Activate:

```text
QR EXPERIENCE
```

---

# 🔥 THE COMPLETE SYSTEM

```text
                       KULTUR
                          │
                          ▼
                    MASTER ADMIN
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
     COMPANIES          EVENTS            USERS
        │                 │                 │
        │                 ▼                 │
        │              VENUES               │
        │                 │                 │
        │                 ▼                 ▼
        │         VENUE ORGANIZERS      VOLUNTEERS
        │
        ▼
     CAMPAIGNS
        │
        ├───────────────┐
        │               │
        ▼               ▼
     EVENT            VENUES
        │
        ▼
PRODUCTION ORDER
        │
        ▼
      BATCH
        │
        ▼
 DISTRIBUTION
        │
        ▼
     BOTTLES
        │
        ▼
        QR
        │
        ▼
   SCAN EXPERIENCE
        │
        ▼
       GAME
        │
        ▼
       CLAIM
        │
        ▼
        OTP
        │
        ▼
       LEAD
        │
        ▼
      VOUCHER
        │
        ▼
     REDEMPTION
        │
        ▼
     ANALYTICS
```

# 🧱 THE MONOLITH I WOULD BUILD

I would **not** start with microservices.

Absolutely not.

```text
┌─────────────────────────────────────┐
│                                     │
│             NEXT.JS                 │
│                                     │
│  Public Scan Experience             │
│  Admin Dashboard                    │
│  Company Dashboard                  │
│  Venue Portal                       │
│  Volunteer Portal                   │
│                                     │
│  Server Actions                     │
│  Route Handlers                     │
│  Authentication                     │
│  Business Logic                     │
│                                     │
└─────────────────┬───────────────────┘
                  │
                  │
                  ▼
          ┌───────────────┐
          │   SUPABASE    │
          │               │
          │ PostgreSQL    │
          │ Auth          │
          │ RLS           │
          │ Realtime      │
          │ Storage       │
          └───────────────┘
```

This is exactly the right direction.

Server Components can handle most server-side reads, Server Actions are intended for mutations, and Route Handlers can provide explicit HTTP endpoints where needed. ([Next.js][4])

---

# 📁 THE PROJECT ARCHITECTURE I WOULD USE

```text
kultur/
│
├── app/
│
│   ├── (public)/
│   │   └── scan/
│   │       └── [batchCode]/
│   │           └── page.tsx
│   │
│   ├── (auth)/
│   │   └── login/
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── companies/
│   │   ├── events/
│   │   ├── venues/
│   │   ├── campaigns/
│   │   ├── production/
│   │   └── volunteers/
│   │
│   ├── company/
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── leads/
│   │   └── vouchers/
│   │
│   ├── venue/
│   │   └── dashboard/
│   │
│   ├── volunteer/
│   │   └── tasks/
│   │
│   ├── api/
│   │   ├── vouchers/
│   │   ├── webhooks/
│   │   └── health/
│   │
│   └── actions/
│
├── components/
│
│   ├── scan/
│   ├── ganesh/
│   ├── games/
│   ├── voucher/
│   ├── admin/
│   ├── company/
│   ├── venue/
│   └── volunteer/
│
├── lib/
│
│   ├── supabase/
│   ├── auth/
│   ├── permissions/
│   ├── campaigns/
│   ├── vouchers/
│   └── analytics/
│
├── features/
│
│   ├── events/
│   ├── venues/
│   ├── campaigns/
│   ├── production/
│   ├── claims/
│   └── analytics/
│
└── supabase/
    │
    ├── migrations/
    │
    └── tests/
```

I would organize the monolith by **domain/features**, not turn the whole project into one giant `components/` mess.

---

# 🔐 SECURITY ARCHITECTURE

This is where we must be serious.

```text
CLIENT

   │

   ▼

NEXT.JS

   │

   ▼

SUPABASE AUTH

   │

   ▼

USER ID

   │

   ▼

ROLE CHECK

   │

   ▼

RLS CHECK

   │

   ▼

DATABASE
```

We should **never trust just this**:

```typescript
if (user.role === "admin")
```

The UI can hide buttons, but the database must independently enforce tenant boundaries.

Supabase's RLS documentation specifically recommends enabling RLS, controlling grants, creating operation-specific policies, and testing allowed/denied access. ([Supabase][2])

---

# 🏢 MULTI-TENANCY

The central tenant for advertisers should be:

```text
COMPANY
```

Example:

```text
COMPANY

DN Homes
```

Users inside:

```text
DN Homes

├── Amit
├── Priya
└── Rahul
```

Their data:

```text
DN Homes Campaigns

DN Homes Leads

DN Homes Vouchers
```

They must NOT see:

```text
Khimji Campaigns

Khimji Leads

Khimji Vouchers
```

That's where tenant-aware queries and RLS become essential. Next.js has current guidance specifically for multi-tenant application architecture, while Supabase positions RLS as a database-level isolation mechanism. ([Next.js][1])

---

# ⚡ ONE THING I WOULD CHANGE FROM OUR OLD "50,000 REQUESTS" PLAN

I want to correct something important.

Earlier architecture said:

> "Next.js RAM cache"

and:

> "in-process queue"

for huge traffic.

I would **NOT treat process-local memory as our production architecture**.

Why?

On serverless/lambda-style hosting, requests may run in separate instances and Route Handlers cannot rely on sharing data between requests. ([Next.js][3])

So Phase 1:

```text
SCAN

↓

Next.js cached campaign configuration

↓

Supabase
```

Use proper Next.js caching/revalidation where appropriate. Next.js supports persistent Data Cache and tag/path-based revalidation. ([Next.js][5])

Later:

```text
SCAN EVENT

↓

DURABLE QUEUE

↓

WORKER

↓

DATABASE
```

Not:

```text
JavaScript array in memory
```

🔥 This is a major production correction.

---

# 🕉️ OUR PHASE 1 SHOULD BE MUCH SIMPLER

I would lock Phase 1 to:

## KULTUR GANESH PUJA MVP

### Build:

✅ Users
✅ Roles
✅ Companies
✅ Ganesh Puja Event
✅ Venues
✅ Venue Organizers
✅ Campaigns
✅ Production Orders
✅ Batches
✅ Volunteer Assignments
✅ QR Scan
✅ Ganesh Experience
✅ One Game
✅ Phone OTP
✅ Voucher
✅ Voucher Redemption
✅ Analytics Funnel

### Do NOT build yet:

❌ Sports mode
❌ Concert mode
❌ Generic dynamic component engine
❌ CRM integrations
❌ Webhooks
❌ Google Ads integration
❌ Meta integration
❌ Multiple game engines
❌ Complex queue infrastructure
❌ Multi-city expansion

We design the database so they can come later.

But we don't build them.

---

# 🚀 MY RECOMMENDED BUILD ORDER

This is how **I would personally build KULTUR with you**:

## STEP 1 — Foundation

```text
USERS
ROLES
PERMISSIONS
AUTH
```

## STEP 2 — Event World

```text
EVENT
LOCATION
VENUE
VENUE ORGANIZER
```

## STEP 3 — Business World

```text
COMPANY
COMPANY USERS
CAMPAIGN
```

## STEP 4 — Physical World

```text
PRODUCTION ORDER
BATCH
DISTRIBUTION
VOLUNTEER TASK
```

## STEP 5 — Consumer World

```text
QR
SCAN
GANESH PAGE
GAME
```

## STEP 6 — Conversion

```text
PHONE
OTP
LEAD
VOUCHER
```

## STEP 7 — Business Value

```text
REDEMPTION
ANALYTICS
DASHBOARDS
```

---

# 🧠 MY STRONGEST RECOMMENDATION

## DON'T CODE YET.

We are finally at the point where we have enough information to design the **actual relational database architecture**.

The next thing we should do is:

# 🔥 KULTUR ENTITY RELATIONSHIP ARCHITECTURE

We should take **every entity** and design:

```text
ENTITY

What is it?

↓

Why does it exist?

↓

What fields does it have?

↓

Who owns it?

↓

What does it connect to?

↓

One-to-one?

↓

One-to-many?

↓

Many-to-many?

↓

What happens when deleted?

↓

Who can access it?
```

And then build the final:

# 🗄️ KULTUR DATABASE ERD

Starting with:

```text
1. USERS
2. ROLES
3. COMPANIES
4. EVENTS
5. LOCATIONS
6. VENUES
7. VENUE ORGANIZERS
8. CAMPAIGNS
9. PRODUCTION ORDERS
10. BATCHES
11. VOLUNTEER TASKS
12. SCANS
13. LEADS
14. VOUCHERS
15. REDEMPTIONS
16. ANALYTICS EVENTS
```

**My recommendation: next, we design `EVENT → LOCATION → VENUE → VENUE ORGANIZER` in absolute detail and lock their exact relationships before moving to campaigns.**

[1]: https://nextjs.org/docs/app/guides/multi-tenant?utm_source=chatgpt.com "Guides: Multi-tenant | Next.js"
[2]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"
[3]: https://nextjs.org/docs/app/guides/backend-for-frontend?utm_source=chatgpt.com "Guides: Backend for Frontend | Next.js"
[4]: https://nextjs.org/docs/app/getting-started/updating-data?utm_source=chatgpt.com "Getting Started: Updating Data | Next.js"
[5]: https://nextjs.org/docs/15/app/guides/caching?utm_source=chatgpt.com "Guides: Caching | Next.js"

see KULTUR_V1_SIMONE.md next
YES. **Now we should stop adding random features and lock the actual architecture.**

Based on everything we've discussed, I would build **KULTUR Phase 1 as a Modular Monolith using Next.js + Supabase**, and I would simplify the model around **Ganesh Puja only**.

And first, an important correction:

> **A Venue Organizer is not a Location.**
>
> A **Location is a physical place.**
> A **Venue Organizer is an organization/person responsible for an event at that location.**

That distinction is extremely important.

---

# 🕉️ KULTUR PHASE 1 — THE REAL SYSTEM

For now:

> **KULTUR = A Ganesh Puja physical bottle + digital campaign platform.**

We are NOT building sports, concerts, pan-India dynamic UI engines, CRM integrations, etc. yet.

Those can come later.

Our Phase 1 world is:

```text
KULTUR
   │
   ▼
GANESH PUJA EVENT
   │
   ├── LOCATION
   │
   ├── VENUE ORGANIZER
   │
   ├── SPONSORS
   │
   ├── CAMPAIGNS
   │
   └── BOTTLE BATCHES
            │
            ▼
         QR CODE
            │
            ▼
        USER SCANS
            │
            ▼
       GANESH SCREEN
            │
            ▼
           GAME
            │
            ▼
       PHONE / OTP
            │
            ▼
          OFFER
            │
            ▼
       DATA + ANALYTICS
```

---

# 🧠 FIRST: THE BIGGEST ARCHITECTURE DECISION

We should **not start with `campaigns`**.

The real hierarchy should be:

# 🏗️ THE KULTUR HIERARCHY

```text
KULTUR PLATFORM
│
├── USERS
│
├── ORGANIZATIONS
│     │
│     ├── KULTUR
│     ├── VENUE ORGANIZER
│     └── SPONSOR COMPANY
│
├── LOCATIONS
│
├── EVENTS
│
├── CAMPAIGNS
│
├── BATCHES
│
├── QR SCANS
│
├── PARTICIPANTS / LEADS
│
└── REWARDS / OFFERS
```

This is the correct mental model.

---

# 1️⃣ KULTUR USERS, ADMINS & ROLES

This is where we start.

Every human using the system is a:

```text
USER
```

Examples:

```text
Abhishek
Kultur Admin
Volunteer Rahul
DN Homes Manager
Pandal Committee Member
```

All are technically **users**.

But they have different permissions.

---

## `profiles`

```text
profiles
```

```text
id
name
phone
email
role
created_at
```

Example:

| User           | Role            |
| -------------- | --------------- |
| Abhishek       | MASTER_ADMIN    |
| Rahul          | VOLUNTEER       |
| Pandal Member  | VENUE_ORGANIZER |
| Khimji Manager | SPONSOR_MANAGER |

But I would **not permanently hardcode all business logic into one `role` column**.

Because one person might eventually belong to multiple organizations.

So better:

```text
users
     │
     │ belongs to
     ▼
organization_memberships
     │
     ├── organization
     └── role
```

---

# 2️⃣ ORGANIZATIONS

This is the most important missing piece from the old architecture.

We have different business entities.

```text
ORGANIZATION
```

Examples:

```text
Kultur
Saheed Nagar Ganesh Puja Committee
Khimji Jewellers
DN Homes
```

So:

```text
organizations
```

would contain:

```text
id
name
organization_type
created_at
```

---

## Organization Types

For Phase 1:

```text
KULTUR
VENUE_ORGANIZER
SPONSOR
```

Example:

### Kultur

```text
Organization:
Kultur

Type:
KULTUR
```

### Pandal Committee

```text
Organization:
Saheed Nagar Ganesh Puja Committee

Type:
VENUE_ORGANIZER
```

### Sponsor

```text
Organization:
Khimji Jewellers

Type:
SPONSOR
```

---

# 🔗 USERS ↔ ORGANIZATIONS

Now we connect people.

```text
USER
 │
 │
 ▼
ORGANIZATION MEMBERSHIP
 │
 │
 ▼
ORGANIZATION
```

Example:

```text
Rahul
   │
   ▼
Membership
Role: VOLUNTEER
   │
   ▼
KULTUR
```

Another:

```text
Pandal Manager
       │
       ▼
Membership
Role: ORGANIZER_ADMIN
       │
       ▼
Saheed Nagar Committee
```

Another:

```text
Marketing Manager
       │
       ▼
Membership
Role: SPONSOR_ADMIN
       │
       ▼
Khimji Jewellers
```

This gives us a much cleaner multi-tenant architecture.

Supabase RLS is designed for row-level authorization, and access rules can use authenticated identity information to control which rows a user can access. We should use that as part of our tenant isolation. ([Supabase][1])

---

# 3️⃣ LOCATION

Now let's answer your earlier question properly.

## What is a Location?

A location is simply:

> **Where something physically happens.**

For example:

```text
Saheed Nagar
Bhubaneswar
Odisha
India
```

But more specifically:

```text
Saheed Nagar Ganesh Pandal
```

So:

```text
locations
```

could contain:

```text
id
name
address
city
state
country

latitude
longitude

created_at
```

Example:

```text
id: xyz

name:
Saheed Nagar Pandal

city:
Bhubaneswar

latitude:
20.xxxxx

longitude:
85.xxxxx
```

---

# ❗ IMPORTANT

A location is NOT necessarily owned by an event.

Because next year:

```text
Saheed Nagar Pandal
```

may host:

```text
Ganesh Puja 2026
Ganesh Puja 2027
Ganesh Puja 2028
```

Therefore:

```text
LOCATION
       │
       │ hosts
       ▼
EVENT
```

---

# 4️⃣ EVENT

An Event is a specific occurrence.

Example:

```text
Ganesh Puja 2026
```

at:

```text
Saheed Nagar Pandal
```

So:

```text
events
```

```text
id

name

event_type

location_id

organizer_organization_id

starts_at
ends_at

status
```

Example:

```text
Event:
Saheed Nagar Ganesh Puja 2026

Location:
Saheed Nagar Pandal

Organizer:
Saheed Nagar Ganesh Puja Committee
```

---

# 🎯 THIS IS THE RELATIONSHIP

```text
VENUE ORGANIZER
        │
        │ organizes
        ▼
      EVENT
        │
        │ happens at
        ▼
     LOCATION
```

For example:

```text
Saheed Nagar Ganesh Puja Committee
                │
                │
                ▼
     Ganesh Puja 2026 Event
                │
                │
                ▼
        Saheed Nagar
          Pandal
```

# This is the correct model.

---

# 5️⃣ WHAT IS A CAMPAIGN?

Now comes the sponsor.

Let's say:

```text
Khimji Jewellers
```

wants to advertise during:

```text
Saheed Nagar Ganesh Puja 2026
```

That advertising activity is a:

# CAMPAIGN

```text
campaigns
```

Example:

```text
Campaign:

Khimji Ganesh Offer 2026
```

It belongs to:

```text
Sponsor:
Khimji Jewellers

Event:
Saheed Nagar Ganesh Puja 2026
```

---

# CAMPAIGN RELATIONSHIP

```text
SPONSOR
   │
   │ creates/funds
   ▼
CAMPAIGN
   │
   │ runs during
   ▼
EVENT
   │
   │ occurs at
   ▼
LOCATION
```

Example:

```text
Khimji Jewellers
        │
        ▼
Khimji Ganesh Campaign
        │
        ▼
Saheed Nagar Ganesh Puja 2026
        │
        ▼
Saheed Nagar Pandal
```

---

# 💡 VERY IMPORTANT DECISION

## Campaign ≠ Event

This is where many systems get confused.

### Event

```text
Ganesh Puja 2026
```

### Campaign

```text
Khimji Jewellers Ganesh Offer
```

Multiple sponsors could theoretically run campaigns during one event.

```text
                  GANESH PUJA EVENT
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
       CAMPAIGN       CAMPAIGN       CAMPAIGN
        KHIMJI         DN HOMES       BRAND C
```

For Phase 1, we can restrict this if operationally necessary.

But the database should understand the difference.

---

# 6️⃣ BOTTLE BATCH

Now we get to manufacturing.

We do NOT track every bottle individually.

Because you correctly identified the real-world printing problem.

We print:

```text
10,000 bottles
```

with:

```text
THE SAME QR CODE
```

Therefore:

# BATCH IS THE PHYSICAL UNIT OF MANAGEMENT

```text
batches
```

Example:

```text
Batch:

GANESH-KHIMJI-SN-001
```

It belongs to:

```text
Campaign:
Khimji Ganesh Campaign
```

And contains:

```text
quantity: 10,000
```

---

# BATCH STRUCTURE

```text
CAMPAIGN
    │
    │
    ▼
  BATCH
    │
    ├── Quantity
    ├── Production details
    ├── QR URL
    ├── Status
    │
    ▼
PHYSICAL BOTTLES
```

Example:

```text
Campaign
Khimji Ganesh Campaign
        │
        ▼
Batch #001
Quantity: 10,000
        │
        ▼
10,000 bottles
```

---

# 7️⃣ QR CODE

For Phase 1:

```text
ONE BATCH = ONE QR CODE
```

Example:

```text
kultur.live/scan/GANESH-KHIMJI-SN-001
```

Every bottle:

```text
┌──────────────────┐
│                  │
│      QR CODE     │
│                  │
└──────────────────┘
```

opens:

```text
/scan/[batchId]
```

---

# 📱 USER FLOW

Now the public system begins.

```text
USER
 │
 │ scans bottle
 ▼
QR CODE
 │
 ▼
/scan/[batchId]
```

The system resolves:

```text
Batch
  │
  ▼
Campaign
  │
  ▼
Event
  │
  ▼
Location
  │
  ▼
Sponsor
```

So from ONE `batchId`, we can know everything.

---

# 🔥 THE MOST IMPORTANT DATA CHAIN

```text
SCAN URL

/scan/[batchId]

        │
        ▼

BATCH

        │
        ▼

CAMPAIGN

        │
        ├──────────► SPONSOR
        │
        ▼

EVENT

        │
        ├──────────► LOCATION
        │
        └──────────► VENUE ORGANIZER
```

This is the backbone of KULTUR.

---

# 8️⃣ WHAT DOES THE USER SEE?

Since we are focusing **ONLY ON GANESH PUJA**, we don't need:

```text
SPORTS_UI
CONCERT_UI
FOOTBALL_UI
```

Forget them.

Our Phase 1 scan page is:

# 🕉️ GANESH EXPERIENCE

```text
SCAN QR
   │
   ▼
WELCOME SCREEN
   │
   ▼
GANESH PUJA EVENT CONTENT
   │
   ├── Sponsor
   │
   ├── Pandal Information
   │
   ├── Live Announcement
   │
   └── Festival Experience
   │
   ▼
GAME
   │
   ▼
REWARD
```

---

# 9️⃣ THE GAME

For Phase 1:

```text
Catch The Modak
```

That's it.

No dynamic game system yet.

No:

```text
Game A
Game B
Sports Trivia
Football
```

We build one excellent game.

```text
SCAN
  ↓
GANESH SCREEN
  ↓
CATCH THE MODAK
  ↓
WIN
  ↓
CLAIM REWARD
```

---

# 🔟 THE PHONE NUMBER

After winning:

```text
CLAIM REWARD
```

The user enters:

```text
PHONE NUMBER
```

But I would make an important distinction.

We need:

# PARTICIPANT

A person who interacts with the campaign.

Then:

```text
participant
```

may become:

```text
lead
```

depending on consent and campaign rules.

So:

```text
SCAN
   │
   ▼
PARTICIPATION
   │
   ▼
PHONE VERIFICATION
   │
   ▼
REWARD CLAIM
   │
   ▼
LEAD
```

---

# ⚠️ WHY THIS IS IMPORTANT

A scan does NOT mean:

```text
Lead
```

A game play does NOT mean:

```text
Lead
```

Only after the appropriate verification/consent process do we have a meaningful marketing lead.

So don't design:

```text
scan_logs → leads
```

as if they are identical.

They are different things.

---

# 1️⃣1️⃣ PHONE → REWARD

The claim flow should eventually be:

```text
USER
  │
  ▼
ENTER PHONE
  │
  ▼
OTP
  │
  ▼
PHONE VERIFIED
  │
  ▼
CHECK PREVIOUS CLAIM
  │
  ├── Already claimed
  │       │
  │       ▼
  │    Show existing reward
  │
  └── New
          │
          ▼
     CREATE CLAIM
          │
          ▼
   GENERATE VOUCHER
```

---

# 🧠 DATABASE CONSTRAINT

We should enforce:

```text
ONE PHONE
+
ONE CAMPAIGN
=
ONE CLAIM
```

Conceptually:

```text
UNIQUE(campaign_id, phone_identifier)
```

Not merely:

```text
UNIQUE(batch_id, phone)
```

Why?

Imagine:

```text
Campaign A
```

has:

```text
Batch 1
Batch 2
Batch 3
```

A person shouldn't get three rewards simply because they scanned three different batches.

So:

❌ Bad:

```text
UNIQUE(batch_id, phone)
```

Better:

```text
UNIQUE(campaign_id, phone)
```

That is a major architecture improvement.

---

# 1️⃣2️⃣ THE OFFER

The offer belongs to:

# CAMPAIGN

Not necessarily the batch.

Example:

```text
Campaign:
Khimji Ganesh Campaign

Offer:
₹1500 off selected jewellery
```

So:

```text
CAMPAIGN
    │
    ▼
OFFER
```

Potentially:

```text
campaign_offers
```

Later we can support:

```text
Offer A
Offer B
Offer C
```

But Phase 1:

```text
ONE CAMPAIGN → ONE PRIMARY OFFER
```

Keep it simple.

---

# 1️⃣3️⃣ THE VOUCHER

The offer is:

```text
₹1500 OFF
```

The voucher is:

```text
KULTUR-KHIMJI-A7X92P
```

These are NOT the same.

```text
CAMPAIGN
   │
   ▼
OFFER
"₹1500 OFF"
   │
   ▼
REWARD CLAIM
   │
   ▼
VOUCHER CODE
"KULTUR-X92A..."
```

---

# 1️⃣4️⃣ DATA COLLECTION

Now we have several types of data.

We must separate them.

---

## A. Scan Data

```text
scan_events
```

Example:

```text
Batch scanned
Time
Device metadata
Approximate request metadata
```

---

## B. Game Data

```text
game_sessions
```

Example:

```text
Started at
Completed at
Score
Duration
```

---

## C. Verification Data

```text
verification
```

Example:

```text
Phone verified
OTP verified
Verified at
```

---

## D. Claim Data

```text
reward_claims
```

Example:

```text
Campaign
Participant
Voucher
Status
Created at
```

---

# 🔥 THE COMPLETE CUSTOMER DATA FLOW

```text
                 PHYSICAL WORLD
                       │
                       ▼
                 WATER BOTTLE
                       │
                       ▼
                    QR CODE
                       │
                       ▼
                 DIGITAL WORLD
                       │
                       ▼
                  SCAN EVENT
                       │
                       ▼
                GANESH EXPERIENCE
                       │
                       ▼
                  GAME SESSION
                       │
                       ▼
                  GAME COMPLETE
                       │
                       ▼
                  CLAIM REWARD
                       │
                       ▼
                 PHONE + OTP
                       │
                       ▼
                VERIFIED IDENTITY
                       │
                       ▼
                 REWARD CLAIM
                       │
                       ▼
                  VOUCHER
                       │
                       ▼
              ANALYTICS / REPORTING
```

---

# 1️⃣5️⃣ VOLUNTEERS

Now the physical world.

Volunteers should NOT belong directly to campaigns.

They belong to:

```text
KULTUR
```

Then they receive assignments.

```text
VOLUNTEER
    │
    ▼
ASSIGNMENT
    │
    ├── EVENT
    │
    └── BATCH
```

Example:

```text
Rahul
   │
   ▼
Assignment
   │
   ├── Deliver Batch #001
   │
   └── Saheed Nagar Pandal
```

---

# Volunteer Flow

```text
KULTUR ADMIN
      │
      ▼
CREATE BATCH
      │
      ▼
ASSIGN VOLUNTEER
      │
      ▼
VOLUNTEER SEES TASK
      │
      ▼
GOES TO LOCATION
      │
      ▼
CONFIRMS DELIVERY
      │
      ▼
BATCH STATUS CHANGES
```

---

# 1️⃣6️⃣ BATCH STATUS

A batch should have a lifecycle.

```text
PLANNED
   │
   ▼
IN_PRODUCTION
   │
   ▼
PRODUCED
   │
   ▼
ASSIGNED
   │
   ▼
IN_TRANSIT
   │
   ▼
DELIVERED
   │
   ▼
ACTIVE
   │
   ▼
COMPLETED
```

This gives us operational tracking.

---

# 1️⃣7️⃣ VENUE ORGANIZER'S ROLE

Now this becomes very clear.

A Venue Organizer:

```text
DOES NOT OWN THE CAMPAIGN.
```

They primarily manage:

```text
EVENT
```

They can:

```text
Update announcement
Update crowd information
Request resupply
View event metrics
```

Their relationship is:

```text
VENUE ORGANIZER ORGANIZATION
             │
             ▼
           EVENT
```

---

# 1️⃣8️⃣ ADMIN'S ROLE

KULTUR Admin controls the whole ecosystem.

```text
MASTER ADMIN
     │
     ├── Create Organizations
     │
     ├── Create Locations
     │
     ├── Create Events
     │
     ├── Connect Venue Organizers
     │
     ├── Create Sponsor Campaigns
     │
     ├── Create Batches
     │
     ├── Assign Volunteers
     │
     └── View Analytics
```

---

# 🧬 COMPLETE RELATIONSHIP MODEL

Here is the architecture I would lock.

```text
                         ┌─────────────────┐
                         │      USER       │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ ORGANIZATION MEMBERSHIP │
                    └────────────┬────────────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ ORGANIZATION  │
                         └───────┬───────┘
                                 │
          ┌──────────────────────┼───────────────────┐
          │                      │                   │
          ▼                      ▼                   ▼
       KULTUR            VENUE ORGANIZER         SPONSOR


                         VENUE ORGANIZER
                                │
                                ▼
                          ┌───────────┐
                          │   EVENT   │
                          └─────┬─────┘
                                │
                                │ happens at
                                ▼
                           ┌──────────┐
                           │ LOCATION │
                           └──────────┘


SPONSOR
   │
   │ creates/funds
   ▼
┌─────────────┐
│  CAMPAIGN   │
└──────┬──────┘
       │
       │ runs during
       ▼
    EVENT
       │
       ▼
    BATCH
       │
       ▼
  QR CODE
       │
       ▼
     SCAN
       │
       ▼
   GAME
       │
       ▼
PHONE + OTP
       │
       ▼
REWARD CLAIM
       │
       ▼
    VOUCHER
```

# 🟢 THIS IS THE CORE KULTUR ARCHITECTURE.

---

# 1️⃣9️⃣ DATABASE TABLES — PHASE 1

I would initially create:

## Identity

```text
profiles
organizations
organization_memberships
```

## Physical World

```text
locations
events
batches
volunteer_assignments
```

## Commercial

```text
campaigns
offers
```

## Public Experience

```text
scan_events
game_sessions
participants
phone_verifications
reward_claims
```

## Operations

```text
batch_deliveries
event_updates
```

---

# 🏗️ THE MONOLITH

Everything lives inside ONE Next.js application.

```text
┌───────────────────────────────────────┐
│              NEXT.JS                  │
│                                       │
│   Public Scan Experience              │
│   Admin Dashboard                     │
│   Sponsor Dashboard                   │
│   Venue Dashboard                     │
│   Volunteer Portal                    │
│                                       │
│   Server Actions                      │
│   Route Handlers                      │
│   Business Logic                      │
│                                       │
└───────────────────┬───────────────────┘
                    │
                    │
                    ▼
           ┌─────────────────┐
           │    SUPABASE     │
           │                 │
           │ Auth            │
           │ PostgreSQL      │
           │ RLS             │
           │ Realtime        │
           │ Storage         │
           └─────────────────┘
```

This is exactly the kind of situation where I agree with a **modular monolith**.

We do not need microservices.

Not yet.

---

# 📁 HOW I WOULD ORGANIZE THE NEXT.JS APP

```text
app/

├── (public)/
│   │
│   ├── scan/
│   │   └── [batchId]/
│   │       └── page.tsx
│   │
│   └── voucher/
│       └── [claimId]/
│           └── page.tsx
│
├── (auth)/
│   └── login/
│       └── page.tsx
│
├── admin/
│   │
│   ├── page.tsx
│   │
│   ├── organizations/
│   ├── locations/
│   ├── events/
│   ├── campaigns/
│   ├── batches/
│   └── analytics/
│
├── venue/
│   │
│   ├── page.tsx
│   ├── events/
│   └── updates/
│
├── sponsor/
│   │
│   ├── page.tsx
│   ├── campaigns/
│   └── claims/
│
├── volunteer/
│   │
│   ├── page.tsx
│   └── assignments/
│
└── api/
    │
    ├── otp/
    ├── vouchers/
    └── webhooks/
```

---

# 🧩 BUT THE REAL SECRET IS HERE

I would NOT put all business logic inside:

```text
app/
```

Instead:

```text
src/

├── modules/
│
│   ├── identity/
│   │   ├── service.ts
│   │   ├── repository.ts
│   │   └── types.ts
│   │
│   ├── organizations/
│   │
│   ├── locations/
│   │
│   ├── events/
│   │
│   ├── campaigns/
│   │
│   ├── batches/
│   │
│   ├── scans/
│   │
│   ├── games/
│   │
│   ├── rewards/
│   │
│   └── volunteers/
│
├── components/
│
├── lib/
│
└── types/
```

This is what makes it a:

# 🧱 MODULAR MONOLITH

One application.

One repository.

One database.

But internally:

```text
EVENT MODULE
CAMPAIGN MODULE
BATCH MODULE
SCAN MODULE
REWARD MODULE
```

are separated.

---

# 🔐 SECURITY MODEL

For Supabase:

```text
Browser
   │
   ▼
Supabase Auth
   │
   ▼
User Identity
   │
   ▼
Organization Membership
   │
   ▼
Role
   │
   ▼
RLS Policy
```

Example:

```text
Khimji Manager
       │
       ▼
Can only see
       │
       ▼
Khimji campaigns
```

They should NOT see:

```text
DN Homes data
```

Supabase recommends enabling RLS on exposed tables and combining policies with least-privilege grants; privileged service credentials must remain server-side because they can bypass RLS. ([Supabase][1])

---

# ⚡ ABOUT YOUR CACHE IDEA

One correction from the earlier architecture:

I would **not describe `unstable_cache` as simply “server RAM memory.”**

Next.js caching behavior depends on the deployment/runtime model. The safer architecture is:

```text
DATABASE
   │
   ▼
CACHED CAMPAIGN CONFIG
   │
   ▼
SCAN PAGE
```

We can cache campaign/batch configuration and invalidate it when an admin changes relevant data. Next.js supports on-demand invalidation with `revalidatePath` and cache tags. ([Next.js][2])

For example:

```text
Admin changes campaign
          │
          ▼
Database updated
          │
          ▼
Invalidate campaign cache
          │
          ▼
Next scan gets fresh config
```

---

# 🚨 WHAT I WOULD NOT BUILD YET

For Phase 1:

❌ Microservices
❌ Kafka
❌ Complex queues
❌ CRM integrations
❌ Google Ads APIs
❌ Meta APIs
❌ Multiple event types
❌ Sports components
❌ Concert components
❌ Advanced geofencing
❌ 50,000 request optimization claims
❌ Massive dynamic component engine

**We are building Ganesh Puja first.**

---

# 🕉️ KULTUR PHASE 1 MVP

The actual MVP is:

```text
1. ADMIN
   │
   ├── Create Sponsor
   ├── Create Venue Organizer
   ├── Create Location
   ├── Create Ganesh Event
   ├── Create Campaign
   └── Create Bottle Batch


2. VOLUNTEER
   │
   └── Deliver Batch


3. USER
   │
   ├── Scan QR
   ├── View Ganesh Experience
   ├── Play Catch The Modak
   ├── Enter Phone
   └── Claim Reward


4. SPONSOR
   │
   └── View Campaign Results


5. VENUE ORGANIZER
   │
   └── Update Event Announcement
```

# That's it.

---

# 🚀 THE BUILD ORDER I RECOMMEND

We should now build this **entity by entity**.

## STEP 1 — Identity & Roles

```text
profiles
organizations
organization_memberships
```

## STEP 2 — Physical World

```text
locations
events
```

## STEP 3 — Commercial Layer

```text
campaigns
offers
```

## STEP 4 — Production

```text
batches
volunteer_assignments
```

## STEP 5 — Public Experience

```text
/scan/[batchId]
```

## STEP 6 — Game

```text
Catch The Modak
```

## STEP 7 — Conversion

```text
phone
→ OTP
→ participant
→ reward claim
→ voucher
```

## STEP 8 — Dashboards

```text
Admin
Venue
Sponsor
Volunteer
```

---

# 🤝 MY EXPERT VERDICT

**Yes, bhai. We finally have enough detail to make something real.**

But the most important thing is that we have now reduced the chaos into one clean principle:

> **KULTUR coordinates the relationship between PEOPLE, ORGANIZATIONS, PLACES, EVENTS, SPONSOR CAMPAIGNS, PHYSICAL BOTTLE BATCHES, and DIGITAL USER INTERACTIONS.**

The central chain is:

```text
ORGANIZER
     ↓
EVENT
     ↓
LOCATION

SPONSOR
     ↓
CAMPAIGN
     ↓
BATCH
     ↓
QR

USER
     ↓
SCAN
     ↓
GAME
     ↓
VERIFY
     ↓
CLAIM
     ↓
OFFER

ALL DATA
     ↓
KULTUR
```

## **My recommendation: our next step should be Entity #1 in extreme detail:**

# **`USERS → ORGANIZATIONS → MEMBERSHIPS → ROLES`**

We should design the **exact database relationships, every column, role, permission, and RLS strategy** before moving to Locations.

That is the foundation. ([Next.js][3])

[1]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"
[2]: https://nextjs.org/docs/app/api-reference/functions/revalidatePath?utm_source=chatgpt.com "Functions: revalidatePath | Next.js"
[3]: https://nextjs.org/docs/app/guides/multi-tenant?utm_source=chatgpt.com "Guides: Multi-tenant | Next.js"

see KULTUR_V1_SIMSEVEN.md next
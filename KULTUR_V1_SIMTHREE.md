YES. We have enough detail now. And since our last messages were essentially **“yeah, do it”** step-by-step, I’m going to continue the architecture properly.

# KULTUR — FULL MONOLITH ARCHITECTURE

## Phase 1: **Ganesh Puja Only**

First, one critical correction:

> **We should NOT build this as a generic “AdTech empire” in the database from day one.**

That would create unnecessary complexity.

For now:

# 🪔 KULTUR = GANESH PUJA CAMPAIGN OPERATING SYSTEM

We build a **clean monolithic Next.js + Supabase application** specifically for this flow:

```text
KULTUR ADMIN
      ↓
Creates Sponsor Company
      ↓
Creates Ganesh Puja Campaign
      ↓
Creates Event
      ↓
Adds Pandal Locations
      ↓
Assigns Venue Organisers
      ↓
Creates Production Batches
      ↓
Assigns Volunteers
      ↓
Generates QR for Batch
      ↓
Bottle Production
      ↓
Volunteer Distribution
      ↓
Public Scans QR
      ↓
Ganesh Puja Digital Experience
      ↓
Game
      ↓
Offer Claim
      ↓
Phone Verification
      ↓
Lead + Voucher
      ↓
Data & Analytics
```

That is our system.

---

# 1. THE MOST IMPORTANT QUESTION:

# Venue Organiser = Location? Event? Campaign?

## Answer: NONE.

A **Venue Organiser is a USER/ORGANIZATION ROLE**.

We need to separate these concepts.

---

# 🧠 THE REAL-WORLD MODEL

Imagine:

### Sponsor

**Khimji Jewellers**

They want to advertise.

↓

### Campaign

**Khimji Jewellers Ganesh Puja 2026**

This is their marketing campaign.

↓

### Event

**Ganesh Puja 2026**

This is the cultural event.

↓

### Locations / Venues

* Saheed Nagar Pandal
* Rasulgarh Pandal
* Chandrasekharpur Pandal

These are physical locations.

↓

### Venue Organisers

The committees/people managing those venues.

For example:

```text
Saheed Nagar Pandal Committee
```

They manage:

```text
Saheed Nagar Pandal
```

---

# THE CORRECT RELATIONSHIP

```text
ORGANIZATION
│
├── KULTUR
│
├── SPONSOR COMPANY
│      │
│      └── CAMPAIGN
│
└── VENUE ORGANIZER
       │
       └── EVENT
             │
             └── VENUE / LOCATION
```

But for our Phase 1, we can make this simpler.

---

# 2. OUR CORE ENTITY HIERARCHY

This is what I would build as the system architect.

```text
KULTUR
│
├── USERS
│
├── COMPANIES
│     │
│     └── SPONSOR COMPANIES
│
├── EVENTS
│     │
│     └── GANESH PUJA 2026
│
├── VENUES
│     │
│     ├── Saheed Nagar Pandal
│     ├── Rasulgarh Pandal
│     └── etc.
│
├── CAMPAIGNS
│
├── CAMPAIGN VENUES
│
├── PRODUCTION BATCHES
│
├── VOLUNTEER ASSIGNMENTS
│
├── QR SCANS
│
├── LEADS
│
├── VOUCHERS
│
└── ANALYTICS
```

Now let's understand **why every one exists**.

---

# 3. ENTITY #1 — USERS & ROLES

Every person who logs into the system is a User.

```text
users
```

Example:

| User            | Role            |
| --------------- | --------------- |
| Abhishek        | Master Admin    |
| Rohan           | Volunteer       |
| Pandal Manager  | Venue Organizer |
| Khimji Employee | Sponsor Staff   |

We use Supabase Auth for identity.

```text
auth.users
```

Then our own profile:

```text
profiles
```

Example:

```text
profiles
──────────────────────────

id
full_name
phone
role
created_at
```

Roles:

```text
MASTER_ADMIN
SPONSOR_ADMIN
VENUE_ORGANIZER
VOLUNTEER
```

For Phase 1, **do not create 20 roles**.

Only these four.

Supabase's RLS model is suitable for enforcing row-level access, but policies and grants must be designed explicitly; service-level credentials must remain server-side. ([Supabase][1])

---

# 4. ENTITY #2 — SPONSOR COMPANIES

A sponsor is not a user.

This distinction is extremely important.

Example:

```text
Khimji Jewellers
```

is a **Company**.

But:

```text
Mr. Rahul
Marketing Manager
```

is a **User**.

Therefore:

```text
companies
```

```text
companies
──────────────────────

id
name
logo_url
industry
contact_email
contact_phone

created_at
```

Example:

```text
ID: company_001

Name:
Khimji Jewellers
```

---

# Relationship

```text
COMPANY
   │
   │ has employees
   ↓
USERS
```

Potentially:

```text
company_members
```

```text
company_id
user_id
role
```

But we can decide later whether Phase 1 needs multiple sponsor users.

---

# 5. ENTITY #3 — EVENTS

This is where Ganesh Puja lives.

```text
events
```

Example:

```text
Ganesh Puja 2026
```

Schema:

```text
events
──────────────────────

id

name

type

city

start_date

end_date

status

created_at
```

Example:

```text
id:
ganesh-puja-2026

name:
Ganesh Puja 2026

type:
FESTIVAL

city:
Bhubaneswar
```

---

# WHY EVENT EXISTS?

Because later you might have:

```text
Ganesh Puja 2026
```

Then:

```text
Durga Puja 2026
```

Then:

```text
Kalinga Sports Tournament
```

But we don't build those experiences now.

We simply make the architecture capable of holding them.

For now:

# ONLY ONE EVENT TYPE MATTERS

```text
FESTIVAL
```

And:

```text
Ganesh Puja
```

---

# 6. ENTITY #4 — VENUES / LOCATIONS

Now comes the physical world.

A venue is:

```text
Saheed Nagar Ganesh Pandal
```

A venue belongs to an event.

```text
EVENT
   │
   ├──── VENUE
   │
   ├──── VENUE
   │
   └──── VENUE
```

Example:

```text
Ganesh Puja 2026
│
├── Saheed Nagar
│
├── Rasulgarh
│
└── Chandrasekharpur
```

Database:

```text
venues
────────────────────────────

id

event_id

name

address

latitude

longitude

radius_meters

status

created_at
```

Example:

```text
Venue:
Saheed Nagar Pandal

Latitude:
20.xxxx

Longitude:
85.xxxx

Radius:
300 meters
```

---

# Why `radius_meters`?

Because volunteers will eventually verify delivery.

```text
VOLUNTEER
     │
     │ GPS
     ↓
IS VOLUNTEER INSIDE VENUE?
     │
     ├── YES → Allow delivery
     │
     └── NO → Block delivery
```

But remember:

# GEO-FENCING IS NOT PHASE 1 PRIORITY.

We design the database for it.

We don't overbuild it immediately.

---

# 7. WHERE DOES THE VENUE ORGANIZER FIT?

Now the answer becomes clear.

```text
VENUE ORGANIZER
        │
        │ manages
        ↓
VENUE
```

Example:

```text
Saheed Nagar Pandal Committee
        │
        ↓
Saheed Nagar Pandal
```

We should have:

```text
venue_members
```

```text
venue_id

user_id

role
```

Example:

```text
venue_id:
Saheed Nagar

user_id:
Ramesh

role:
ORGANIZER
```

Therefore:

# VENUE ORGANIZER DOES NOT BELONG DIRECTLY TO CAMPAIGN.

They belong to a:

```text
VENUE
```

or potentially multiple venues.

---

# 8. ENTITY #5 — CAMPAIGN

This is the heart of the commercial system.

A campaign answers:

> Who is advertising?
> What are they offering?
> During which event?
> Where is it running?

Example:

```text
Khimji Ganesh Puja Campaign 2026
```

Database:

```text
campaigns
────────────────────────────

id

company_id

event_id

name

status

start_date

end_date

reward_title

reward_description

terms

created_at
```

Relationship:

```text
COMPANY
    │
    │ creates
    ↓
CAMPAIGN
    │
    │ runs during
    ↓
EVENT
```

Example:

```text
Khimji Jewellers
        │
        ↓
Khimji Ganesh Offer
        │
        ↓
Ganesh Puja 2026
```

---

# 9. CAMPAIGN ↔ VENUE

This is where things become interesting.

A campaign might operate at:

```text
Saheed Nagar
Rasulgarh
Chandrasekharpur
```

Therefore:

```text
CAMPAIGN
   │
   ├──── Venue A
   │
   ├──── Venue B
   │
   └──── Venue C
```

We need a junction table:

```text
campaign_venues
```

```text
campaign_id

venue_id

status
```

Why?

Because this is a:

# MANY-TO-MANY RELATIONSHIP

One campaign:

```text
Khimji
```

can run in many venues.

One venue:

```text
Saheed Nagar
```

could theoretically have multiple campaigns.

For example:

```text
Saheed Nagar Pandal
│
├── Khimji Campaign
│
└── DN Homes Campaign
```

Maybe we don't use multiple sponsors initially.

But the database shouldn't prevent it.

---

# THE RELATIONSHIP

```text
COMPANY
   │
   ▼
CAMPAIGN
   │
   ▼
CAMPAIGN_VENUES
   │
   ├──── VENUE
   │
   ├──── VENUE
   │
   └──── VENUE
```

---

# 10. ENTITY #6 — PRODUCTION BATCH

Now we enter the physical bottle world.

This is extremely important.

A campaign is NOT a production batch.

Example:

```text
Campaign:
Khimji Ganesh Puja 2026
```

But bottles need production.

So:

```text
Batch 001
Batch 002
Batch 003
```

Each batch may contain:

```text
5,000 bottles
```

---

# RELATIONSHIP

```text
CAMPAIGN
    │
    ├── Batch 001
    │
    ├── Batch 002
    │
    └── Batch 003
```

Database:

```text
production_batches
──────────────────────────────

id

campaign_id

batch_code

quantity

status

qr_slug

produced_at

activated_at

created_at
```

Example:

```text
Batch:

KHI-GANESH-001

Quantity:

5000
```

---

# 11. THE QR CODE RELATIONSHIP

Since we decided:

> ALL BOTTLES IN ONE PRINT BATCH CAN HAVE THE SAME QR.

This is good.

Therefore:

```text
PRODUCTION BATCH
        │
        │
        ↓
ONE QR URL
```

Example:

```text
Batch:
KHI-GANESH-001
```

QR:

```text
kultur.live/scan/khi-ganesh-001
```

5,000 bottles:

```text
┌──────────┐
│ BOTTLE 1 │ → Same QR
└──────────┘

┌──────────┐
│ BOTTLE 2 │ → Same QR
└──────────┘

┌──────────┐
│ BOTTLE 3 │ → Same QR
└──────────┘

          ...

┌──────────────┐
│ BOTTLE 5000  │ → Same QR
└──────────────┘
```

The physical QR identifies:

# THE BATCH

Not the individual bottle.

---

# THIS IS THE BIG ARCHITECTURAL CHANGE

Old idea:

```text
Bottle → Unique QR
```

New idea:

```text
Bottle
   ↓
Batch QR
   ↓
Phone verification
   ↓
Unique digital identity
   ↓
Unique voucher
```

This is MUCH cheaper operationally.

---

# 12. ENTITY #7 — BATCH DISTRIBUTION

A batch doesn't magically appear at a venue.

We need to track:

```text
Production
      ↓
Storage
      ↓
Volunteer
      ↓
Venue
      ↓
Distribution
```

So:

```text
batch_allocations
```

```text
id

batch_id

venue_id

quantity_allocated

quantity_delivered

status

delivered_by

delivered_at
```

Example:

```text
Batch:
KHI-GANESH-001

Venue:
Saheed Nagar

Allocated:
2000 bottles
```

Another:

```text
Batch:
KHI-GANESH-001

Venue:
Rasulgarh

Allocated:
3000 bottles
```

This means:

# ONE PRODUCTION BATCH CAN BE SPLIT ACROSS VENUES.

---

# 13. VOLUNTEERS

A volunteer is simply:

```text
USER
```

with:

```text
role = VOLUNTEER
```

But volunteers need assignments.

```text
volunteer_assignments
```

```text
volunteer_id

venue_id

batch_allocation_id

assigned_at

status
```

Example:

```text
Volunteer:
Rahul

Task:
Deliver Batch 001

Venue:
Saheed Nagar
```

---

# VOLUNTEER FLOW

```text
ADMIN
  │
  │ assigns
  ▼
VOLUNTEER
  │
  │ receives task
  ▼
BATCH ALLOCATION
  │
  ▼
VENUE
  │
  ▼
CONFIRM DELIVERY
```

---

# 14. NOW THE CUSTOMER SCAN FLOW

This is the public side.

```text
CUSTOMER
   │
   │ scans QR
   ▼
/scan/[batchSlug]
```

Example:

```text
/scan/khi-ganesh-001
```

The server does:

```text
1. Find Batch
```

↓

```text
2. Find Campaign
```

↓

```text
3. Find Sponsor
```

↓

```text
4. Find Event
```

↓

```text
5. Load Ganesh Experience
```

Then:

```text
CUSTOMER SEES:

🪔 Ganesh Puja UI

🏢 Sponsor

🎮 Game

🎁 Offer
```

---

# 15. THE SCAN PAGE

For Phase 1:

```text
app
 └── scan
      └── [batchSlug]
           └── page.tsx
```

The URL:

```text
kultur.live/scan/khi-ganesh-001
```

The page should NOT contain hardcoded:

```text
Khimji
Saheed Nagar
Ganesh Offer
```

Instead:

```text
Batch
   ↓
Campaign
   ↓
Configuration
   ↓
UI
```

---

# 16. THE GANESH EXPERIENCE

Since we are ONLY focusing on Ganesh Puja:

We don't need this nonsense yet:

```text
SPORTS MODE
CONCERT MODE
FOOTBALL MODE
```

No.

For now:

```text
GANESH PUJA EXPERIENCE
```

Structure:

```text
Scan Page

├── Kultur Header
│
├── Ganesh Puja Event
│
├── Sponsor Area
│
├── Venue Information
│
├── Interactive Game
│
├── Offer
│
└── Claim Reward
```

---

# 17. THE GAME

For Phase 1:

```text
ONE GAME.
```

Not 10 games.

Example:

# Catch The Modak

```text
User scans
      ↓
Experience loads
      ↓
Clicks Play
      ↓
30-second game
      ↓
Game complete
      ↓
Unlock reward
```

The game does not need to be a complicated database entity initially.

We can have:

```text
game_type
```

inside campaign configuration.

```text
CATCH_MODAK
```

Later:

```text
TRIVIA
SPIN_WHEEL
```

But Phase 1:

```text
CATCH_MODAK
```

ONLY.

---

# 18. SCAN LOGGING

Every scan creates an event.

```text
scan_logs
```

Example:

```text
scan_logs

id

batch_id

campaign_id

scanned_at

device_info

ip_hash
```

Important:

I would **not casually store raw IP addresses forever**.

Better:

```text
IP → Hash
```

or collect only what we actually need.

---

# Scan flow

```text
QR
 ↓
Scan Page
 ↓
Record Scan
 ↓
Render UI
```

Eventually:

```text
Queue
 ↓
Database
```

But Phase 1?

# DON'T PREMATURELY BUILD THE QUEUE.

This is important.

---

# 🚨 MY EXPERT OPINION ABOUT THE PREVIOUS ARCHITECTURE

The previous design had things like:

```text
50,000 requests per second
```

```text
Zero DB Reads
```

```text
In-memory queue
```

```text
500 record batch workers
```

Honestly?

# WE DON'T NEED TO BUILD THAT FIRST.

It is premature optimization.

Next.js caching and Supabase/Postgres can be designed efficiently, but the actual architecture should be based on measured load rather than assumed “50k simultaneous scans.” Supabase itself is a full Postgres database with indexing, functions, triggers and other database capabilities available when needed. ([Supabase][2])

For Ganesh Puja Phase 1:

```text
Next.js
+
Supabase
+
Proper indexes
+
Caching
```

is enough.

Then:

```text
LOAD TEST
```

Then:

```text
QUEUE
```

if necessary.

---

# 19. THE MOST IMPORTANT PART:

# CUSTOMER IDENTITY

The QR identifies:

```text
BATCH
```

The phone identifies:

```text
PERSON
```

This is our security model.

```text
QR
│
▼
BATCH IDENTITY


PHONE
│
▼
CUSTOMER IDENTITY
```

---

# 20. CUSTOMER CLAIM FLOW

```text
GAME COMPLETE
      │
      ▼
CLAIM OFFER
      │
      ▼
PHONE NUMBER
      │
      ▼
OTP
      │
      ▼
PHONE VERIFIED
      │
      ▼
CHECK EXISTING CLAIM
      │
      ├── Already claimed
      │       │
      │       ▼
      │    Show existing voucher
      │
      └── New
              │
              ▼
         Create Lead
              │
              ▼
         Generate Voucher
```

---

# 21. LEAD ≠ VOUCHER

This is another important database decision.

Previously, we combined:

```text
Lead
+
Voucher
```

into one table.

I would separate them.

---

# LEADS

```text
leads
```

Represents:

> A person who gave us verified information.

```text
leads

id

campaign_id

phone_e164

phone_hash

otp_verified_at

created_at
```

---

# VOUCHERS

```text
vouchers
```

Represents:

> A reward issued to that lead.

```text
vouchers

id

lead_id

campaign_id

code

status

issued_at

expires_at

redeemed_at
```

---

# WHY SEPARATE?

Imagine later:

```text
Same customer
```

gets:

```text
Offer A
```

Then:

```text
Offer B
```

Or:

```text
Voucher expires
```

Or:

```text
Voucher reissued
```

If we put everything into `leads`, it becomes messy.

Correct model:

```text
LEAD
  │
  └──── VOUCHER
```

---

# 22. PHONE NUMBER SECURITY

We need two things.

### Operational identity

Sometimes we need the phone number.

For:

```text
OTP
Voucher verification
Customer support
```

### Analytics identity

We also want:

```text
Hash
```

Example:

```text
+919876543210
```

↓

```text
SHA-256
```

But:

# HASHING IS NOT A MAGIC SECURITY SOLUTION.

If we need to operate on the phone number, we may need the actual protected value under proper access controls.

Therefore:

```text
phone_e164
```

Sensitive.

And:

```text
phone_hash
```

For matching/analytics.

We must also think carefully about consent, retention, access, and applicable privacy law before treating phone numbers as an advertising asset.

---

# 23. VOUCHER GENERATION

When OTP succeeds:

```text
generateVoucher()
```

Example:

```text
KULTUR-KHJ-A8F4X2
```

Database:

```text
UNIQUE(code)
```

Then:

```text
status = ISSUED
```

States:

```text
ISSUED

REDEEMED

EXPIRED

CANCELLED
```

---

# 24. VOUCHER REDEMPTION

For Phase 1:

# DON'T BUILD THREE SYSTEMS IMMEDIATELY.

Start with:

## Partner Dashboard

```text
Sponsor Staff
     │
     │ login
     ▼
Search Voucher
     │
     ▼
VALID?
     │
     ├── YES
     │     │
     │     ▼
     │ Mark Redeemed
     │
     └── NO
```

This is enough.

Later:

```text
API
```

Then:

```text
Webhook
```

Then:

```text
CRM integration
```

---

# 25. DATA COLLECTION

Now the interesting business side.

What do we actually collect?

We should distinguish:

# A. Scan Data

```text
Scan happened

Batch

Campaign

Timestamp

Approximate device information
```

---

# B. Engagement Data

```text
Game started

Game completed

Score

Time spent
```

---

# C. Lead Data

```text
Phone

Verified

Consent

Timestamp
```

---

# D. Voucher Data

```text
Voucher issued

Voucher viewed

Voucher redeemed
```

---

# THE FUNNEL

```text
SCANS
  ↓
PAGE OPENED
  ↓
GAME STARTED
  ↓
GAME COMPLETED
  ↓
CLAIM CLICKED
  ↓
PHONE ENTERED
  ↓
OTP VERIFIED
  ↓
VOUCHER ISSUED
  ↓
VOUCHER REDEEMED
```

THIS is extremely valuable.

---

# 26. ANALYTICS SHOULD BE EVENT-BASED

Instead of creating:

```text
scan_count
game_count
claim_count
```

all over the database...

We should track events.

```text
engagement_events
```

Example:

```text
SCAN_OPENED

GAME_STARTED

GAME_COMPLETED

CLAIM_STARTED

OTP_VERIFIED

VOUCHER_ISSUED

VOUCHER_REDEEMED
```

Schema:

```text
engagement_events

id

event_name

campaign_id

batch_id

lead_id

metadata

created_at
```

Then dashboards calculate:

```text
COUNT(SCAN_OPENED)
```

↓

```text
Total scans
```

---

# 27. COMPLETE DATA RELATIONSHIP

Now look at the entire system.

```text
                         USERS
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   MASTER ADMIN       VOLUNTEER        VENUE ORGANIZER


                         COMPANY
                           │
                           │
                           ▼
                        CAMPAIGN
                           │
                           ├──────────────┐
                           │              │
                           ▼              ▼
                         EVENT       PRODUCTION
                           │           BATCHES
                           │              │
                           ▼              │
                         VENUES           │
                           │              │
                           └──────┬───────┘
                                  │
                                  ▼
                           BATCH ALLOCATION
                                  │
                                  ▼
                              VOLUNTEER
                              DELIVERY
```

Then public side:

```text
PRODUCTION BATCH
       │
       ▼
       QR
       │
       ▼
CUSTOMER SCAN
       │
       ▼
GANESH EXPERIENCE
       │
       ▼
     GAME
       │
       ▼
 PHONE + OTP
       │
       ▼
      LEAD
       │
       ▼
    VOUCHER
       │
       ▼
   REDEMPTION
```

---

# 28. THE FINAL DATABASE

For Phase 1, I would have:

```text
01. profiles

02. companies

03. company_members

04. events

05. venues

06. venue_members

07. campaigns

08. campaign_venues

09. production_batches

10. batch_allocations

11. volunteer_assignments

12. scan_logs

13. engagement_events

14. leads

15. vouchers
```

That's it.

Not 50 tables.

---

# 29. THE MONOLITH

Our application:

```text
┌───────────────────────────────────────────────┐
│                                               │
│               NEXT.JS MONOLITH                │
│                                               │
│                                               │
│  PUBLIC SCAN                                 │
│                                               │
│  ADMIN                                       │
│                                               │
│  VENUE                                       │
│                                               │
│  VOLUNTEER                                   │
│                                               │
│  SPONSOR                                     │
│                                               │
│  API                                         │
│                                               │
└───────────────────┬───────────────────────────┘
                    │
                    │
                    ▼
          ┌───────────────────┐
          │     SUPABASE      │
          │                   │
          │ Auth              │
          │ PostgreSQL        │
          │ RLS               │
          │ Storage           │
          │ Realtime          │
          └───────────────────┘
```

This is a proper monolith.

---

# 30. NEXT.JS FOLDER ARCHITECTURE

I would structure it like this:

```text
app/

├── (public)/
│
│   └── scan/
│       └── [batchSlug]/
│           └── page.tsx
│
│
├── (auth)/
│
│   ├── login/
│   │   └── page.tsx
│   │
│   └── verify/
│       └── page.tsx
│
│
├── admin/
│
│   ├── dashboard/
│   │
│   ├── companies/
│   │
│   ├── events/
│   │
│   ├── venues/
│   │
│   ├── campaigns/
│   │
│   ├── batches/
│   │
│   ├── volunteers/
│   │
│   └── analytics/
│
│
├── venue/
│
│   ├── dashboard/
│   │
│   └── announcements/
│
│
├── volunteer/
│
│   ├── dashboard/
│   │
│   └── deliveries/
│
│
├── sponsor/
│
│   ├── dashboard/
│   │
│   ├── campaigns/
│   │
│   ├── vouchers/
│   │
│   └── analytics/
│
│
├── api/
│
│   ├── otp/
│   │
│   ├── vouchers/
│   │
│   └── webhooks/
│
│
├── actions/
│
│   ├── campaigns/
│   │
│   ├── batches/
│   │
│   ├── venues/
│   │
│   ├── claims/
│   │
│   └── vouchers/
│
│
├── layout.tsx
│
└── page.tsx
```

---

# 31. COMPONENT ARCHITECTURE

```text
components/

├── ui/
│
├── admin/
│
├── venue/
│
├── volunteer/
│
├── sponsor/
│
└── scan/
```

The scan experience:

```text
components/scan/

├── ScanExperience.tsx

├── GaneshHero.tsx

├── SponsorCard.tsx

├── VenueInfo.tsx

├── CatchModakGame.tsx

├── ClaimRewardDrawer.tsx

├── PhoneVerification.tsx

└── VoucherTicket.tsx
```

---

# 32. THE SERVER / CLIENT BOUNDARY

This is VERY important.

```text
SERVER

Fetches:

Batch
Campaign
Sponsor
Event

        ↓

CLIENT

Handles:

Animations
Game
Interactions
Drawer
Phone input
```

So:

```text
page.tsx
```

is mostly:

# SERVER

Then:

```text
ScanExperience.tsx
```

can be:

# CLIENT

---

# FLOW

```text
SERVER

Fetch campaign data

        │
        ▼

CLIENT COMPONENT

Interactive UI

        │
        ▼

GAME

        │
        ▼

SERVER ACTION

Claim reward

        │
        ▼

SUPABASE
```

This is clean.

---

# 33. SUPABASE SECURITY

We should use:

```text
Supabase Auth
+
Profiles
+
RLS
```

Not fake cookies.

The architecture:

```text
Supabase Auth
        │
        ▼
auth.uid()
        │
        ▼
profiles
        │
        ▼
ROLE
        │
        ▼
RLS POLICY
```

Example:

```text
User

ID:
123
```

↓

```text
Profile

role:
VOLUNTEER
```

↓

RLS:

```text
Can this user access this batch?
```

↓

```text
YES / NO
```

Supabase recommends explicit grants plus RLS policies, with least-privilege access; service-role credentials bypass RLS and must never be exposed to the browser. ([Supabase][1])

---

# 34. OUR PHASE 1 MVP

This is where I would be VERY strict.

We build:

## MASTER ADMIN

Can:

```text
Create Sponsor

Create Event

Create Venue

Create Campaign

Connect Campaign → Venue

Create Batch

Generate QR

Assign Volunteer
```

---

## VOLUNTEER

Can:

```text
View assignments

See:

Venue

Batch

Quantity

Status

Confirm delivery
```

---

## CUSTOMER

Can:

```text
Scan QR

View Ganesh Experience

Play Catch Modak

Claim Offer

Verify phone

Receive voucher
```

---

## SPONSOR

Can:

```text
View campaign

View scans

View leads

View vouchers

Verify voucher

Mark redeemed
```

---

# 35. WHAT WE DO NOT BUILD YET

❌ Complex CRM APIs

❌ Google Ads integration

❌ Meta integration

❌ Webhooks

❌ Redis

❌ QStash

❌ Complex distributed queues

❌ 50 different games

❌ Sports mode

❌ Concert mode

❌ AI

❌ Massive realtime architecture

❌ Advanced geofencing

❌ Microservices

---

# WHY?

Because:

# WE NEED A REAL WORKING GANESH PUJA LOOP FIRST.

---

# 36. THE ACTUAL BUSINESS LOOP

Our MVP should successfully execute this:

```text
1️⃣ Abhishek creates Khimji
        ↓

2️⃣ Creates Ganesh Puja 2026
        ↓

3️⃣ Adds Saheed Nagar Pandal
        ↓

4️⃣ Creates Khimji Campaign
        ↓

5️⃣ Connects campaign to venue
        ↓

6️⃣ Creates 5,000 bottle batch
        ↓

7️⃣ Generates QR
        ↓

8️⃣ Prints bottles
        ↓

9️⃣ Volunteer delivers bottles
        ↓

🔟 Customer scans QR
        ↓

1️⃣1️⃣ Plays Catch Modak
        ↓

1️⃣2️⃣ Enters phone
        ↓

1️⃣3️⃣ OTP verified
        ↓

1️⃣4️⃣ Lead created
        ↓

1️⃣5️⃣ Voucher generated
        ↓

1️⃣6️⃣ Sponsor sees lead
        ↓

1️⃣7️⃣ Customer visits sponsor
        ↓

1️⃣8️⃣ Sponsor redeems voucher
```

# If this works, KULTUR EXISTS.

Everything else is expansion.

---

# MY FINAL EXPERT ARCHITECTURE DECISION

I would lock this hierarchy:

```text
COMPANY
   │
   ▼
CAMPAIGN
   │
   ├──────── EVENT
   │
   ├──────── CAMPAIGN VENUES
   │              │
   │              ▼
   │            VENUE
   │
   └──────── PRODUCTION BATCH
                    │
                    ▼
                  QR
                    │
                    ▼
                 SCANS
                    │
                    ▼
                 LEADS
                    │
                    ▼
                VOUCHERS
```

And separately:

```text
USERS
 │
 ├── MASTER ADMIN
 │
 ├── SPONSOR ADMIN
 │
 ├── VENUE ORGANIZER
 │       │
 │       └── VENUE
 │
 └── VOLUNTEER
         │
         └── BATCH ASSIGNMENT
```

---

# 🔥 WHAT I THINK WE SHOULD DO NEXT

We have reached the point where **talking abstractly should stop**.

The next thing should be:

# ENTITY #3: EVENTS → VENUES → VENUE ORGANISERS

But we should do it at the **database design level**.

I suggest we go entity-by-entity and for each one define:

1. **What does it represent in real life?**
2. **Why does it exist?**
3. **What fields does it need?**
4. **What relationships does it have?**
5. **Who can access it?**
6. **What RLS rules apply?**
7. **What happens when it is created/updated/deleted?**
8. **What UI manages it?**

Then, after all entities are locked:

# We create the complete ER diagram → SQL schema → Next.js folder structure → actual code.

**My recommendation: next we deeply design `EVENTS`, `VENUES`, and `VENUE ORGANISERS` together, because that is where the physical Ganesh Puja world enters our software.**

[1]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"
[2]: https://supabase.com/docs/guides/database/overview?utm_source=chatgpt.com "Database | Supabase Docs"

see KULTUR_V1_SIMFOUR.md next
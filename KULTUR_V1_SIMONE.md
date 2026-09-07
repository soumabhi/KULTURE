# YES. Now we stop collecting random features and **lock the actual KULTUR architecture.**

I have gone through everything we've discussed. And since you said **“yeah do it”**, I’m continuing the architecture sequence.

We are building:

> **KULTUR — a modular monolith built with Next.js + Supabase, initially designed ONLY for Ganesh Puja.**

Not sports.
Not concerts.
Not multiple UI modes.

Those can come later.

---

# 🧠 First: What exactly are we building?

Think of KULTUR as this:

```text
                         KULTUR PLATFORM
                               │
                               ▼
                     MASTER ADMIN CREATES
                         A COMPANY
                               │
                               ▼
                     COMPANY GETS A CAMPAIGN
                               │
                               ▼
                     CAMPAIGN RUNS AT
                       A GANESH EVENT
                               │
                               ▼
                       EVENT HAS VENUES
                       / LOCATIONS
                               │
                               ▼
                    BOTTLE BATCHES ASSIGNED
                       TO THOSE LOCATIONS
                               │
                               ▼
                      VOLUNTEERS DELIVER
                          THE BATCHES
                               │
                               ▼
                       PEOPLE SEE / GET
                         THE BOTTLES
                               │
                               ▼
                            QR SCAN
                               │
                               ▼
                     GANESH PUJA EXPERIENCE
                               │
                               ▼
                         PLAY EXPERIENCE
                               │
                               ▼
                        CLAIM AN OFFER
                               │
                               ▼
                         PHONE + OTP
                               │
                               ▼
                       VERIFIED LEAD
                               │
                               ▼
                     VOUCHER / OFFER DATA
                               │
                               ▼
                    ADVERTISER SEES RESULTS
```

---

# 🚨 MOST IMPORTANT ARCHITECTURAL DECISION

## Venue Organizer is NOT a Location.

And a Venue Organizer is also NOT the Event.

These are **three different entities**.

Let's make this extremely clear.

---

# 🏛️ EVENT

An **Event** is the real-world occasion.

Example:

```text
Ganesh Puja 2026
```

or:

```text
Saheed Nagar Ganesh Puja 2026
```

An event has:

* Name
* Start date
* End date
* Description
* Status

---

# 📍 LOCATION / VENUE

A location is the **physical place** where something happens.

Example:

```text
Saheed Nagar Pandal
```

It can contain:

```text
Name
Address
Latitude
Longitude
Geo-fence radius
```

---

# 👨‍💼 VENUE ORGANIZER

This is the **person or organization responsible for the venue/event**.

Example:

```text
Saheed Nagar Ganesh Puja Committee
```

or:

```text
Mr. XYZ
Event Coordinator
```

They are USERS.

They can log into KULTUR.

---

# 🔥 The correct relationship

```text
VENUE ORGANIZATION
        │
        │ manages
        ▼
      VENUE
        │
        │ hosts
        ▼
      EVENT
        │
        │ has
        ▼
   CAMPAIGN ACTIVATION
```

But for our first version, I recommend something even cleaner.

---

# 🏗️ OUR KULTUR DOMAIN MODEL

We should build the system around these major entities:

```text
1. USERS
2. ORGANIZATIONS
3. COMPANIES
4. EVENTS
5. VENUES
6. CAMPAIGNS
7. ACTIVATIONS
8. BATCHES
9. VOLUNTEER ASSIGNMENTS
10. SCANS
11. CLAIMS / LEADS
12. OFFERS
13. VOUCHERS
```

This is the real backbone.

---

# 🧩 ENTITY #1 — USERS & ROLES

Every human being who logs into KULTUR is a user.

```text
USERS
```

Examples:

```text
Abhishek → Master Admin

Khimji Employee → Advertiser

Pandal Committee Member → Venue Organizer

KULTUR Crew Member → Volunteer
```

So:

```text
USER
 │
 ├── MASTER_ADMIN
 │
 ├── KULTUR_ADMIN
 │
 ├── ADVERTISER
 │
 ├── VENUE_ORGANIZER
 │
 └── VOLUNTEER
```

Supabase Auth should manage identity, while your application database stores the business profile and role information. Supabase/Postgres relationships and RLS are well suited to this kind of relational structure. ([Supabase][1])

---

# 🏢 ENTITY #2 — ORGANIZATIONS

This is something we need that our earlier architecture was missing.

Not every user belongs directly to KULTUR.

Users belong to organizations.

For example:

```text
KULTUR
│
├── Abhishek
├── KULTUR Admin
└── Volunteers


Khimji Jewellers
│
├── Marketing Manager
├── Campaign Manager
└── Sales Manager


Saheed Nagar Ganesh Committee
│
├── President
├── Event Manager
└── Coordinator
```

Therefore:

```text
ORGANIZATION
```

Example database concept:

```text
organizations

id
name
type
created_at
```

Types:

```text
KULTUR
ADVERTISER
VENUE_ORGANIZER
```

---

# 🔗 USER → ORGANIZATION

A user belongs to an organization.

```text
USER
  │
  │ belongs to
  ▼
ORGANIZATION
```

But a user could theoretically belong to multiple organizations later.

For example:

```text
Person A

├── KULTUR Volunteer
└── Event Organizer
```

So eventually we should use:

```text
organization_members
```

Like:

```text
organization_members

user_id
organization_id
role
```

This is much more scalable.

---

# 🏢 ENTITY #3 — COMPANY / ADVERTISER

Now let's talk about the paying customer.

Example:

```text
Khimji Jewellers
DN Homes
```

These should **not simply be strings inside campaigns**.

Bad:

```text
campaign
    client_name = "Khimji Jewellers"
```

Why?

Because later Khimji may have:

```text
10 campaigns
50 employees
5 offers
multiple locations
different dashboards
```

So:

```text
ORGANIZATION
```

with:

```text
type = ADVERTISER
```

Example:

```text
Organization
────────────────────

Khimji Jewellers

type:
ADVERTISER
```

Then:

```text
KHIMJI JEWELLERS
        │
        ├── Campaign 1
        │
        ├── Campaign 2
        │
        └── Campaign 3
```

---

# 🎊 ENTITY #4 — EVENT

Now we come to Ganesh Puja.

For Phase 1:

```text
EVENT

Ganesh Puja 2026
```

But be careful.

There are two possible interpretations.

### Option A

One huge event:

```text
GANESH PUJA 2026
```

Then multiple venues:

```text
Ganesh Puja 2026

├── Saheed Nagar
├── Rasulgarh
├── Nayapalli
└── Old Town
```

### Option B

Every Pandal is an Event.

```text
Saheed Nagar Ganesh Puja 2026
Rasulgarh Ganesh Puja 2026
```

---

# 🏆 I RECOMMEND OPTION A

Use:

```text
EVENT
↓
GANESH PUJA 2026
```

Then:

```text
VENUES
```

under it.

Like:

```text
GANESH PUJA 2026
       │
       │
       ├───────────────┐
       │               │
       ▼               ▼

SAHEED NAGAR      RASULGARH
PANDAL             PANDAL
```

Why?

Because the festival is the event.

The pandal is the location.

This gives us clean data.

---

# 📍 ENTITY #5 — VENUE

A Venue is a physical place.

Example:

```text
Saheed Nagar Ganesh Pandal
```

It belongs to:

```text
Ganesh Puja 2026
```

Structure:

```text
EVENT
   │
   │ has many
   ▼
VENUES
```

Example:

```text
Ganesh Puja 2026
│
├── Saheed Nagar Pandal
│
├── Rasulgarh Pandal
│
└── Nayapalli Pandal
```

Venue fields:

```text
id

event_id

name

address

latitude

longitude

geo_radius_meters

status
```

The foreign-key relationship is exactly the kind of parent-child relational modeling supported by Postgres/Supabase. ([Supabase][1])

---

# 👨‍💼 ENTITY #6 — VENUE ORGANIZER RELATIONSHIP

Now we attach organizers.

```text
VENUE ORGANIZER
       │
       │ manages
       ▼
     VENUE
```

Example:

```text
Saheed Nagar Ganesh Committee
             │
             │
             ▼
Saheed Nagar Ganesh Pandal
```

But remember:

The organization manages the venue.

The individual users belong to that organization.

So:

```text
USER
 │
 ▼
ORGANIZATION
 │
 │ manages
 ▼
VENUE
```

This is the correct architecture.

---

# 💰 ENTITY #7 — CAMPAIGN

Now the advertiser enters.

Example:

```text
Khimji Jewellers
```

They want advertising.

So KULTUR creates:

```text
CAMPAIGN
```

Example:

```text
Khimji Ganesh Offer 2026
```

The relationship:

```text
ADVERTISER
     │
     │ owns
     ▼
 CAMPAIGN
```

Example:

```text
Khimji Jewellers
        │
        ▼
Khimji Ganesh Campaign 2026
```

Campaign contains:

```text
Campaign Name

Advertiser

Start Date

End Date

Status

Branding

Offer Configuration
```

---

# ⚠️ VERY IMPORTANT

A Campaign should NOT directly be a location.

Because:

```text
Khimji Campaign
```

might run at:

```text
Saheed Nagar
Rasulgarh
Nayapalli
```

Therefore:

```text
CAMPAIGN
       │
       │
       ▼
    ACTIVATION
```

---

# 🔥 ENTITY #8 — ACTIVATION

This is one of the most important concepts in the entire system.

An **Activation** means:

> "This particular campaign is active at this particular venue."

Example:

```text
Campaign:
Khimji Ganesh Campaign 2026

Venue:
Saheed Nagar Pandal
```

Together:

```text
CAMPAIGN ACTIVATION
```

---

# 🧠 Example

```text
                  KHIMJI
                    │
                    ▼
          KHIMJI GANESH CAMPAIGN
                    │
          ┌─────────┼─────────┐
          │         │         │
          ▼         ▼         ▼

     SAHEED      RASULGARH   NAYAPALLI
      NAGAR
```

But in our database:

```text
campaigns

id
advertiser_id
name
```

and:

```text
campaign_activations

id

campaign_id

venue_id

status
```

---

# 💥 WHY ACTIVATION IS IMPORTANT

Without activation:

```text
Campaign → Venue
```

seems enough.

But later we might need:

```text
Campaign:
Khimji Ganesh Campaign

Venue:
Saheed Nagar
```

with unique properties:

```text
500 bottles

Different offer

Different volunteer team

Different start time

Different stock

Different metrics
```

Those belong to the **activation**, not the campaign.

So:

```text
CAMPAIGN
   │
   │
   ▼
ACTIVATION
   │
   ├── Venue
   │
   ├── Bottles
   │
   ├── Volunteers
   │
   └── Metrics
```

🔥 This is the correct abstraction.

---

# 🧴 ENTITY #9 — BATCH

Now we enter physical operations.

We have:

```text
Campaign
     │
     ▼
Activation
     │
     ▼
Batch
```

Example:

```text
Khimji Campaign
       │
       ▼
Saheed Nagar Activation
       │
       ▼
Batch #001
```

A batch represents a group of bottles.

Example:

```text
Batch ID:
KHI-GANESH-SN-001

Quantity:
500 bottles
```

Since we decided bulk labels have the same QR code:

```text
https://kultur.live/scan/KHI-GANESH-SN-001
```

All bottles in that batch can contain the same QR.

---

# 🔗 THE QR RELATIONSHIP

```text
BOTTLE
   │
   │
   ▼
STATIC QR
   │
   │
   ▼
BATCH
```

Therefore:

```text
QR
 ↓
/scan/[batchId]
```

Example:

```text
/scan/KHI-GANESH-SN-001
```

The batch becomes the physical→digital bridge.

🔥 **This is a key KULTUR concept.**

---

# 🏭 FULL PHYSICAL STRUCTURE

```text
CAMPAIGN
    │
    ▼
ACTIVATION
    │
    ▼
BATCH
    │
    ▼
500 BOTTLES
    │
    ▼
ONE STATIC QR
    │
    ▼
/scan/BATCH_ID
```

---

# 👷 ENTITY #10 — VOLUNTEERS

Volunteers belong to KULTUR.

```text
KULTUR
   │
   ├── Admin
   │
   └── Volunteers
```

But volunteers are assigned to operational tasks.

So:

```text
VOLUNTEER
      │
      │ assigned to
      ▼
     BATCH
```

We need a separate entity:

```text
batch_assignments
```

Example:

```text
Batch #001

Volunteer:
Rahul

Task:
Deliver

Status:
ASSIGNED
```

---

# 🚚 THE BATCH LIFECYCLE

This is important.

A batch should move through states.

```text
CREATED
   │
   ▼
PRINTED
   │
   ▼
READY
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

For Ganesh Puja:

```text
Admin creates batch

↓

QR labels printed

↓

Volunteer receives batch

↓

Volunteer travels to venue

↓

Volunteer confirms delivery

↓

Batch becomes ACTIVE

↓

People scan

↓

Event ends

↓

Batch becomes COMPLETED
```

---

# 📍 GEO-FENCING

The volunteer should not randomly say:

> "I delivered the bottles."

The system can validate:

```text
Volunteer GPS
       │
       ▼
Is user inside venue radius?
       │
   ┌───┴────┐
   │        │
 YES       NO
   │        │
   ▼        ▼

DELIVER    BLOCK
```

This belongs to:

```text
VENUE
```

because the venue contains:

```text
latitude
longitude
radius
```

---

# 📱 NOW THE CUSTOMER SIDE

The most important flow.

A person scans:

```text
QR CODE
```

Browser opens:

```text
/scan/[batchId]
```

Example:

```text
/scan/KHI-GANESH-SN-001
```

The system does:

```text
REQUEST
   │
   ▼
Find Batch
   │
   ▼
Find Activation
   │
   ▼
Find Campaign
   │
   ▼
Find Event
   │
   ▼
Find Venue
   │
   ▼
Render Experience
```

---

# 🧠 THIS IS THE RELATIONAL CHAIN

```text
SCAN URL

     │

     ▼

BATCH
     │

     ▼

ACTIVATION
     │
     ├─────────────┐
     │             │
     ▼             ▼

CAMPAIGN        VENUE
     │             │
     ▼             ▼

ADVERTISER      EVENT
```

🔥🔥🔥

This is one of the central architecture diagrams of KULTUR.

---

# 🎨 WHAT DOES THE USER SEE?

Since we are focusing ONLY on Ganesh Puja:

```text
SCAN QR

↓

GANESH PUJA SCREEN

↓

Event/Venue Information

↓

Sponsor Branding

↓

Interactive Experience

↓

Game

↓

Reward

↓

Phone Verification

↓

Voucher
```

No sports logic.

No generic UI mode.

For now.

---

# 🕉️ OUR PHASE 1 SCREEN

Something like:

```text
┌─────────────────────────────┐
│                             │
│       🕉️ GANESH PUJA        │
│                             │
│   SAHEED NAGAR LIVE         │
│                             │
│   Sponsored by KHIMJI       │
│                             │
│      [ BRAND IMAGE ]        │
│                             │
├─────────────────────────────┤
│                             │
│       FESTIVAL GAME         │
│                             │
│      CATCH THE MODAK        │
│                             │
│        [ PLAY ]             │
│                             │
├─────────────────────────────┤
│                             │
│        🎁 REWARD            │
│                             │
│       CLAIM OFFER           │
│                             │
└─────────────────────────────┘
```

---

# 🎮 GAME COMPLETION

The game should NOT itself be the database entity at first.

Don't overengineer.

For Phase 1:

```text
Ganesh Game
```

is part of the campaign experience.

The campaign configuration can simply contain:

```text
experience_type:

GANESH_PUJA_2026
```

Or even simpler:

```text
We hard-build the Ganesh experience.
```

This is my recommendation.

🚨 **Do not make a giant plugin architecture before we even have customers.**

---

# 📊 ENTITY #11 — SCAN

Every QR interaction creates a scan event.

```text
SCAN
```

Example:

```text
Scan ID

Batch ID

Timestamp

User Agent

IP Hash

Session ID
```

Notice:

### Not necessarily the raw IP.

We should think carefully about privacy and retention policies.

---

# 🔄 Scan Flow

```text
USER
  │
  ▼
SCANS QR
  │
  ▼
/scan/[batchId]
  │
  ▼
VALIDATE BATCH
  │
  ▼
LOG SCAN
  │
  ▼
CREATE / GET SESSION
  │
  ▼
SHOW EXPERIENCE
```

---

# 🧠 IMPORTANT: SCAN ≠ LEAD

These are completely different.

```text
10,000 scans
```

might produce:

```text
2,000 game completions
```

which might produce:

```text
500 phone entries
```

which might produce:

```text
400 verified leads
```

Therefore:

```text
SCANS
   │
   ▼
ENGAGEMENT
   │
   ▼
CLAIMS
   │
   ▼
VERIFIED LEADS
```

---

# 🎁 ENTITY #12 — OFFER

An advertiser may have an offer.

Example:

```text
Khimji:

₹1,000 OFF
```

or:

```text
DN Homes:

Free Site Visit Benefit
```

For Ganesh Puja:

```text
CAMPAIGN
     │
     │ has
     ▼
   OFFER
```

Offer fields:

```text
id

campaign_id

title

description

valid_from

valid_until

terms
```

---

# 📲 ENTITY #13 — CLAIM

When a user wants the offer:

```text
USER

↓

CLAIM OFFER

↓

PHONE NUMBER

↓

OTP

↓

VERIFIED

↓

LEAD CREATED
```

The claim should be separate from the lead concept.

Why?

Because the user might:

```text
Start claim
```

but never finish OTP.

So:

```text
CLAIM ATTEMPT
```

and:

```text
VERIFIED LEAD
```

are different states.

For our initial MVP, we can simplify.

---

# 🧍 ENTITY #14 — LEAD

A lead is created only after successful verification.

```text
LEAD

id

campaign_id

activation_id

phone

phone_hash

verified_at
```

The lead is connected to the campaign.

But I would ALSO store:

```text
activation_id
```

Why?

Because Khimji wants to know:

```text
Where did this lead come from?
```

Example:

```text
Campaign:
Khimji Ganesh Campaign

Venue:
Saheed Nagar
```

versus:

```text
Campaign:
Khimji Ganesh Campaign

Venue:
Rasulgarh
```

🔥 This data is extremely valuable.

---

# 🔐 ONE PHONE, ONE REWARD?

We need to define this precisely.

My recommendation:

```text
ONE VERIFIED PHONE
          │
          │
          ▼
ONE CLAIM PER CAMPAIGN
```

Not:

```text
one per batch
```

Why?

Imagine:

```text
User scans bottle at:

Saheed Nagar

↓

Claims reward

↓

Goes to Rasulgarh

↓

Scans another bottle
```

If we use:

```text
one per batch
```

they can get another reward.

Maybe that's okay.

But for fraud control, the business rule should be intentional.

---

# 🎯 I recommend this for Phase 1:

```text
ONE PHONE
+
ONE CAMPAIGN
=
ONE VOUCHER
```

So:

```text
UNIQUE:

campaign_id
phone_hash
```

---

# 🎟️ ENTITY #15 — VOUCHER

After OTP:

```text
LEAD
   │
   ▼
VOUCHER
```

Voucher:

```text
KULTUR-KHIMJI-8X4K2P
```

Fields:

```text
id

lead_id

campaign_id

code

status

expires_at

redeemed_at
```

Status:

```text
ISSUED

REDEEMED

EXPIRED

CANCELLED
```

---

# 🧾 OFFER VS VOUCHER

This is another important distinction.

```text
OFFER
```

is the campaign's benefit.

Example:

> ₹1,000 off jewellery.

```text
VOUCHER
```

is the unique proof generated for one person.

Example:

```text
KULTUR-KHIMJI-A9X82K
```

So:

```text
CAMPAIGN
    │
    ▼
  OFFER

LEAD
    │
    ▼
 VOUCHER
    │
    ▼
References OFFER
```

---

# 🔥 COMPLETE RELATIONSHIP MAP

Now look at the entire system.

```text
                         USERS
                           │
                           │
                    ORGANIZATION MEMBERS
                           │
                           ▼
                      ORGANIZATIONS
                       /     |     \
                      /      |      \
                     /       |       \
                    ▼        ▼        ▼

               KULTUR   ADVERTISER  ORGANIZER
                  │         │           │
                  │         │           │
                  │         ▼           ▼
                  │      CAMPAIGN     VENUE
                  │         │           │
                  │         │           │
                  │         ▼           │
                  │     ACTIVATION ◄───┘
                  │         │
                  │         │
                  │         ▼
                  │       BATCH
                  │         │
                  │     ┌───┴────┐
                  │     │        │
                  ▼     ▼        ▼

             VOLUNTEER  SCANS  ASSIGNMENTS
                         │
                         ▼
                     SESSIONS
                         │
                         ▼
                       LEADS
                         │
                         ▼
                      VOUCHERS
                         │
                         ▼
                      REDEMPTION
```

---

# 🧠 BUT WHERE DOES THE EVENT GO?

Here:

```text
EVENT
   │
   ▼
VENUE
```

And:

```text
VENUE
   │
   ▼
ACTIVATION
```

Full chain:

```text
EVENT
  │
  ▼
VENUE
  │
  ▼
ACTIVATION
  ▲
  │
CAMPAIGN
```

---

# 🎯 FINAL CORE DATA MODEL

For KULTUR Phase 1, I would lock these entities:

## Identity

```text
profiles

organizations

organization_members
```

---

## Festival Infrastructure

```text
events

venues

venue_organizers
```

---

## Advertising

```text
campaigns

campaign_activations

offers
```

---

## Physical Operations

```text
batches

batch_assignments

batch_delivery_events
```

---

## Customer Experience

```text
scans

scan_sessions

game_sessions
```

---

## Conversion

```text
claims

leads

vouchers

voucher_redemptions
```

---

# 🏗️ THE DATABASE RELATIONSHIPS

Now let's make it visual.

```text
ORGANIZATION
    │
    │
    ├───────────────┐
    │               │
    ▼               ▼

ADVERTISER       ORGANIZER
    │               │
    │               │
    ▼               ▼

CAMPAIGN        VENUE ORGANIZATION
    │               │
    │               │
    │               ▼
    │             VENUE
    │               │
    └───────┐       │
            │       │
            ▼       ▼

        CAMPAIGN ACTIVATION
                │
                │
                ▼
              BATCH
                │
       ┌────────┼────────┐
       │        │        │
       ▼        ▼        ▼

VOLUNTEER     QR       SCANS
                │
                ▼
           CUSTOMER FLOW
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

# 🏛️ NOW THE MONOLITH ARCHITECTURE

You specifically chose:

> **MONOLITH + NEXT.JS + SUPABASE**

And I agree.

We should NOT create:

```text
Microservice 1
Microservice 2
Queue Service
Game Service
Campaign Service
Voucher Service
```

❌ No.

For KULTUR Phase 1:

```text
                    ┌──────────────────────┐
                    │      NEXT.JS APP     │
                    │                      │
                    │   ONE MONOLITH       │
                    │                      │
                    ├──────────────────────┤
                    │                      │
                    │ Auth                 │
                    │ Admin                │
                    │ Campaigns            │
                    │ Events               │
                    │ Venues               │
                    │ Batches              │
                    │ Volunteers           │
                    │ Scan Experience      │
                    │ Claims               │
                    │ Vouchers             │
                    │ Analytics            │
                    │                      │
                    └──────────┬───────────┘
                               │
                               │
                               ▼
                    ┌──────────────────────┐
                    │      SUPABASE        │
                    │                      │
                    │ Auth                 │
                    │ PostgreSQL           │
                    │ Storage              │
                    │ Realtime             │
                    │ RLS                  │
                    │                      │
                    └──────────────────────┘
```

Next.js App Router is designed for a single application using Server Components, Server Functions, dynamic routes, and file-system routing, and Next.js also provides guidance for multi-tenant applications. ([Next.js][2])

---

# 📁 THE ARCHITECTURE I WOULD USE

I would NOT organize everything randomly.

```text
src/
│
├── app/
│
│   ├── (public)/
│   │
│   │   ├── page.tsx
│   │   │
│   │   └── scan/
│   │       └── [batchId]/
│   │           └── page.tsx
│   │
│   ├── (auth)/
│   │
│   │   ├── login/
│   │   └── logout/
│   │
│   ├── admin/
│   │
│   │   ├── dashboard/
│   │   │
│   │   ├── organizations/
│   │   │
│   │   ├── advertisers/
│   │   │
│   │   ├── events/
│   │   │
│   │   ├── venues/
│   │   │
│   │   ├── campaigns/
│   │   │
│   │   ├── activations/
│   │   │
│   │   ├── batches/
│   │   │
│   │   ├── volunteers/
│   │   │
│   │   └── analytics/
│   │
│   ├── venue/
│   │
│   │   ├── dashboard/
│   │   └── live/
│   │
│   ├── volunteer/
│   │
│   │   ├── dashboard/
│   │   └── assignments/
│   │
│   ├── advertiser/
│   │
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── leads/
│   │   └── vouchers/
│   │
│   └── api/
│
├── features/
│
│   ├── auth/
│   ├── organizations/
│   ├── events/
│   ├── venues/
│   ├── campaigns/
│   ├── activations/
│   ├── batches/
│   ├── volunteers/
│   ├── scans/
│   ├── claims/
│   ├── vouchers/
│   └── analytics/
│
├── components/
│
│   ├── ui/
│   ├── layout/
│   └── ganesh/
│
├── lib/
│
│   ├── supabase/
│   ├── auth/
│   └── utils/
│
├── actions/
│
└── types/
```

Next.js explicitly supports organizing by routes, features, shared folders, and route groups without changing URLs. ([Next.js][3])

---

# 🔥 ONE IMPORTANT DESIGN PRINCIPLE

We should separate:

## ROUTES

from:

## BUSINESS LOGIC

For example:

❌ Bad:

```text
app/admin/campaigns/page.tsx

contains:

- SQL logic
- validation
- authorization
- campaign creation
- UI
```

Everything mixed together.

---

# ✅ Good

```text
app/admin/campaigns/page.tsx
```

Only handles:

```text
PAGE
```

Business logic:

```text
features/campaigns/
```

Database:

```text
features/campaigns/repository.ts
```

Validation:

```text
features/campaigns/schema.ts
```

Service:

```text
features/campaigns/service.ts
```

Actions:

```text
features/campaigns/actions.ts
```

---

# 🧠 Example

```text
features/
│
└── campaigns/
    │
    ├── campaign.service.ts
    │
    ├── campaign.repository.ts
    │
    ├── campaign.schema.ts
    │
    ├── campaign.types.ts
    │
    └── campaign.actions.ts
```

---

# 💥 WHAT IS A MODULAR MONOLITH?

This is what I want you to understand deeply.

We have:

```text
ONE APPLICATION
```

But internally:

```text
┌────────────────────────────┐
│         NEXT.JS APP        │
│                            │
│  ┌─────────┐ ┌──────────┐  │
│  │ EVENTS  │ │ CAMPAIGN │  │
│  └─────────┘ └──────────┘  │
│                            │
│  ┌─────────┐ ┌──────────┐  │
│  │ BATCHES │ │ VOUCHERS │  │
│  └─────────┘ └──────────┘  │
│                            │
│  ┌─────────┐ ┌──────────┐  │
│  │  SCANS  │ │ VOLUNTEER│  │
│  └─────────┘ └──────────┘  │
│                            │
└────────────────────────────┘
```

One deployable application.

But organized modules.

That means:

```text
ONE CODEBASE

ONE DATABASE

ONE DEPLOYMENT

MULTIPLE MODULES
```

🔥 That's perfect for us.

---

# 🗄️ SUPABASE'S JOB

Supabase should handle infrastructure.

```text
SUPABASE
```

will provide:

### 1. Authentication

```text
Login
Sessions
Users
```

### 2. PostgreSQL

```text
All relational data
```

### 3. RLS

```text
Who can see what
```

### 4. Storage

```text
Sponsor logos
Campaign images
Venue images
```

### 5. Realtime

Potentially:

```text
Live venue announcements
Live campaign metrics
```

Supabase is built around Postgres, with Auth, Storage, Realtime, and RLS-based security available around the database layer. ([Supabase][4])

---

# 🔒 MULTI-TENANT SECURITY

This is where KULTUR becomes serious.

Imagine:

```text
Khimji Jewellers
```

logs in.

They must NOT see:

```text
DN Homes Campaign
```

Similarly:

```text
Saheed Nagar Organizer
```

must NOT see:

```text
Rasulgarh internal data
```

So:

```text
USER
 │
 ▼
ORGANIZATION
 │
 ▼
DATA ACCESS
```

---

# EXAMPLE

```text
Khimji User
      │
      ▼
Organization = KHIMJI
      │
      ▼
Can access:
campaigns.advertiser_id = KHIMJI
```

RLS should enforce these boundaries, rather than relying only on frontend hiding. Supabase recommends RLS and least-privilege access for data exposed through client APIs. ([Supabase][5])

---

# 🚨 BUT FOR PHASE 1...

Don't make RLS insanely complicated immediately.

We'll build it systematically.

First:

```text
MASTER_ADMIN
```

Then:

```text
ADVERTISER
```

Then:

```text
VENUE ORGANIZER
```

Then:

```text
VOLUNTEER
```

One layer at a time.

---

# 🧠 THE COMPLETE GANESH PUJA FLOW

Here is the final system flow I would currently design.

---

## STEP 1 — MASTER ADMIN

You log in.

```text
/admin
```

You see:

```text
Dashboard
```

---

## STEP 2 — CREATE ADVERTISER

You create:

```text
Khimji Jewellers
```

System:

```text
Organization
Type = ADVERTISER
```

---

# STEP 3 — CREATE EVENT

```text
Ganesh Puja 2026
```

---

# STEP 4 — CREATE VENUES

```text
Saheed Nagar Pandal

Rasulgarh Pandal

Nayapalli Pandal
```

All belong to:

```text
Ganesh Puja 2026
```

---

# STEP 5 — CONNECT ORGANIZER

Example:

```text
Saheed Nagar Ganesh Committee
```

gets connected to:

```text
Saheed Nagar Pandal
```

---

# STEP 6 — CREATE CAMPAIGN

```text
Khimji Ganesh Puja Campaign
```

Belongs to:

```text
Khimji Jewellers
```

---

# STEP 7 — CREATE OFFER

Example:

```text
Flat ₹X benefit
```

with:

```text
Terms
Expiry
Eligibility
```

---

# STEP 8 — CREATE ACTIVATION

```text
Campaign:
Khimji Ganesh Campaign

Venue:
Saheed Nagar
```

Result:

```text
Khimji × Saheed Nagar Activation
```

---

# STEP 9 — CREATE BATCH

```text
Batch:

KHI-GANESH-SN-001

Quantity:

500
```

---

# STEP 10 — GENERATE QR

```text
https://kultur.live/scan/KHI-GANESH-SN-001
```

This goes into the bottle wrapper design.

---

# STEP 11 — ASSIGN VOLUNTEER

```text
Volunteer:

Rahul
```

Task:

```text
Deliver Batch #001
```

---

# STEP 12 — DELIVERY

Rahul arrives.

System checks:

```text
GPS
```

against:

```text
Saheed Nagar Venue
```

If valid:

```text
Batch → DELIVERED
```

---

# STEP 13 — ACTIVATE

Admin/volunteer:

```text
ACTIVATE BATCH
```

Now:

```text
QR WORKS
```

---

# STEP 14 — CUSTOMER SCANS

```text
QR

↓

/scan/KHI-GANESH-SN-001
```

---

# STEP 15 — SYSTEM RESOLVES CONTEXT

```text
BATCH

↓

ACTIVATION

↓

CAMPAIGN

↓

VENUE

↓

EVENT

↓

OFFER
```

---

# STEP 16 — GANESH EXPERIENCE

User sees:

```text
Ganesh Puja

Venue Information

Sponsor

Game

Reward
```

---

# STEP 17 — GAME

```text
User plays
```

Example:

```text
Catch the Modak
```

---

# STEP 18 — CLAIM

```text
CLAIM OFFER
```

---

# STEP 19 — PHONE

```text
+91 XXXXXXXXXX
```

---

# STEP 20 — OTP

```text
VERIFY
```

---

# STEP 21 — LEAD

System checks:

```text
Has this phone already
claimed this campaign?
```

If:

```text
NO
```

Create:

```text
LEAD
```

---

# STEP 22 — VOUCHER

Generate:

```text
KULTUR-KHIMJI-X82PQ9
```

---

# STEP 23 — ADVERTISER

Khimji dashboard sees:

```text
Scans

Game Completions

Claims

Verified Leads

Voucher Redemptions
```

---

# 🎯 OUR MOST IMPORTANT KPI FUNNEL

This is the actual AdTech engine.

```text
BOTTLES DISTRIBUTED
        │
        ▼
       SCANS
        │
        ▼
   ENGAGEMENT
        │
        ▼
 GAME COMPLETION
        │
        ▼
 CLAIM ATTEMPT
        │
        ▼
 OTP VERIFIED
        │
        ▼
 VERIFIED LEAD
        │
        ▼
 VOUCHER ISSUED
        │
        ▼
 VOUCHER REDEEMED
```

🔥 THIS is what KULTUR sells to advertisers.

Not water.

Not QR codes.

**Measurable conversion.**

---

# 🧠 MY EXPERT RECOMMENDATION

We should now stop expanding architecture.

We have enough.

The biggest danger now is:

> **Architecting forever without building.**

So I would lock our Phase 1 foundation as:

# KULTUR V1 — GANESH PUJA

```text
STACK

Next.js
+
TypeScript
+
Supabase
+
Tailwind
```

Architecture:

```text
MODULAR MONOLITH
```

Experience:

```text
GANESH PUJA ONLY
```

QR:

```text
ONE STATIC QR PER BATCH
```

Core chain:

```text
ADVERTISER
    ↓
CAMPAIGN
    ↓
ACTIVATION
    ↓
VENUE
    ↓
BATCH
    ↓
QR
    ↓
SCAN
    ↓
EXPERIENCE
    ↓
OTP
    ↓
LEAD
    ↓
VOUCHER
```

---

# 🚀 WHAT WE SHOULD DO NEXT

## **ENTITY #NEXT: DATABASE SCHEMA**

I think the next step should be extremely concrete.

We should design the actual tables:

```text
profiles
organizations
organization_members

events
venues

campaigns
campaign_activations
offers

batches
batch_assignments

scans

leads
vouchers
voucher_redemptions
```

Then for **every single table**, we decide:

1. What is it?
2. Why does it exist?
3. Every column
4. Primary key
5. Foreign keys
6. Relationships
7. Who can access it?
8. What happens when related data is deleted?
9. What indexes are needed?

**That is where we should continue next—and do it slowly, from absolute basics, so you understand every internal relationship instead of blindly copying SQL.**

[1]: https://supabase.com/docs/guides/database/tables?utm_source=chatgpt.com "Tables and Data | Supabase Docs"
[2]: https://nextjs.org/docs/app?utm_source=chatgpt.com "Next.js Docs: App Router | Next.js"
[3]: https://nextjs.org/docs/app/getting-started/project-structure?utm_source=chatgpt.com "Getting Started: Project Structure | Next.js"
[4]: https://supabase.com/docs/guides/database/overview?utm_source=chatgpt.com "Database | Supabase Docs"
[5]: https://supabase.com/docs/guides/database/secure-data?utm_source=chatgpt.com "Securing your data | Supabase Docs"

see KULTUR_V1_SIMTWO.md next
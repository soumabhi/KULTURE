YES. And I think we're now at the point where we should **stop randomly adding features** and lock the actual architecture.

Based on everything we've discussed, here is how I would structure **KULTUR Phase 1: Ganesh Puja** as an expert system designer.

# 🕉️ KULTUR — THE REAL ARCHITECTURE

## First: one important correction

For now, **we are NOT building a generic sports/concert/cultural platform**.

We will design the architecture so it can expand later, but **every current business decision is based only on Ganesh Puja**.

So our hierarchy should be:

```text
KULTUR
   │
   ├── Companies
   │
   ├── Events
   │
   │      └── Ganesh Puja 2026
   │
   ├── Locations / Venues
   │
   │      └── Ganesh Pandals
   │
   ├── Campaigns
   │
   ├── Bottle Batches
   │
   └── QR Scan Experiences
```

This is the foundation.

---

# 🧠 THE BIGGEST QUESTION:

# Where does a Venue Organiser belong?

You previously asked:

> Is Venue Organizer a Location, Event, or Campaign?

### Answer:

## ❌ Venue Organizer is NOT a location.

## ❌ Venue Organizer is NOT an event.

## ❌ Venue Organizer is NOT directly a campaign.

### ✅ Venue Organizer is a USER / ORGANIZATION connected to a LOCATION.

Think about real life.

```text
GANESH PUJA 2026
       │
       ▼
Saheed Nagar Ganesh Pandal
       │
       ▼
Pandal Committee
       │
       ▼
Committee Members
       │
       ▼
Venue Organizer Accounts
```

So:

```text
USER
 ↓
belongs to
 ↓
VENUE ORGANIZATION
 ↓
manages
 ↓
VENUE / LOCATION
```

This distinction will save us from horrible database problems later.

---

# 🏗️ THE COMPLETE BUSINESS HIERARCHY

Here is the architecture I recommend.

```text
                         KULTUR
                           │
                           │
                ┌──────────┴──────────┐
                │                     │
             INTERNAL              EXTERNAL
                │                     │
                │                     │
           KULTUR ADMINS         PARTNER COMPANIES
                                      │
                                      │
                              ┌───────┴────────┐
                              │                │
                         ADVERTISERS       VENUE PARTNERS
```

But the actual **operational hierarchy** is:

```text
KULTUR
 │
 │
 ├────────────── EVENT ───────────────┐
 │                                    │
 │                              GANESH PUJA 2026
 │                                    │
 │                  ┌─────────────────┼─────────────────┐
 │                  │                 │                 │
 │                  ▼                 ▼                 ▼
 │             PANDAL A          PANDAL B          PANDAL C
 │                  │                 │
 │                  │                 │
 │             CAMPAIGNS          CAMPAIGNS
 │                  │
 │                  │
 │         ┌────────┴─────────┐
 │         │                  │
 │      SPONSOR A          SPONSOR B
 │
 │
 └── BOTTLE BATCHES
          │
          ▼
       QR CODE
          │
          ▼
       CUSTOMER
```

---

# 🎯 THE CORE ENTITIES

I would divide our system into **8 major domains**.

---

# 1️⃣ USERS & ROLES

This is our identity system.

```text
auth.users
     │
     ▼
profiles
```

Supabase Auth handles authentication, while our application stores business information in `profiles`. This fits the normal Next.js + Supabase approach. ([Supabase][1])

### Roles:

```text
SUPER_ADMIN
ADMIN
VOLUNTEER
VENUE_ORGANIZER
ADVERTISER
```

But I would **not hardcode permissions everywhere**.

Instead:

```text
USER
 │
 ▼
PROFILE
 │
 ▼
ROLE
```

Example:

| User                          | Role            |
| ----------------------------- | --------------- |
| Abhishek                      | SUPER_ADMIN     |
| Kultur Operations Manager     | ADMIN           |
| Rahul                         | VOLUNTEER       |
| Saheed Nagar Committee Member | VENUE_ORGANIZER |
| Khimji Marketing Manager      | ADVERTISER      |

---

# 2️⃣ ORGANIZATIONS

This is something we absolutely need.

Instead of making separate weird structures for:

* Khimji
* DN Homes
* Saheed Nagar Committee
* Rasulgarh Committee

We create:

```text
organizations
```

Example:

| Organization           | Type               |
| ---------------------- | ------------------ |
| Kultur                 | KULTUR             |
| Khimji Jewellers       | ADVERTISER         |
| DN Homes               | ADVERTISER         |
| Saheed Nagar Committee | VENUE_ORGANIZATION |

So:

```text
USER
   │
   │ belongs to
   ▼
ORGANIZATION
```

One organization can have multiple users.

```text
KHIMJI JEWELLERS
      │
      ├── Marketing Manager
      │
      ├── Campaign Manager
      │
      └── Sales Executive
```

This is much better than attaching everything directly to one user.

---

# 3️⃣ EVENTS

For Phase 1:

```text
EVENT

Ganesh Puja 2026
```

The event is the **big container**.

```text
EVENT
│
├── Name
├── Start Date
├── End Date
├── City
├── Status
└── Description
```

Example:

```text
Ganesh Puja 2026
Bhubaneswar
September 2026
```

Later:

```text
Ganesh Puja 2027
Durga Puja
Sports Event
Concert
College Fest
```

But we don't need to build those features now.

---

# 4️⃣ VENUES / LOCATIONS

For Ganesh Puja:

## A Venue = A Ganesh Pandal.

Example:

```text
Saheed Nagar Ganesh Pandal

Rasulgarh Ganesh Pandal

Nayapalli Ganesh Pandal
```

Database concept:

```text
venues
```

Each venue belongs to:

```text
EVENT
```

Therefore:

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
GANESH PUJA 2026
       │
       │
       ├── Saheed Nagar Pandal
       │
       ├── Rasulgarh Pandal
       │
       └── Nayapalli Pandal
```

A venue contains:

```text
venue_id

name

address

latitude

longitude

geofence_radius

venue_organization_id
```

This gives us the ability to connect the Pandal Committee.

```text
SAHEED NAGAR PANDAL
         │
         │ managed by
         ▼
SAHEED NAGAR COMMITTEE
```

---

# 5️⃣ CAMPAIGNS

This is where the advertiser enters.

Let's say:

> Khimji wants to advertise during Ganesh Puja.

We create:

```text
CAMPAIGN

Khimji Ganesh Puja 2026
```

A campaign belongs to:

```text
ADVERTISER ORGANIZATION
```

and operates within:

```text
EVENT
```

Therefore:

```text
KHIMJI
   │
   ▼
CAMPAIGN
   │
   ▼
GANESH PUJA 2026
```

But now comes an important point.

# A campaign can operate in multiple venues.

Example:

```text
KHIMJI GANESH CAMPAIGN
        │
        ├── Saheed Nagar
        │
        ├── Rasulgarh
        │
        └── Nayapalli
```

Therefore we need a relationship:

```text
campaign_venues
```

Like:

```text
campaign
    │
    │
    ├───────────┐
    │           │
    ▼           ▼
VENUE A      VENUE B
```

This is a many-to-many relationship, which relational databases normally model using a join table. ([Supabase][2])

---

# 🔥 THE ACTUAL RELATIONSHIP

```text
ADVERTISER
     │
     ▼
 CAMPAIGN
     │
     │
     ├──────────────┐
     │              │
     ▼              ▼
  VENUE A        VENUE B
```

So:

```text
Campaign
       ↕
CampaignVenues
       ↕
Venue
```

---

# 6️⃣ BOTTLE BATCHES

Now manufacturing begins.

This is where many systems would become confused.

We should **not directly connect bottles to campaigns only**.

Instead:

```text
CAMPAIGN
   │
   ▼
BOTTLE BATCH
```

Example:

```text
KHIMJI GANESH CAMPAIGN
           │
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
 BATCH 001    BATCH 002
```

A batch represents a real physical production unit.

Example:

```text
Batch:

KUL-GP26-KHIMJI-001

Quantity:

10,000 bottles
```

---

# 🏭 PRODUCTION FLOW

```text
ADMIN
   │
   ▼
CREATE CAMPAIGN
   │
   ▼
SELECT VENUES
   │
   ▼
CREATE BATCH
   │
   ▼
SET QUANTITY
   │
   ▼
GENERATE QR
   │
   ▼
SEND PRINT FILE
   │
   ▼
PRODUCTION
```

Example:

```text
Campaign:
Khimji Ganesh Puja

Venue:
Saheed Nagar

Batch:
KHIMJI-SN-001

Quantity:
10,000
```

---

# 7️⃣ DISTRIBUTION

After bottles are manufactured:

```text
BATCH
  │
  ▼
ASSIGNED TO VOLUNTEER
  │
  ▼
DELIVERED TO VENUE
  │
  ▼
ACTIVATED
```

This requires:

```text
batch_assignments
```

Example:

```text
Batch:
KHIMJI-SN-001

Volunteer:
Rahul

Destination:
Saheed Nagar Pandal
```

Flow:

```text
WAREHOUSE
     │
     ▼
VOLUNTEER
     │
     ▼
VENUE
     │
     ▼
ACTIVATE BATCH
```

---

# 📍 GEOFENCING

When the volunteer arrives:

```text
VOLUNTEER PRESSES:

[ CONFIRM DELIVERY ]
```

Browser:

```text
GETS GPS
```

Then:

```text
Volunteer GPS
       │
       ▼
Is location inside venue radius?
       │
       ├── YES → Delivery confirmed
       │
       └── NO → Reject
```

```text
          VENUE
       ┌─────────┐
       │    📍   │
       │   GPS   │
       └─────────┘
```

---

# 8️⃣ QR EXPERIENCE

Now the customer receives the bottle.

The QR is:

```text
ONE QR PER BATCH
```

Example:

```text
kultur.live/scan/KHIMJI-SN-001
```

Customer:

```text
📱
 │
 │ SCAN QR
 ▼

kultur.live/scan/KHIMJI-SN-001
```

The system resolves:

```text
BATCH
  │
  ▼
CAMPAIGN
  │
  ▼
ADVERTISER
  │
  ▼
VENUE
  │
  ▼
EVENT
```

Then it builds the experience.

---

# 🧬 THIS IS THE MOST IMPORTANT RELATIONSHIP

```text
QR SCAN
   │
   ▼
BATCH
   │
   ▼
CAMPAIGN
   │
   ├─────► ADVERTISER
   │
   ├─────► EVENT
   │
   │
   └─────► VENUE
```

Therefore the QR does **not need to contain all this information**.

It only needs:

```text
batch_id
```

The database handles the relationships.

---

# 🕉️ THE GANESH PUJA CUSTOMER EXPERIENCE

Now the customer opens:

```text
/scan/[batchCode]
```

For example:

```text
/scan/KHIMJI-SN-001
```

The server loads:

```text
Batch
   ↓
Campaign
   ↓
Ganesh Puja Event
   ↓
Saheed Nagar Venue
   ↓
Khimji Sponsor
```

Then:

# SCREEN 1

```text
🕉️ GANESH PUJA

Saheed Nagar Pandal

Live Crowd:
🟢 MODERATE

Sponsored by

KHIMJI JEWELLERS
```

---

# SCREEN 2

The customer gets the interaction.

For Phase 1:

```text
🎮 Catch the Modak
```

or another Ganesh-specific interaction.

Important:

## We should NOT build a generic "game engine" yet.

We make:

```text
GaneshExperience
```

But structure it so later:

```text
experience_type
```

can expand.

For now:

```text
GANESH_2026
```

---

# SCREEN 3 — REWARD

After interaction:

```text
🎁

Congratulations!

You've unlocked:

Khimji Festival Offer
```

Then:

```text
[ CLAIM OFFER ]
```

---

# 📱 PHONE NUMBER FLOW

This is where identity begins.

```text
USER
  │
  ▼
ENTER PHONE NUMBER
  │
  ▼
SEND OTP
  │
  ▼
VERIFY OTP
```

Only after successful verification:

```text
CREATE CLAIM
```

---

# 🔒 VERY IMPORTANT DESIGN CHANGE

I would **not make the `leads` table responsible for everything**.

Instead, separate the concepts.

We should have:

```text
consumers
```

and:

```text
claims
```

Why?

Imagine the same person scans:

```text
Khimji campaign
```

Then:

```text
DN Homes campaign
```

Then:

```text
Future Kultur campaign
```

If we put everything into `leads`, the model becomes messy.

Instead:

# CONSUMER

```text
consumer

id
phone
phone_hash
verified
created_at
```

Then:

# CLAIM

```text
claim

id

consumer_id

campaign_id

batch_id

coupon_code

status

created_at
```

Relationship:

```text
CONSUMER
    │
    │
    ├──── CLAIM 1
    │
    ├──── CLAIM 2
    │
    └──── CLAIM 3
```

Much cleaner.

---

# 🎟️ COUPONS SHOULD ALSO BE SEPARATE

Instead of:

```text
leads
 └── coupon_code
```

I recommend:

```text
CLAIM
  │
  ▼
COUPON
```

Example:

```text
CONSUMER
    │
    ▼
CLAIM
    │
    ▼
COUPON
```

Coupon:

```text
coupon_code

status

issued_at

redeemed_at

expires_at
```

Status:

```text
ISSUED

REDEEMED

EXPIRED

CANCELLED
```

---

# 💡 WHY THIS IS BETTER

Imagine:

> Khimji changes their offer.

Or:

> A campaign has multiple rewards.

Or:

> One person qualifies but doesn't receive a coupon.

With separate entities:

```text
SCAN

INTERACTION

CLAIM

COUPON
```

we can track every step independently.

---

# 🔥 THE COMPLETE CUSTOMER FUNNEL

This is what Kultur is actually measuring:

```text
                1. IMPRESSION
                      │
                      ▼
                BOTTLE EXISTS
                      │
                      ▼
                  2. SCAN
                      │
                      ▼
                QR PAGE OPENED
                      │
                      ▼
              3. ENGAGEMENT
                      │
                      ▼
                 GAME PLAYED
                      │
                      ▼
                 GAME FINISHED
                      │
                      ▼
                 4. CLAIM
                      │
                      ▼
                PHONE ENTERED
                      │
                      ▼
                 OTP VERIFIED
                      │
                      ▼
                5. CONVERSION
                      │
                      ▼
                COUPON ISSUED
                      │
                      ▼
                 6. REDEMPTION
                      │
                      ▼
               OFFER USED
```

This funnel is extremely valuable.

---

# 📊 DATA COLLECTION

We should track separate events.

```text
scan_event

game_started

game_completed

claim_started

otp_sent

otp_verified

coupon_issued

coupon_redeemed
```

Don't put all of this into one giant table.

Instead:

```text
scan_logs
```

for scans.

```text
engagement_events
```

for interactions.

```text
claims
```

for business conversion.

```text
coupons
```

for rewards.

---

# 🧠 THE FULL DATABASE ARCHITECTURE

Here is my proposed Phase 1 schema:

```text
AUTH
│
├── profiles
│
├── organizations
│
└── organization_members
```

Then:

```text
EVENT SYSTEM
│
├── events
│
└── venues
```

Then:

```text
ADVERTISING
│
├── campaigns
│
├── campaign_venues
│
└── campaign_offers
```

Then:

```text
PRODUCTION
│
├── bottle_batches
│
├── batch_venue_allocations
│
└── batch_assignments
```

Then:

```text
CONSUMER
│
├── consumers
│
├── scan_logs
│
└── engagement_events
```

Then:

```text
CONVERSION
│
├── claims
│
└── coupons
```

---

# 🗺️ THE RELATIONAL MAP

This is the architecture I would lock.

```text
                        ORGANIZATION
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
           KULTUR       ADVERTISER       VENUE ORG
              │              │              │
              │              │              │
              ▼              ▼              ▼
            USERS         CAMPAIGN       VENUE
                             │              │
                             │              │
                             └──────┬───────┘
                                    │
                                    ▼
                            CAMPAIGN_VENUES
                                    │
                                    ▼
                                  EVENT
                                    │
                                    ▼
                              GANESH PUJA
                                    │
                                    ▼
                              BOTTLE BATCH
                                    │
                                    ▼
                                   QR
                                    │
                                    ▼
                                 SCAN
                                    │
                                    ▼
                                CONSUMER
                                    │
                                    ▼
                                  CLAIM
                                    │
                                    ▼
                                  COUPON
```

---

# 🚨 ONE CORRECTION TO OUR OLD ARCHITECTURE

Earlier we were thinking:

```text
Campaign
   ↓
Batch
```

That's correct but incomplete.

I recommend:

```text
Campaign
   │
   ▼
Campaign Venue
   │
   ▼
Batch Allocation
```

Example:

```text
KHIMJI CAMPAIGN
       │
       │
       ├───────────────┐
       │               │
       ▼               ▼
SAHEED NAGAR       RASULGARH
       │               │
       ▼               ▼
 10,000 BOTTLES    5,000 BOTTLES
```

This allows one campaign to distribute different quantities across venues.

---

# 🏭 FULL ADMIN FLOW

The Master Admin should do this:

## STEP 1

Create Event.

```text
Ganesh Puja 2026
```

---

## STEP 2

Create Venue.

```text
Saheed Nagar Pandal
```

Attach:

```text
Location
GPS
Geofence
Venue Organization
```

---

## STEP 3

Create Advertiser.

```text
Khimji Jewellers
```

---

## STEP 4

Create Campaign.

```text
Khimji Ganesh Puja Campaign
```

Configure:

```text
Sponsor

Offer

Start date

End date

Creative

Experience
```

---

## STEP 5

Select locations.

```text
☑ Saheed Nagar

☑ Rasulgarh

☑ Nayapalli
```

---

## STEP 6

Allocate bottles.

```text
Saheed Nagar
10,000

Rasulgarh
5,000

Nayapalli
7,000
```

---

## STEP 7

Generate batches.

```text
KUL-GP26-KH-SN-001

KUL-GP26-KH-RG-001

KUL-GP26-KH-NP-001
```

---

## STEP 8

Generate QR URLs.

```text
/scan/KUL-GP26-KH-SN-001

/scan/KUL-GP26-KH-RG-001

/scan/KUL-GP26-KH-NP-001
```

---

## STEP 9

Export print information.

```text
Batch Code

QR URL

Quantity

Sponsor

Venue
```

---

# 👷 VOLUNTEER FLOW

```text
VOLUNTEER LOGIN
       │
       ▼
MY ASSIGNMENTS
       │
       ▼
Batch KH-SN-001
       │
       ▼
Deliver to Saheed Nagar
       │
       ▼
[START DELIVERY]
       │
       ▼
GPS VALIDATION
       │
       ▼
[CONFIRM DELIVERY]
       │
       ▼
BATCH ACTIVE
```

---

# 🏟️ VENUE ORGANIZER FLOW

They should NOT manage campaigns.

That is important.

They manage:

```text
Their venue
```

Example:

```text
SAHEED NAGAR ORGANIZER
```

Can see:

```text
Venue information

Campaigns running there

Bottle activity

Scan count

Live announcements
```

They can update:

```text
Crowd Status

Announcement

Resupply Request
```

They cannot:

❌ Create advertisers
❌ Create campaigns
❌ See other venues
❌ Access other advertiser data

This is where Supabase RLS becomes important: database authorization should be based on explicit row-level policies and least-privilege grants. ([Supabase][3])

---

# 🏢 ADVERTISER FLOW

Khimji logs in.

They see:

```text
KHIMJI DASHBOARD
```

```text
Ganesh Puja Campaign

Total Bottles:
22,000

Scans:
12,000

Game Completions:
8,000

Verified Claims:
2,000

Coupons Redeemed:
350
```

They can see only:

```text
their organization

their campaigns

their offers

their claims
```

Not:

```text
DN Homes

Other advertiser data
```

---

# 👑 MASTER ADMIN

Master Admin sees everything.

```text
EVENTS

VENUES

ADVERTISERS

CAMPAIGNS

BATCHES

VOLUNTEERS

SCANS

CLAIMS

COUPONS
```

---

# ⚡ THE NEXT.JS MONOLITH

Now technically.

I agree with your decision:

# ONE NEXT.JS MONOLITH

```text
NEXT.JS
│
├── Public Scan App
│
├── Admin Dashboard
│
├── Advertiser Dashboard
│
├── Venue Dashboard
│
├── Volunteer Portal
│
├── Server Actions
│
├── API Routes
│
└── Supabase Integration
```

This is exactly where a monolith makes sense.

Next.js App Router is file-system based and supports Server Components, Suspense, and Server Functions, making it suitable for keeping these related application surfaces in one application. ([Next.js][4])

---

# 📁 FOLDER ARCHITECTURE

I would start with this:

```text
src/

├── app/
│
│   ├── scan/
│   │   └── [batchCode]/
│   │       └── page.tsx
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── events/
│   │   ├── venues/
│   │   ├── organizations/
│   │   ├── campaigns/
│   │   ├── batches/
│   │   └── volunteers/
│   │
│   ├── advertiser/
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── claims/
│   │   └── coupons/
│   │
│   ├── venue/
│   │   ├── dashboard/
│   │   └── live/
│   │
│   ├── volunteer/
│   │   ├── assignments/
│   │   └── delivery/
│   │
│   ├── api/
│   │   ├── coupons/
│   │   └── webhooks/
│   │
│   └── login/
│
├── components/
│
│   ├── scan/
│   ├── admin/
│   ├── advertiser/
│   ├── venue/
│   ├── volunteer/
│   └── ui/
│
├── features/
│
│   ├── campaigns/
│   ├── batches/
│   ├── claims/
│   ├── coupons/
│   └── venues/
│
├── lib/
│
│   ├── supabase/
│   ├── auth/
│   ├── permissions/
│   └── validation/
│
└── types/
```

---

# 🔥 MY MOST IMPORTANT RECOMMENDATION

## DO NOT START CODING THE SCAN SCREEN YET.

I know the scan screen feels exciting.

But the scan screen is the **last part of the business chain**.

First, we must establish:

```text
WHO?
```

↓

```text
WHO OWNS WHAT?
```

↓

```text
WHAT EXISTS?
```

↓

```text
WHERE DOES IT HAPPEN?
```

↓

```text
WHO CAN ACCESS IT?
```

Only then:

```text
WHAT DOES THE CUSTOMER SCAN?
```

---

# 🧱 THE BUILD ORDER I WOULD USE

## PHASE 1 — Foundation

### Entity #1

# USERS, ROLES & AUTHORIZATION

```text
auth.users

profiles

organizations

organization_members
```

---

## Entity #2

# EVENTS

```text
events
```

For now:

```text
Ganesh Puja 2026
```

---

## Entity #3

# VENUES

```text
venues
```

Ganesh Pandals.

---

## Entity #4

# ADVERTISERS

Using:

```text
organizations
```

---

## Entity #5

# CAMPAIGNS

```text
campaigns

campaign_venues
```

---

## Entity #6

# OFFERS

```text
campaign_offers
```

---

## Entity #7

# BOTTLE PRODUCTION

```text
bottle_batches

batch_allocations
```

---

## Entity #8

# VOLUNTEER OPERATIONS

```text
volunteer_assignments

delivery_confirmations
```

---

## Entity #9

# QR SCAN

```text
scan_logs
```

---

## Entity #10

# CONSUMERS

```text
consumers
```

---

## Entity #11

# CLAIMS

```text
claims
```

---

## Entity #12

# COUPONS

```text
coupons
```

---

# 🏆 MY FINAL ARCHITECTURAL VERDICT

For **KULTUR Ganesh Puja Phase 1**, I would lock this:

```text
                    🕉️ GANESH PUJA EVENT
                              │
                              │
                  ┌───────────┴───────────┐
                  │                       │
               VENUES                  CAMPAIGNS
                  │                       │
                  │                       │
            VENUE ORGANIZER          ADVERTISER
                  │                       │
                  └───────────┬───────────┘
                              │
                       BOTTLE BATCH
                              │
                              ▼
                         GENERIC QR
                              │
                              ▼
                          CUSTOMER
                              │
                              ▼
                         SCAN EVENT
                              │
                              ▼
                        GANESH EXPERIENCE
                              │
                              ▼
                          PHONE OTP
                              │
                              ▼
                            CLAIM
                              │
                              ▼
                           COUPON
                              │
                              ▼
                          REDEMPTION
                              │
                              ▼
                         ANALYTICS
```

# 🚀 What I think we should do next

We should now **slowly design Entity #1 from absolute basics**:

# `USERS → ORGANIZATIONS → MEMBERS → ROLES → PERMISSIONS`

Not code yet.

First, we decide the **exact database relationships**:

* What is a user?
* What is an organization?
* Can one user belong to multiple organizations?
* How does a Kultur admin differ from an advertiser?
* How does a Venue Organizer get access to only one Pandal?
* How do volunteers work?
* What exact roles do we need?
* Do we use roles or granular permissions?

**That is the real foundation of the entire Kultur monolith.**

And yes, I would build it with **Next.js + Supabase**, using proper relational foreign keys and RLS rather than trusting frontend route checks alone. ([Supabase][2])

[1]: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs?utm_source=chatgpt.com "Use Supabase with Next.js | Supabase Docs"
[2]: https://supabase.com/docs/guides/database/tables?utm_source=chatgpt.com "Tables and Data | Supabase Docs"
[3]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"
[4]: https://nextjs.org/docs/app?utm_source=chatgpt.com "Next.js Docs: App Router | Next.js"

see KULTUR_V1_SIMFIVE.md next
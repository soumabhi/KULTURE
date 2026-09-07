YES. **Now we stop adding random features and lock the actual architecture.**

Based on everything we've discussed, I would build **KULTUR Phase 1 as a modular monolith**:

> **One Next.js application + one Supabase backend + one PostgreSQL database.**
>
> No microservices. No unnecessary queues. No sports mode. No multiple event types.
>
> **Only Ganesh Puja first.**

And I would structure the business like this.

---

# 🕉️ KULTUR PHASE 1 — THE ACTUAL SYSTEM

## First: What are we actually building?

We are building a system that connects:

**KULTUR**
→ **Company/Sponsor**
→ **Campaign**
→ **Ganesh Puja Event**
→ **Locations/Venues**
→ **Bottle Production Batches**
→ **Volunteers**
→ **QR Scan**
→ **Consumer Experience**
→ **Phone Verification**
→ **Offer**
→ **Data Collection**
→ **Analytics**

The important thing is:

# THESE ARE NOT ALL THE SAME THING.

That was the biggest architectural question we needed to solve.

---

# 🧠 THE CORE HIERARCHY

I would design it like this:

```text
KULTUR
│
├── Companies
│
│   ├── Sponsor Company
│   │
│   └── Venue Organization
│
├── Events
│
│   └── Ganesh Puja 2026
│
├── Locations
│
│   ├── Saheed Nagar
│   ├── Rasulgarh
│   └── Other Pandal Locations
│
├── Campaigns
│
│   └── Khimji Ganesh Puja Campaign
│
├── Campaign Deployments
│
│   ├── Saheed Nagar Pandal
│   ├── Rasulgarh Pandal
│   └── Other selected locations
│
└── Production Batches
    │
    ├── Batch A
    ├── Batch B
    └── Batch C
```

---

# 🚨 VERY IMPORTANT CORRECTION

Earlier, we were mixing:

* Venue
* Event
* Location
* Campaign

These should **NOT** be the same entity.

Let's separate them properly.

---

# 1️⃣ EVENT

An **Event** is the larger occasion.

For Phase 1:

```text
Ganesh Puja 2026
```

Example:

```text
Event
──────────────────────
Name: Ganesh Puja 2026
City: Bhubaneswar
Start: 7 September
End: 17 September
Status: Active
```

Later:

```text
Ganesh Puja 2027
Durga Puja
Sports Tournament
College Fest
Concert
```

But for now:

# ONLY GANESH PUJA.

---

# 2️⃣ VENUE ORGANIZATION

A venue organization is the **organization responsible for a venue**.

For example:

```text
Saheed Nagar Ganesh Puja Committee
```

This is an organization.

It has people.

```text
Venue Organization
│
├── President
├── Organiser
├── Volunteer
└── Staff
```

So:

> ❌ Venue organisation is NOT a location.

It **manages a location**.

---

# 3️⃣ LOCATION

A location is the physical place.

Example:

```text
Saheed Nagar Pandal
```

It contains:

```text
Location
────────────────
Name
Address
Latitude
Longitude
Geofence Radius
```

Example:

```text
Saheed Nagar Pandal

Latitude: X
Longitude: Y

Radius:
200 meters
```

This becomes useful for volunteers later.

---

# 4️⃣ EVENT VENUE

Now comes an important relationship.

A location can exist permanently.

But it participates in a specific event.

So we create:

# EVENT VENUE

```text
Ganesh Puja 2026
        │
        │
        ▼
Saheed Nagar Pandal
```

Conceptually:

```text
EventVenue
──────────────────

Event:
Ganesh Puja 2026

Location:
Saheed Nagar Pandal

Venue Organization:
Saheed Nagar Committee
```

This gives us:

```text
EVENT
   │
   ├──── EVENT VENUE ──── LOCATION
   │              │
   │              └──── VENUE ORGANIZATION
```

This is much cleaner.

---

# 🎯 NOW THE SPONSOR SIDE

# 5️⃣ COMPANY

A company is any business entity in the system.

Examples:

```text
Khimji Jewellers
DN Homes
Some D2C Brand
```

For now:

```text
Company
```

We should not create separate database structures like:

```text
advertisers
sponsors
corporates
```

That becomes messy.

Instead:

```text
companies
```

Example:

```text
Company

id
name
logo
contact information
```

---

# 6️⃣ CAMPAIGN

A campaign is the **marketing agreement/objective**.

Example:

```text
Khimji Ganesh Puja 2026
```

It belongs to:

```text
Company
+
Event
```

So:

```text
Khimji Jewellers
       │
       ▼
Campaign
       │
       ▼
Ganesh Puja 2026
```

Example:

```text
Campaign

Name:
Khimji Ganesh Puja Offer

Sponsor:
Khimji Jewellers

Event:
Ganesh Puja 2026

Offer:
₹1500 off

Status:
Active
```

---

# 🔥 THE KEY RELATIONSHIP

A campaign may operate at multiple locations.

Example:

```text
Khimji Campaign
       │
       ├── Saheed Nagar
       │
       ├── Rasulgarh
       │
       └── Patia
```

Therefore we need:

# CAMPAIGN DEPLOYMENT

```text
CampaignDeployment
```

This connects:

```text
CAMPAIGN
      +
EVENT VENUE
```

---

# THE COMPLETE BUSINESS RELATIONSHIP

```text
                    COMPANY
                       │
                       │ sponsors
                       ▼
                    CAMPAIGN
                       │
                       │ runs during
                       ▼
                     EVENT
                       │
                       │ has
                       ▼
                  EVENT VENUE
                    /        \
                   /          \
                  ▼            ▼
              LOCATION    VENUE ORG
```

And:

```text
CAMPAIGN
    │
    │ deployed at
    ▼
CAMPAIGN DEPLOYMENT
    │
    ▼
EVENT VENUE
```

This is the architecture I would use.

---

# 🏭 NOW THE BOTTLE PRODUCTION SYSTEM

This is where Kultur becomes interesting.

The campaign does not directly create bottles.

Instead:

```text
CAMPAIGN DEPLOYMENT
        │
        ▼
PRODUCTION BATCH
```

Example:

```text
Khimji Campaign
        │
        ▼
Saheed Nagar Deployment
        │
        ▼
Batch #001
```

---

# 🧃 PRODUCTION BATCH

Example:

```text
Production Batch

Batch ID:
GAN26-KHIMJI-SN-001

Quantity:
10,000 bottles

Status:
PRINTED

QR:
https://kultur.live/scan/xxx
```

Every bottle in this batch has:

# THE SAME QR CODE.

That is completely okay.

---

# WHY?

Because the QR identifies:

```text
THE BATCH
```

Not:

```text
THE INDIVIDUAL BOTTLE
```

So:

```text
10,000 BOTTLES
       │
       │
       ▼
ONE QR
       │
       ▼
ONE BATCH
```

---

# 🚚 BATCH LIFECYCLE

A batch should move through states.

```text
DRAFT

↓

PLANNED

↓

PRINTED

↓

READY

↓

ASSIGNED

↓

IN_TRANSIT

↓

DELIVERED

↓

ACTIVE

↓

COMPLETED
```

Example:

```text
Master Admin
      │
      ▼
Creates Batch
      │
      ▼
Printing
      │
      ▼
Assign Location
      │
      ▼
Assign Volunteer
      │
      ▼
Volunteer Delivers
      │
      ▼
Batch Activated
      │
      ▼
Public Can Scan
```

---

# 👷 VOLUNTEERS

Volunteers should **not belong directly to a campaign forever**.

Instead:

```text
USER
 │
 ▼
VOLUNTEER PROFILE
 │
 ▼
ASSIGNMENT
```

Example:

```text
Abhishek
     │
     ▼
Volunteer
     │
     ▼
Assigned to:
Batch #001
```

Therefore:

# BATCH ASSIGNMENT

```text
Volunteer
       │
       ▼
Batch Assignment
       │
       ▼
Production Batch
```

This lets one volunteer deliver:

```text
Batch A
Batch B
Batch C
```

And one batch can potentially have:

```text
Primary Volunteer
Backup Volunteer
```

---

# 📍 DELIVERY

The volunteer arrives at the location.

They open:

```text
/volunteer
```

They see:

```text
YOUR TASK

Deliver:

Batch #001

Destination:

Saheed Nagar Pandal

Quantity:

10,000 bottles
```

Then:

```text
CONFIRM DELIVERY
```

The browser requests GPS.

```text
Volunteer GPS

        ↓

Compare with

Location GPS
```

Example:

```text
Volunteer:
20.2961, 85.8245

Venue:
20.2960, 85.8247
```

If inside radius:

```text
✓ Delivery Confirmed
```

Then:

```text
Batch Status:

DELIVERED
```

---

# 📱 NOW THE PUBLIC QR FLOW

This is the heart of KULTUR.

A person gets a bottle.

They see:

```text
SCAN & UNLOCK YOUR GANESH PUJA REWARD
```

They scan.

---

# QR URL

```text
kultur.live/scan/[batchPublicId]
```

Example:

```text
/scan/GAN26-KHIMJI-SN-001
```

The system:

```text
QR
 │
 ▼
Next.js
 │
 ▼
Find Batch
 │
 ▼
Find Campaign Deployment
 │
 ▼
Find Campaign
 │
 ▼
Find Sponsor
 │
 ▼
Find Event
 │
 ▼
Render Experience
```

---

# DATABASE RELATIONSHIP

```text
SCAN
 │
 ▼
PRODUCTION BATCH
 │
 ▼
CAMPAIGN DEPLOYMENT
 │
 ├───────────────┐
 ▼               ▼
CAMPAIGN      EVENT VENUE
 │               │
 ▼               ▼
COMPANY       LOCATION
                 │
                 ▼
            VENUE ORG
```

This means one QR automatically knows:

```text
Who sponsored it
Which event
Which location
Which campaign
Which offer
Which experience
```

---

# 🕉️ GANESH PUJA USER EXPERIENCE

Since Phase 1 is Ganesh Puja only, I would **not make a generic dynamic component system yet**.

That's overengineering.

Instead:

```text
Ganesh Puja Experience
```

One dedicated experience.

---

# USER FLOW

```text
SCAN QR
   │
   ▼
WELCOME SCREEN
   │
   ▼
GANESH PUJA EXPERIENCE
   │
   ▼
SPONSOR EXPERIENCE
   │
   ▼
MICRO GAME
   │
   ▼
UNLOCK OFFER
```

---

# SCREEN 1 — WELCOME

```text
🕉️

WELCOME TO
GANESH PUJA 2026

Saheed Nagar

Presented by:

KHIMJI JEWELLERS

[ EXPLORE ]
```

---

# SCREEN 2 — EVENT EXPERIENCE

This is where we can include:

```text
Ganesh Puja
Information

↓

Venue Information

↓

Sponsor Branding

↓

Interactive Experience
```

---

# SCREEN 3 — GAME

For Phase 1:

# Catch The Modak

```text
🎮

CATCH THE MODAK

Score:
0

Time:
30 Seconds
```

The game finishes.

---

# SCREEN 4 — REWARD

```text
🎉 CONGRATULATIONS

You unlocked:

₹1500 OFF

from

KHIMJI JEWELLERS
```

Button:

```text
CLAIM OFFER
```

---

# 📞 NOW DATA COLLECTION

This is where the user becomes a lead.

But we must distinguish:

# SCAN ≠ LEAD

Very important.

---

# SCAN

A scan means:

```text
Someone opened the QR.
```

We record:

```text
Scan

Batch
Campaign
Location
Timestamp
```

Potentially:

```text
Anonymous device/session information
```

But we should be careful with privacy.

---

# LEAD

A lead means:

```text
User intentionally wants the offer.
```

They enter:

```text
Phone Number
```

---

# THE CLAIM FLOW

```text
USER
 │
 ▼
ENTER PHONE
 │
 ▼
OTP VERIFICATION
 │
 ▼
SUCCESS
 │
 ▼
CREATE LEAD
 │
 ▼
GENERATE OFFER
```

---

# 🚨 IMPORTANT: OTP SHOULD COME BEFORE THE LEAD

I would **not** do this:

```text
Phone
 ↓
Create Lead
 ↓
Send OTP
```

Instead:

```text
Phone

↓

Send OTP

↓

Verify OTP

↓

Create Lead
```

Why?

Because otherwise your database becomes filled with:

```text
Fake Numbers
Typos
Bots
Unverified Users
```

---

# AFTER OTP

The backend does:

```text
Is this phone already claimed?
```

Query:

```text
campaign_id
+
phone
```

If:

```text
YES
```

Then:

```text
You already claimed this offer.
```

If:

```text
NO
```

Then:

```text
Create Lead
```

---

# THE ACTUAL UNIQUENESS RULE

Earlier we discussed:

```text
One coupon per phone per batch
```

I would change that.

For Kultur, I think the better rule is:

# ONE CLAIM PER PHONE PER CAMPAIGN

Because imagine:

```text
Khimji Campaign

Saheed Nagar Batch
Rasulgarh Batch
Patia Batch
```

If the same person scans bottles at three locations, should they get:

```text
3 identical Khimji offers?
```

Probably not.

So:

```text
UNIQUE:

campaign_id + phone
```

Not:

```text
batch_id + phone
```

This is a crucial architecture improvement.

---

# 🧾 OFFER / VOUCHER

Once verified:

```text
Lead Created
     │
     ▼
Voucher Generated
```

Example:

```text
KULTUR-KHIMJI-8F2K9X
```

But I would create a separate table.

Do not put everything directly inside `leads`.

Instead:

```text
LEAD
 │
 ▼
VOUCHER
```

---

# WHY?

Because a lead and a voucher are different things.

A person might later have:

```text
Lead
 │
 ├── Voucher
 │
 └── Future Voucher
```

Even if Phase 1 allows only one.

So:

```text
Lead
──────

Person who gave consent
```

and:

```text
Voucher
──────

Offer instrument issued to them
```

---

# COMPLETE CONSUMER FLOW

```text
               🧃 BOTTLE
                  │
                  ▼
                 QR
                  │
                  ▼
           /scan/batch-id
                  │
                  ▼
              SCAN LOG
                  │
                  ▼
          GANESH EXPERIENCE
                  │
                  ▼
             PLAY GAME
                  │
                  ▼
            UNLOCK OFFER
                  │
                  ▼
           ENTER PHONE
                  │
                  ▼
              OTP
                  │
                  ▼
          VERIFIED IDENTITY
                  │
                  ▼
              CREATE LEAD
                  │
                  ▼
           GENERATE VOUCHER
                  │
                  ▼
             SHOW OFFER
```

---

# 📊 NOW THE DATA ARCHITECTURE

I would divide the database into logical domains.

---

# DOMAIN 1 — IDENTITY

```text
users
profiles
roles
```

Supabase Auth handles:

```text
Authentication
```

Our database handles:

```text
Authorization
```

Example:

```text
auth.users
      │
      ▼
profiles
```

---

# DOMAIN 2 — ORGANIZATIONS

```text
companies

venue_organizations
```

Later, we could unify these.

But for Phase 1, clarity is better.

---

# DOMAIN 3 — EVENT STRUCTURE

```text
events

locations

event_venues
```

Relationship:

```text
EVENT
  │
  ▼
EVENT VENUE
  │
  ├──── LOCATION
  │
  └──── VENUE ORGANIZATION
```

---

# DOMAIN 4 — MARKETING

```text
campaigns

campaign_deployments

offers
```

Relationship:

```text
COMPANY
   │
   ▼
CAMPAIGN
   │
   ▼
CAMPAIGN DEPLOYMENT
   │
   ▼
EVENT VENUE
```

---

# DOMAIN 5 — PRODUCTION

```text
production_batches

batch_assignments
```

```text
CAMPAIGN DEPLOYMENT
        │
        ▼
PRODUCTION BATCH
        │
        ▼
VOLUNTEER ASSIGNMENT
```

---

# DOMAIN 6 — CONSUMER

```text
scan_sessions

leads

vouchers

voucher_redemptions
```

---

# THE FULL DATABASE MAP

```text
                         USERS
                           │
                           ▼
                        PROFILES
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
            VOLUNTEER          ADMIN/STAFF


COMPANY
   │
   ▼
CAMPAIGN ──────────────────────────┐
   │                               │
   ▼                               │
CAMPAIGN DEPLOYMENT                │
   │                               │
   ▼                               │
EVENT VENUE                        │
   │                               │
   ├─────────────┐                 │
   ▼             ▼                 │
EVENT         LOCATION              │
                                    │
                                    ▼
                            PRODUCTION BATCH
                                    │
                                    ▼
                              QR SCAN SESSION
                                    │
                                    ▼
                              USER EXPERIENCE
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

# 👑 NOW THE ROLES

For Phase 1:

## 1. MASTER ADMIN

KULTUR internal team.

Can do everything.

```text
Create Companies

Create Events

Create Locations

Create Venue Organizations

Create Campaigns

Choose Locations

Create Batches

Assign Volunteers

View Data
```

---

# 2. VENUE ORGANIZER

Can manage their own venue.

```text
View venue

View campaign activity

Update announcement

View scans

Request water resupply
```

But they should NOT:

```text
Create companies

Change sponsor offers

Create campaigns

See all Kultur data
```

---

# 3. ADVERTISER

Sponsor company.

Can:

```text
View their campaigns

View scans

View leads

View vouchers

View redemption data
```

But cannot see:

```text
Other companies

Other campaigns
```

This is where Supabase RLS becomes important. Supabase explicitly supports row-level policies for multi-tenant data isolation, and recommends enabling RLS and granting only the minimum required privileges. ([Supabase][1])

---

# 4. VOLUNTEER

Can only:

```text
View assigned tasks

View assigned batches

Confirm delivery

Request help
```

That's it.

---

# 🔐 RBAC

```text
MASTER ADMIN
     │
     │ EVERYTHING
     ▼

────────────────────────────

VENUE ORGANIZER
     │
     │ THEIR VENUE
     ▼

────────────────────────────

ADVERTISER
     │
     │ THEIR COMPANY/CAMPAIGN
     ▼

────────────────────────────

VOLUNTEER
     │
     │ THEIR ASSIGNMENTS
     ▼
```

---

# 🏗️ THE NEXT.JS MONOLITH

I would use this structure:

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
│   │   ├── login/
│   │   └── callback/
│   │
│   ├── admin/
│   │   │
│   │   ├── dashboard/
│   │   ├── companies/
│   │   ├── events/
│   │   ├── locations/
│   │   ├── venue-organizations/
│   │   ├── campaigns/
│   │   ├── deployments/
│   │   ├── batches/
│   │   └── analytics/
│   │
│   ├── advertiser/
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── leads/
│   │   └── vouchers/
│   │
│   ├── venue/
│   │   ├── dashboard/
│   │   └── venue-status/
│   │
│   ├── volunteer/
│   │   ├── dashboard/
│   │   └── deliveries/
│   │
│   ├── api/
│   │   ├── otp/
│   │   ├── vouchers/
│   │   └── webhooks/
│   │
│   └── actions/
│
├── components/
│
│   ├── scan/
│   ├── ganesh/
│   ├── admin/
│   ├── advertiser/
│   ├── venue/
│   └── volunteer/
│
├── lib/
│
│   ├── supabase/
│   ├── auth/
│   ├── permissions/
│   ├── validation/
│   └── utils/
│
├── features/
│
│   ├── campaigns/
│   ├── batches/
│   ├── scans/
│   ├── leads/
│   └── vouchers/
│
└── supabase/
    │
    ├── migrations/
    └── seed.sql
```

---

# 💡 WHY THIS STRUCTURE?

Because we are making a:

# MODULAR MONOLITH

Not:

```text
Microservice Hell
```

We keep:

```text
One Codebase
```

But organize by business features.

```text
Campaign Feature

Batch Feature

Scan Feature

Lead Feature

Voucher Feature
```

Later, if Kultur becomes huge:

```text
Scan Service

Analytics Service

Voucher Service
```

can be extracted.

But:

# NOT NOW.

---

# 🧠 THE MOST IMPORTANT ARCHITECTURAL PRINCIPLE

We should not prematurely build:

❌ Kafka
❌ Redis clusters
❌ Multiple backend services
❌ Kubernetes
❌ Separate worker infrastructure
❌ 50,000-request-per-second fantasies

Yet.

Phase 1 should work like:

```text
Next.js

        │

        ▼

Supabase

        │

        ├── PostgreSQL
        ├── Auth
        ├── Realtime
        └── Storage
```

That is enough to build and validate the business.

Supabase provides PostgreSQL as the foundation for its Auth, Storage, Realtime, and other features, which fits this monolith approach well. ([Supabase][2])

---

# 🚨 ONE CORRECTION TO OUR OLD ARCHITECTURE

I would **NOT use an in-memory telemetry queue**.

Because:

```text
Serverless instance restarts
```

↓

```text
Queue disappears
```

So for Phase 1:

```text
QR Scan

↓

Next.js

↓

Supabase Insert
```

Simple.

Once we actually have meaningful traffic, we can optimize.

---

# 🚀 PHASE 1 TECH STACK

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
```

## Backend

```text
Next.js Server Actions
Route Handlers
```

## Database

```text
Supabase PostgreSQL
```

## Authentication

```text
Supabase Auth
```

## Authorization

```text
Supabase RLS
```

Supabase recommends RLS for exposed data and emphasizes that service-role/secret keys must remain server-side because they bypass RLS. ([Supabase][1])

## Realtime

```text
Supabase Realtime
```

Only where actually useful.

## File Storage

```text
Supabase Storage
```

For:

```text
Sponsor logos

Campaign images

Venue images
```

---

# 🎯 THE FULL KULTUR PHASE 1 FLOW

```text
                         MASTER ADMIN
                              │
                              ▼
                       CREATE COMPANY
                              │
                              ▼
                         CREATE EVENT
                       Ganesh Puja 2026
                              │
                              ▼
                       CREATE LOCATIONS
                              │
                              ▼
                   ADD VENUE ORGANIZATION
                              │
                              ▼
                     CREATE EVENT VENUES
                              │
                              ▼
                       CREATE CAMPAIGN
                              │
                              ▼
                    SELECT EVENT VENUES
                              │
                              ▼
                    CREATE DEPLOYMENTS
                              │
                              ▼
                     CREATE BATCHES
                              │
                              ▼
                      PRINT BOTTLES
                              │
                              ▼
                     ASSIGN VOLUNTEERS
                              │
                              ▼
                       DELIVER BATCH
                              │
                              ▼
                         ACTIVATE
                              │
                              ▼
──────────────────────────────────────────────────

                         CONSUMER
                              │
                              ▼
                         SCAN QR
                              │
                              ▼
                    OPEN /scan/[batch]
                              │
                              ▼
                         LOG SCAN
                              │
                              ▼
                    GANESH EXPERIENCE
                              │
                              ▼
                          GAME
                              │
                              ▼
                       UNLOCK OFFER
                              │
                              ▼
                       PHONE + OTP
                              │
                              ▼
                         CREATE LEAD
                              │
                              ▼
                       CREATE VOUCHER
                              │
                              ▼
                       CUSTOMER CLAIMS
                              │
                              ▼
                        REDEMPTION

──────────────────────────────────────────────────

                        ADVERTISER
                              │
                              ▼
                         DASHBOARD
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
              SCANS         LEADS        VOUCHERS
```

---

# 🧱 NOW THE MOST IMPORTANT THING

We should **not start coding the entire system.**

That would be a mistake.

We should design and implement it in this order:

## STEP 1 — Identity & Roles

```text
users
profiles
roles
company memberships
venue memberships
```

---

## STEP 2 — Organization Model

```text
companies
venue organizations
```

---

## STEP 3 — Event Model

```text
events
locations
event venues
```

---

## STEP 4 — Campaign Model

```text
campaigns
campaign deployments
offers
```

---

## STEP 5 — Production

```text
production batches
volunteer assignments
delivery confirmation
```

---

## STEP 6 — QR Experience

```text
scan route
batch lookup
scan logging
Ganesh UI
```

---

## STEP 7 — Gamification

```text
Catch the Modak
```

---

## STEP 8 — Lead Claim

```text
Phone
OTP
Consent
Lead
```

---

## STEP 9 — Voucher

```text
Generate
Display
Verify
Redeem
```

---

## STEP 10 — Dashboards

```text
Admin
Advertiser
Venue
Volunteer
```

---

# 🔥 MY FINAL EXPERT DECISION

If I were the system architect responsible for KULTUR, I would lock this as our foundation:

> **Venue Organization belongs to an Event Venue relationship, not directly to a Campaign.**
>
> **Location is a physical place.**
>
> **Event is Ganesh Puja 2026.**
>
> **Campaign belongs to a Sponsor Company and runs during an Event.**
>
> **Campaign Deployment connects the Campaign to selected Event Venues.**
>
> **Production Batches belong to Campaign Deployments.**
>
> **The generic QR identifies the Batch.**
>
> **The Batch determines the entire customer experience.**
>
> **Phone verification creates the verified Lead.**
>
> **The Lead receives the Voucher.**
>
> **The Voucher can later be redeemed.**

# THIS is the backbone.

And honestly, **now we have enough clarity to start designing the actual database properly.**

## My recommendation for our next step:

# 🔴 ENTITY #1 — KULTUR USERS, PROFILES, ROLES & MEMBERSHIPS

We will design it **column by column**, including:

```text
auth.users
profiles
user_roles

company_memberships
venue_organization_memberships
```

Then we will understand **exactly why every table exists**, before writing a single line of SQL.

[1]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"
[2]: https://supabase.com/docs/guides/database/overview?utm_source=chatgpt.com "Database | Supabase Docs"

see KULTUR_V1_SIMSIX.md next
YES. Now I understand exactly where we are.

We have been designing **KULTUR from the ground up**, entity by entity. And now we should **stop adding random features** and lock the architecture into one coherent monolithic system.

I would build it like this.

# 🕉️ KULTUR V1 — GANESH PUJA ONLY

For now:

> **NO sports. NO concerts. NO generic multi-event complexity.**

We design everything specifically for the **Ganesh Puja bottle campaign**.

But we design the database cleanly enough that other event types can be added later.

---

# 1. FIRST: What are we actually building?

KULTUR is one application with three worlds:

```text
                    KULTUR SYSTEM
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   OPERATIONS          PARTNERS         CONSUMERS
        │                │                │
     Admin          Companies          QR Users
     Volunteers      Organisers
```

Technically:

```text
Next.js Monolith
      │
      ├── Admin System
      ├── Company System
      ├── Venue/Event System
      ├── Volunteer System
      ├── Production System
      ├── QR Scan System
      ├── Gamification System
      ├── Offer System
      └── Analytics System
                │
                ▼
          Supabase Backend
          ├── Auth
          ├── PostgreSQL
          ├── RLS
          ├── Realtime
          └── Storage
```

This is a perfectly reasonable direction for a single Next.js application backed by Supabase/Postgres. Next.js officially supports multi-tenant application patterns, while Supabase's PostgreSQL + RLS model is designed for granular access control. ([Next.js][1])

---

# 2. THE MOST IMPORTANT CORRECTION: VENUE ≠ EVENT ≠ CAMPAIGN

This was the question you asked earlier.

## What is a Venue Organiser?

A **Venue Organiser is a USER/ORGANIZATION connected to an EVENT**.

They are not the location itself.

Let's separate these properly.

---

# 🏢 COMPANY

Example:

```text
Khimji Jewellers
DN Homes
ABC Company
```

A company can become:

* Advertiser/Sponsor
* Campaign owner
* Offer provider

---

# 📍 LOCATION / VENUE

A physical place.

Example:

```text
Saheed Nagar
Unit-6
Nayapalli
Bhubaneswar
```

More specifically:

```text
Venue:
Saheed Nagar Ganesh Puja Ground

Coordinates:
Latitude
Longitude
```

A venue is a **physical location**.

---

# 🎉 EVENT

Something happening at that venue.

Example:

```text
Ganesh Puja 2026
```

So:

```text
Event
│
├── Name: Ganesh Puja 2026
├── Start Date
├── End Date
└── Festival Type: GANESH_PUJA
```

An event can have multiple venues.

```text
GANESH PUJA 2026
        │
        ├── Saheed Nagar
        │
        ├── Nayapalli
        │
        └── Unit-6
```

---

# 👥 VENUE ORGANISER

The people responsible for a particular venue/event.

Example:

```text
Saheed Nagar Ganesh Puja Committee
```

They are connected like this:

```text
USER
  │
  ▼
ORGANISATION
  │
  ▼
VENUE
  │
  ▼
EVENT
```

Or practically:

```text
Saheed Nagar Committee
        │
        │ manages
        ▼
Saheed Nagar Ganesh Puja Venue
        │
        │ hosts
        ▼
Ganesh Puja 2026
```

---

# 📢 CAMPAIGN

Now the advertiser comes in.

Example:

```text
Khimji Jewellers
```

They create a marketing campaign.

```text
Campaign:

"Khimji Ganesh Puja Offer 2026"
```

That campaign may target multiple venues.

```text
                    KHIMJI CAMPAIGN
                           │
             ┌─────────────┼─────────────┐
             │             │             │
       Saheed Nagar    Nayapalli      Unit-6
```

Therefore:

# 🔥 Campaign does NOT own a venue.

Instead:

```text
CAMPAIGN
    ↕
CAMPAIGN VENUES
    ↕
VENUES
```

This is a **many-to-many relationship**.

---

# 3. THE COMPLETE BUSINESS HIERARCHY

This is how I would model KULTUR.

```text
KULTUR
 │
 │
 ├─────────────────────────────────────┐
 │                                     │
 ▼                                     ▼
COMPANIES                           EVENTS
 │                                     │
 │                                     │
 │                              GANESH PUJA 2026
 │                                     │
 │                                     │
 ▼                                     ▼
CAMPAIGNS                         VENUES
 │                                     │
 │                              ┌──────┴──────┐
 │                              │             │
 │                           Venue A        Venue B
 │                              │             │
 │                              ▼             ▼
 │                          ORGANISERS    ORGANISERS
 │
 │
 ▼
CAMPAIGN DEPLOYMENTS
 │
 ├── Venue A
 │
 ├── Venue B
 │
 └── Venue C
       │
       ▼
     BATCHES
       │
       ▼
   PRODUCTION
       │
       ▼
    BOTTLES
       │
       ▼
   GENERIC QR
```

---

# 4. NOW THE REAL KULTUR FLOW

Let's build the entire chain.

## STEP 1 — ADMIN CREATES A COMPANY

Admin logs in.

```text
MASTER ADMIN
      │
      ▼
Create Company
```

Example:

```text
Company:
Khimji Jewellers

Industry:
Jewellery

Contact:
Marketing Manager
```

Database:

```text
companies
```

---

# STEP 2 — ADMIN CREATES GANESH PUJA EVENT

```text
Event:

Ganesh Puja 2026

City:
Bhubaneswar

Start:
September XX

End:
September XX
```

Database:

```text
events
```

For V1:

```text
event_type = GANESH_PUJA
```

We don't need:

```text
SPORTS
CONCERT
FOOTBALL
CRICKET
```

yet.

---

# STEP 3 — ADMIN CREATES VENUES

Example:

```text
Venue 1:
Saheed Nagar Ganesh Puja

Venue 2:
Nayapalli Ganesh Puja

Venue 3:
Unit-6 Ganesh Puja
```

Each venue contains:

```text
Name
Address
Latitude
Longitude
Geofence Radius
```

Database:

```text
venues
```

Relationship:

```text
Event
  │
  └──── has many ────► Venues
```

---

# STEP 4 — ADD VENUE ORGANISERS

Now we add the committee.

```text
Saheed Nagar Organiser

Name:
XYZ

Phone:
XXXX

Role:
VENUE_ORGANISER
```

Relationship:

```text
User
 │
 ▼
Venue Assignment
 │
 ▼
Venue
```

Important:

# ❌ Don't put `venue_id` directly everywhere.

Instead:

```text
venue_members
```

Because later one organiser could manage multiple venues.

```text
users

venue_members

venues
```

---

# 5. COMPANY CREATES A CAMPAIGN

Now:

```text
Khimji Jewellers
```

wants advertising.

Admin creates:

```text
Campaign:

Khimji Ganesh Puja Campaign 2026
```

It belongs to:

```text
Company
```

and is connected to:

```text
Event
```

So:

```text
COMPANY
   │
   ▼
CAMPAIGN
   │
   ▼
EVENT
```

Example:

```text
Khimji Jewellers
        │
        ▼
Khimji Ganesh Puja Campaign
        │
        ▼
Ganesh Puja 2026
```

---

# 6. ADMIN CHOOSES WHERE THE CAMPAIGN RUNS

Now:

```text
Campaign
       │
       ▼
Campaign Deployment
```

Example:

```text
Khimji Campaign

Deploy to:

✓ Saheed Nagar
✓ Nayapalli
✗ Unit-6
```

So we create:

```text
campaign_venues
```

Example:

| Campaign        | Venue        |
| --------------- | ------------ |
| Khimji Campaign | Saheed Nagar |
| Khimji Campaign | Nayapalli    |

This table is EXTREMELY important.

Because this is where the digital campaign meets the physical world.

---

# 7. NOW BATCH PRODUCTION

This is where bottles enter.

Let's say:

```text
Khimji Campaign
       │
       ▼
Saheed Nagar Deployment
       │
       ▼
10,000 Bottles
```

We create:

```text
Production Batch
```

Example:

```text
Batch ID:

KHI-SN-GANESH-001
```

Properties:

```text
Campaign
Venue
Quantity
Production Date
QR URL
Status
```

Example:

```text
Batch:

KHI-SN-001

Campaign:
Khimji Ganesh Puja

Venue:
Saheed Nagar

Quantity:
10,000

Status:
PRODUCED
```

---

# 8. THE QR CODE

Now remember our important decision.

# Every bottle does NOT need a unique QR.

All bottles in a production batch can have:

```text
THE SAME QR
```

Example:

```text
kultur.live/scan/KHI-SN-001
```

The bottle is therefore not the unique identity.

The:

```text
PHONE NUMBER + VERIFIED CLAIM
```

becomes the unique identity.

So:

```text
10,000 BOTTLES
      │
      ▼
ONE BATCH
      │
      ▼
ONE QR URL
```

This is much cheaper operationally.

---

# 9. PRODUCTION → VOLUNTEERS

After production:

```text
PRODUCTION BATCH
       │
       ▼
ASSIGN DELIVERY
       │
       ▼
VOLUNTEER
```

Example:

```text
Batch:
KHI-SN-001

Quantity:
10,000

Assigned Volunteer:
Abhishek

Destination:
Saheed Nagar
```

Database:

```text
batch_assignments
```

---

# 10. VOLUNTEER DELIVERY FLOW

Volunteer opens:

```text
/admin/volunteer
```

They see:

```text
TODAY'S TASK

────────────────

Batch:
KHI-SN-001

Destination:
Saheed Nagar

Quantity:
10,000 bottles

Status:
READY FOR DELIVERY
```

They arrive.

They click:

```text
CONFIRM DELIVERY
```

Browser requests location.

```text
Volunteer GPS
      │
      ▼
Latitude + Longitude
      │
      ▼
Compare with Venue
```

If within allowed radius:

```text
✓ DELIVERY VERIFIED
```

Then:

```text
Batch Status:

DELIVERED
```

---

# 11. SHOULD DELIVERY AUTOMATICALLY ACTIVATE THE CAMPAIGN?

I would say:

# NO.

This is important.

We need separate states.

```text
PRODUCED
    ↓
ASSIGNED
    ↓
IN_TRANSIT
    ↓
DELIVERED
    ↓
ACTIVE
    ↓
ENDED
```

Why?

Because bottles may arrive at:

```text
2 PM
```

but Ganesh Puja activity starts:

```text
6 PM
```

So:

```text
DELIVERED ≠ ACTIVE
```

Venue organiser or Admin activates it.

---

# 12. VENUE ORGANISER ACTIVATES

Venue organiser opens:

```text
/admin/venue
```

They see:

```text
GANESH PUJA 2026

Saheed Nagar

Khimji Campaign

Batch:
KHI-SN-001

Status:
READY
```

At the correct time:

```text
ACTIVATE CAMPAIGN
```

Then:

```text
Batch = ACTIVE
```

Now the QR is live.

---

# 13. USER SCANS BOTTLE

Now the real magic starts.

```text
USER
 │
 │ scans QR
 ▼

kultur.live/scan/KHI-SN-001
 │
 ▼
NEXT.JS
```

The server resolves:

```text
Batch
 ↓
Campaign
 ↓
Company
 ↓
Venue
 ↓
Event
```

So from ONE batch ID:

```text
KHI-SN-001
```

we can discover the entire context.

```text
KHI-SN-001
     │
     ▼
Production Batch
     │
     ▼
Khimji Campaign
     │
     ├── Khimji Jewellers
     │
     ├── Ganesh Puja 2026
     │
     └── Saheed Nagar
```

🔥 This is why relational design matters.

---

# 14. THE USER SCAN SCREEN

For V1, the screen should be:

```text
┌─────────────────────────────┐
│                             │
│       KULTUR                │
│                             │
│   KHIMJI JEWELLERS          │
│                             │
│  🕉 GANESH PUJA 2026        │
│                             │
│ Saheed Nagar Pandal         │
│                             │
│ ─────────────────────────   │
│                             │
│  LIVE PUJA INFORMATION      │
│                             │
│  Crowd: MODERATE            │
│                             │
│  Next Aarti: 7:30 PM        │
│                             │
│ ─────────────────────────   │
│                             │
│       🎮 GAME               │
│                             │
│    CATCH THE MODAK          │
│                             │
│                             │
└─────────────────────────────┘
```

For now:

# ONE EXPERIENCE.

```text
GANESH PUJA EXPERIENCE
```

No dynamic sports UI yet.

---

# 15. VENUE ORGANISER CONTROLS LIVE INFORMATION

The organiser can update:

```text
Crowd Level

LOW
MEDIUM
HIGH
```

Also:

```text
Announcement

"Aarti starts in 15 minutes"
```

This belongs to:

```text
Venue + Event
```

NOT the campaign.

Why?

Because:

```text
Crowd status
```

is venue information.

It is not Khimji information.

So:

```text
VENUE
   │
   ▼
LIVE VENUE STATUS
```

---

# 16. THE GAME

For V1:

# 🎮 CATCH THE MODAK

User scans.

Then:

```text
SCAN
  ↓
GANESH PUJA SCREEN
  ↓
PLAY GAME
  ↓
GAME COMPLETED
  ↓
CLAIM OFFER
```

The game itself should not initially be deeply tied to the database.

The campaign configuration simply says:

```text
experience_type:

GANESH_PUJA
```

Then:

```typescript
if (experienceType === "GANESH_PUJA") {
  renderGaneshExperience()
}
```

But because V1 is ONLY Ganesh Puja, we can keep this even simpler.

No unnecessary component factory yet.

---

# 17. USER WANTS THE OFFER

User completes game.

```text
🎉 Congratulations!

You unlocked a Khimji offer.
```

Then:

```text
CLAIM OFFER
```

---

# 18. PHONE NUMBER

The user enters:

```text
+91 9876543210
```

But before creating anything:

```text
PHONE
  │
  ▼
NORMALIZE
  │
  ▼
CHECK CAMPAIGN
  │
  ▼
ALREADY CLAIMED?
```

Query conceptually:

```text
campaign_id + phone_number
```

This is better than:

```text
batch_id + phone_number
```

# Why?

Imagine the same campaign runs at:

```text
Saheed Nagar
Nayapalli
Unit-6
```

If we use:

```text
batch_id
```

then one person could:

```text
Scan Saheed Nagar bottle
Claim

Scan Nayapalli bottle
Claim again
```

That may not be what the sponsor wants.

Instead:

```text
ONE PHONE
+
ONE CAMPAIGN
=
ONE CLAIM
```

🔥 This is an important architecture improvement.

So:

```text
UNIQUE

(campaign_id, phone_number)
```

not necessarily:

```text
(batch_id, phone_number)
```

unless the business specifically wants one reward per batch.

---

# 19. OTP

Then:

```text
PHONE
  ↓
SEND OTP
  ↓
USER ENTERS OTP
  ↓
VERIFY OTP
  ↓
CREATE CLAIM
```

After successful verification:

```text
Generate Voucher
```

Example:

```text
KULTUR-KHIMJI-A7F2X9
```

---

# 20. THE CLAIM

I would actually separate:

```text
LEAD
```

and:

```text
VOUCHER
```

Earlier architecture mixed them.

I would NOT do that.

Instead:

# LEAD

Represents the person.

```text
lead
```

Example:

```text
ID
Phone
Hashed Phone
Created At
```

Then:

# CAMPAIGN PARTICIPATION

Represents:

```text
This lead participated in this campaign.
```

Then:

# VOUCHER

Represents:

```text
This campaign issued this offer.
```

So:

```text
LEAD
 │
 │ participates
 ▼
CAMPAIGN PARTICIPATION
 │
 │ receives
 ▼
VOUCHER
```

This is much cleaner.

---

# 21. THE FINAL CUSTOMER FLOW

```text
                    🕉 KULTUR GANESH PUJA
                              │
                              ▼
                       PHYSICAL BOTTLE
                              │
                              ▼
                         GENERIC QR
                              │
                              ▼
                         /scan/batchId
                              │
                              ▼
                    VALIDATE BATCH ACTIVE?
                              │
                              ▼
                     LOAD GANESH EXPERIENCE
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
        VENUE INFORMATION                SPONSOR BRAND
              │                               │
              └───────────────┬───────────────┘
                              │
                              ▼
                         PLAY GAME
                              │
                              ▼
                       GAME COMPLETED
                              │
                              ▼
                        CLAIM OFFER
                              │
                              ▼
                       ENTER PHONE
                              │
                              ▼
                         VERIFY OTP
                              │
                              ▼
                   CHECK PREVIOUS CLAIM
                              │
                    ┌─────────┴─────────┐
                    │                   │
                   YES                  NO
                    │                   │
                    ▼                   ▼
             SHOW EXISTING          CREATE LEAD
               VOUCHER                  │
                                        ▼
                                  PARTICIPATION
                                        │
                                        ▼
                                   ISSUE VOUCHER
                                        │
                                        ▼
                                    🎉 SUCCESS
```

---

# 22. WHAT DATA ARE WE COLLECTING?

Now comes the data architecture.

We should NOT just randomly log everything.

There are different categories.

## A. SCAN DATA

```text
Batch
Campaign
Venue
Timestamp
```

Potentially:

```text
Anonymous Session ID
```

Not necessarily IP address permanently.

---

## B. ENGAGEMENT DATA

```text
Game Started
Game Completed
Score
Time Spent
```

Example:

```text
Session:

Started:
6:20 PM

Game Completed:
6:21 PM

Duration:
42 seconds
```

---

## C. LEAD DATA

After consent and OTP:

```text
Phone
Verification Status
```

---

## D. CAMPAIGN DATA

```text
Total Scans
Unique Sessions
Game Starts
Game Completions
Claims
Verified Claims
Vouchers Redeemed
```

---

# 23. OFFER REDEMPTION

User gets:

```text
KULTUR-KHIMJI-A7F2X9
```

Now:

```text
Khimji Employee
       │
       ▼
KULTUR PARTNER PORTAL
       │
       ▼
Enter Voucher
       │
       ▼
VALID?
       │
       ├── INVALID
       │
       ├── ALREADY REDEEMED
       │
       └── VALID
              │
              ▼
        MARK REDEEMED
```

The update must be atomic.

Meaning:

```text
Two employees
       │
       ├── click redeem
       │
       ▼
DATABASE
       │
       ▼
ONLY ONE WINS
```

We should not do:

```text
SELECT

then

UPDATE
```

carelessly.

We will later design a proper database function/transaction for redemption.

---

# 24. THE ACTUAL DATABASE ARCHITECTURE

This is my recommended V1 entity structure.

## 🧑 USERS

```text
profiles
```

---

## 🏢 COMPANIES

```text
companies
```

---

## 👥 COMPANY MEMBERS

```text
company_members
```

Example:

```text
Khimji
 │
 ├── Marketing Manager
 │
 └── Campaign Executive
```

---

# 🎉 EVENTS

```text
events
```

For V1:

```text
Ganesh Puja 2026
```

---

# 📍 VENUES

```text
venues
```

---

# 👥 VENUE MEMBERS

```text
venue_members
```

---

# 📢 CAMPAIGNS

```text
campaigns
```

---

# 📍 CAMPAIGN DEPLOYMENTS

```text
campaign_venues
```

or I would actually name it:

```text
campaign_deployments
```

Because it represents more than just a relationship.

It can contain:

```text
Campaign
Venue
Allocated Quantity
Start Time
End Time
Status
```

So:

```text
campaign_deployments
```

is better.

---

# 🏭 PRODUCTION

```text
production_batches
```

---

# 🚚 DELIVERY

```text
batch_deliveries
```

---

# 🙋 VOLUNTEERS

Volunteers are users.

So no separate:

```text
volunteers
```

table initially.

Use:

```text
profiles
```

plus:

```text
role = VOLUNTEER
```

---

# 🎮 SCAN SESSION

```text
scan_sessions
```

This is important.

Every scan creates a session.

```text
Scan
 │
 ▼
Session
```

Then all user activity connects to it.

---

# 📊 ENGAGEMENT

```text
engagement_events
```

Examples:

```text
SCAN_OPENED

GAME_STARTED

GAME_COMPLETED

OFFER_OPENED

PHONE_SUBMITTED

OTP_VERIFIED

VOUCHER_ISSUED
```

---

# 📱 LEADS

```text
leads
```

---

# 🤝 CAMPAIGN PARTICIPATION

```text
campaign_participations
```

---

# 🎟️ VOUCHERS

```text
vouchers
```

---

# 🔴 LIVE VENUE STATUS

```text
venue_live_status
```

Example:

```text
Crowd:
MEDIUM

Announcement:
"Aarti begins at 7 PM"
```

---

# 25. THE DATABASE RELATIONSHIP

Here is the core.

```text
                         PROFILES
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
      ADMIN           COMPANY MEMBER     VENUE MEMBER
                            │                  │
                            ▼                  ▼
                        COMPANIES           VENUES
                            │                  │
                            │                  ▼
                            │               EVENTS
                            │                  │
                            └──────┬───────────┘
                                   │
                                   ▼
                               CAMPAIGNS
                                   │
                                   ▼
                         CAMPAIGN DEPLOYMENTS
                                   │
                                   ▼
                           PRODUCTION BATCHES
                                   │
                                   ▼
                               QR SCANS
                                   │
                                   ▼
                            SCAN SESSIONS
                                   │
                                   ▼
                           ENGAGEMENT EVENTS
                                   │
                                   ▼
                                 LEADS
                                   │
                                   ▼
                       CAMPAIGN PARTICIPATION
                                   │
                                   ▼
                                VOUCHERS
```

---

# 26. MONOLITH ARCHITECTURE

Now the actual code.

I would NOT create microservices.

For V1:

# ONE NEXT.JS APPLICATION

```text
kultur/
│
├── app/
│
├── components/
│
├── features/
│
├── lib/
│
├── supabase/
│
└── types/
```

Next.js App Router is suitable for this style because Server Components, Server Functions, layouts, and route handlers can live in the same application structure. ([Next.js][2])

---

# 27. MY RECOMMENDED FOLDER ARCHITECTURE

```text
kultur/

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
│   │   ├── login/
│   │   └── callback/
│   │
│   ├── admin/
│   │
│   │   ├── dashboard/
│   │   │
│   │   ├── companies/
│   │   │
│   │   ├── events/
│   │   │
│   │   ├── venues/
│   │   │
│   │   ├── campaigns/
│   │   │
│   │   ├── production/
│   │   │
│   │   ├── batches/
│   │   │
│   │   └── volunteers/
│   │
│   ├── company/
│   │
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── offers/
│   │   └── vouchers/
│   │
│   ├── venue/
│   │
│   │   ├── dashboard/
│   │   └── live/
│   │
│   ├── volunteer/
│   │
│   │   ├── dashboard/
│   │   └── deliveries/
│   │
│   └── api/
│       │
│       ├── vouchers/
│       │
│       └── webhooks/
│
├── features/
│
│   ├── auth/
│   │
│   ├── companies/
│   │
│   ├── events/
│   │
│   ├── venues/
│   │
│   ├── campaigns/
│   │
│   ├── production/
│   │
│   ├── deliveries/
│   │
│   ├── scans/
│   │
│   ├── engagement/
│   │
│   ├── leads/
│   │
│   ├── vouchers/
│   │
│   └── ganesh-puja/
│
├── components/
│
│   ├── ui/
│   │
│   ├── layouts/
│   │
│   └── shared/
│
├── lib/
│
│   ├── supabase/
│   │
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   │
│   ├── auth/
│   │
│   ├── permissions/
│   │
│   └── utils/
│
├── supabase/
│
│   ├── migrations/
│   │
│   ├── seed.sql
│   │
│   └── tests/
│
└── types/
```

---

# 28. WHY `FEATURES/`?

I strongly recommend this.

Don't do:

```text
components/
  campaign/
  campaign2/
  campaignNew/
```

Eventually it becomes chaos.

Instead:

```text
features/campaigns/
```

contains everything related to campaigns.

```text
features/
└── campaigns/
    │
    ├── components/
    │
    ├── actions/
    │
    ├── queries/
    │
    ├── types.ts
    │
    └── validators.ts
```

So:

```text
CAMPAIGN = ONE DOMAIN
```

Everything stays together.

---

# 29. SUPABASE ARCHITECTURE

We should use:

```text
Supabase Auth
       +
Supabase PostgreSQL
       +
Supabase RLS
       +
Supabase Realtime
       +
Supabase Storage
```

But don't put everything in the browser.

Important security rule:

```text
Browser
   │
   │ publishable key
   ▼
Supabase
   │
   │ RLS
   ▼
Allowed Data
```

Privileged operations:

```text
Browser
   │
   ▼
Next.js Server Action
   │
   ▼
Supabase Server Client
```

Service-role credentials must remain server-side; Supabase explicitly warns that they bypass RLS. ([Supabase][3])

---

# 30. RBAC — HOW I WOULD DO ROLES

I would NOT do this:

```text
user.role = ADMIN
```

as the only architecture.

Because users can have multiple responsibilities.

Instead:

```text
profiles
```

plus:

```text
user_roles
```

Example:

```text
Abhishek

Roles:

✓ MASTER_ADMIN
✓ VOLUNTEER
```

Potentially:

```text
USER
 │
 ▼
USER ROLES
 │
 ├── MASTER_ADMIN
 │
 ├── COMPANY_MEMBER
 │
 ├── VENUE_ORGANISER
 │
 └── VOLUNTEER
```

But permissions depend on context.

Example:

```text
Company Member
```

should only see:

```text
their company.
```

Venue organiser should only see:

```text
their venue.
```

This is where membership tables become important.

---

# 31. SECURITY MODEL

```text
MASTER ADMIN

→ Everything
```

```text
COMPANY MEMBER

→ Own Company
→ Own Campaigns
→ Own Vouchers
→ Own Analytics
```

```text
VENUE ORGANISER

→ Assigned Venue
→ Live Status
→ Venue Information
```

```text
VOLUNTEER

→ Assigned Deliveries
→ Assigned Batches
```

```text
PUBLIC USER

→ Active Scan Page Only
```

RLS is exactly the layer we should use for tenant and row-level restrictions, with explicit grants and policies rather than assuming RLS alone handles everything. ([Supabase][4])

---

# 32. WHAT I WOULD NOT BUILD YET

This is VERY important.

## ❌ No microservices

No:

```text
Auth Service
QR Service
Voucher Service
Analytics Service
```

One monolith.

---

## ❌ No external queue initially

Don't prematurely add:

```text
Kafka
RabbitMQ
Redis Streams
```

First get the product working.

---

## ❌ No complicated CRM integration

Later.

---

## ❌ No Google Ads API

Later.

---

## ❌ No Meta API

Later.

---

## ❌ No Sports System

Later.

---

## ❌ No generic UI component engine

For V1:

```text
GANESH PUJA EXPERIENCE
```

Period.

---

# 33. WHAT WE SHOULD BUILD FIRST

I would NOT immediately start coding random pages.

We should build in this exact order.

## PHASE 1 — FOUNDATION

```text
1. Next.js Setup

2. Supabase Setup

3. Authentication

4. Profiles

5. Roles

6. RLS
```

---

## PHASE 2 — ORGANIZATIONAL STRUCTURE

```text
7. Companies

8. Company Members

9. Events

10. Venues

11. Venue Members
```

---

## PHASE 3 — COMMERCIAL ENGINE

```text
12. Campaigns

13. Campaign Deployments

14. Offers

15. Campaign Status
```

---

## PHASE 4 — PHYSICAL OPERATIONS

```text
16. Production Batches

17. Batch Assignments

18. Volunteer Deliveries

19. Delivery Confirmation

20. Batch Activation
```

---

## PHASE 5 — CUSTOMER EXPERIENCE

```text
21. /scan/[batchId]

22. Batch Validation

23. Ganesh Puja Screen

24. Venue Live Status

25. Catch The Modak
```

---

## PHASE 6 — CONVERSION

```text
26. Phone Input

27. OTP

28. Lead

29. Campaign Participation

30. Voucher Generation
```

---

## PHASE 7 — REDEMPTION

```text
31. Company Dashboard

32. Voucher Lookup

33. Voucher Validation

34. Atomic Redemption
```

---

## PHASE 8 — ANALYTICS

```text
35. Scan Metrics

36. Engagement Metrics

37. Claim Metrics

38. Redemption Metrics
```

---

# 🔥 MY EXPERT DECISION

If I were the lead system architect for KULTUR, I would lock this as our foundation:

```text
                    KULTUR V1
             GANESH PUJA 2026 ONLY

                         │
                         ▼
                  SUPABASE AUTH
                         │
                         ▼
                      PROFILES
                         │
                         ▼
                     USER ROLES
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
      COMPANIES        VENUES        VOLUNTEERS
          │              │
          │              ▼
          │            EVENTS
          │              │
          └──────┬───────┘
                 │
                 ▼
             CAMPAIGNS
                 │
                 ▼
        CAMPAIGN DEPLOYMENTS
                 │
                 ▼
          PRODUCTION BATCH
                 │
                 ▼
             DELIVERY
                 │
                 ▼
              ACTIVATION
                 │
                 ▼
             GENERIC QR
                 │
                 ▼
          /scan/[batchId]
                 │
                 ▼
       GANESH PUJA EXPERIENCE
                 │
                 ▼
            CATCH MODAK
                 │
                 ▼
             OTP GATE
                 │
                 ▼
               LEAD
                 │
                 ▼
      CAMPAIGN PARTICIPATION
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

# 🚨 ONE THING I WOULD CHANGE FROM OUR OLD DESIGN

I would **not start with the UI**.

I would start with the **relational entities and database relationships**.

Because once these are correct:

```text
User
Company
Event
Venue
Campaign
Deployment
Batch
Scan
Lead
Voucher
```

the entire application naturally follows.

If these are wrong, we'll spend weeks rewriting everything.

## So our next move should be:

# **ENTITY #1 — USERS, AUTH, ROLES & MEMBERSHIPS**

We will design it from absolute basics:

* What exactly is a User?
* What does Supabase Auth store?
* What does `profiles` store?
* Why separate `user_roles`?
* What is a Company Member?
* What is a Venue Member?
* How does one user have multiple roles?
* How will RLS enforce access?
* What exact SQL tables should exist?
* What exact relationships should they have?

**And we should go extremely slowly and understand every column and relationship before moving to Entity #2.**

[Next.js multi-tenant architecture guide](https://nextjs.org/docs/app/guides/multi-tenant?utm_source=chatgpt.com) · [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com) · [Supabase + Next.js guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs?utm_source=chatgpt.com)

[1]: https://nextjs.org/docs/app/guides/multi-tenant?utm_source=chatgpt.com "Guides: Multi-tenant | Next.js"
[2]: https://nextjs.org/docs/app?utm_source=chatgpt.com "Next.js Docs: App Router | Next.js"
[3]: https://supabase.com/docs/guides/database/secure-data?utm_source=chatgpt.com "Securing your data | Supabase Docs"
[4]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"

SEE KULTUR_V1_SIM.md
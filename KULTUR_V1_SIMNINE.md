# YES BRO. HERE IS THE COMPLETE KULTUR PHASE-1 ARCHITECTURE.

I am going to give you **one coherent blueprint you can paste into your project planning document and immediately start building from**.

I also want to fix some earlier overengineering.

We are building:

> **KULTUR Phase 1 = Ganesh Puja-focused, modular monolith using Next.js + Supabase.**

Not a giant generic AdTech empire yet.

The architecture must work beautifully for **Ganesh Puja first**, while leaving clean extension points for future events.

Current Supabase guidance supports this combination well: Next.js App Router with cookie-based SSR Auth, separate browser/server clients, PostgreSQL relationships, and RLS for access control. ([Supabase][1])

---

# 🏛️ THE KULTUR MASTER ARCHITECTURE

## The entire system in one sentence

```text
KULTUR
manages organizations
        ↓
organizations have users
        ↓
venue organizers organize events
        ↓
events happen at venues
        ↓
KULTUR creates commercial campaigns
        ↓
advertisers sponsor campaigns
        ↓
campaigns activate at events/venues
        ↓
activations receive production batches
        ↓
batches generate QR URLs
        ↓
customers scan QR
        ↓
customer plays Ganesh experience
        ↓
customer claims reward
        ↓
phone is verified
        ↓
voucher is generated
        ↓
data is collected
        ↓
advertiser sees results
```

---

# FIRST: THE BIG DECISION

## What are we actually building?

We are **NOT building a water bottle management system**.

We are building:

# **A physical-to-digital campaign operating system.**

For Phase 1:

```text
Physical World
────────────────────────

Ganesh Puja
    ↓
Pandal
    ↓
KULTUR bottles
    ↓
QR code


Digital World
────────────────────────

Scan
    ↓
Ganesh experience
    ↓
Game
    ↓
Reward
    ↓
Phone verification
    ↓
Voucher
    ↓
Campaign analytics
```

The bottle is simply the **physical entry point**.

---

# 🧠 THE MASTER ENTITY MAP

Here is the complete system:

```text
                         ┌──────────────┐
                         │   PROFILES   │
                         │   (Humans)   │
                         └──────┬───────┘
                                │
                                │ membership
                                ▼
                  ┌──────────────────────────┐
                  │ ORGANIZATION_MEMBERS     │
                  └────────────┬─────────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │  ORGANIZATIONS  │
                      └────────┬────────┘
                               │
          ┌────────────────────┼─────────────────────┐
          │                    │                     │
          ▼                    ▼                     ▼
       KULTUR              ADVERTISER        VENUE ORGANIZER
          │                    │                     │
          │                    │                     │
          │                    │                     ▼
          │                    │                   EVENTS
          │                    │                     │
          │                    │                     ▼
          │                    │                   VENUES
          │                    │                     │
          └────────────────────┼─────────────────────┘
                               │
                               ▼
                          CAMPAIGNS
                               │
                               ▼
                     CAMPAIGN ACTIVATIONS
                               │
                               ▼
                       PRODUCTION BATCHES
                               │
                               ▼
                           QR SCANS
                               │
                               ▼
                         CONSUMERS
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
                  CLAIMS                LEADS
                    │
                    ▼
                 VOUCHERS
                    │
                    ▼
                 REDEMPTION
```

---

# ENTITY 1 — USERS & IDENTITY

# Table: `profiles`

Supabase Auth manages authentication.

We do **not** create our own password system.

```text
auth.users
     │
     │ 1:1
     ▼
profiles
```

Supabase's current Next.js guidance uses cookie-based sessions for SSR and separate browser/server clients. ([Supabase][1])

---

## `profiles`

```text
profiles
────────────────────────────

id

full_name

email

phone

avatar_url

status

created_at

updated_at
```

### Example

```text
id:
abc-123

full_name:
Abhishek Hansdak

email:
abhishek@example.com
```

---

## Important rule

# `profiles` does NOT contain business roles.

❌ Don't do:

```text
profiles

role = ADMIN
```

Because roles depend on context.

A person can be:

```text
KULTUR → ADMIN

DN Homes → ADVERTISER

Another organization → MEMBER
```

Therefore:

# Identity and authorization must be separated.

---

# ENTITY 1B — ORGANIZATIONS

# Table: `organizations`

An organization is a real-world entity.

Examples:

```text
KULTUR

DN Homes

Khimji Jewellers

Saheed Nagar Ganesh Puja Committee
```

---

## Schema

```text
organizations
────────────────────────────

id

name

slug

organization_type

logo_url

email

phone

status

created_at

updated_at
```

---

## Organization types

For Phase 1:

```text
KULTUR

ADVERTISER

VENUE_ORGANIZER
```

That's enough.

Do not add:

```text
SUPER_PARTNER
REGIONAL_DIRECTOR
MEDIA_NETWORK
SUB_VENDOR
```

We don't need that yet.

---

# ENTITY 1C — ORGANIZATION MEMBERS

This is the relationship:

```text
USER
  │
  ▼
ORGANIZATION_MEMBER
  │
  ▼
ORGANIZATION
```

---

## Table

```text
organization_members
────────────────────────────

id

organization_id

user_id

role

status

created_at

updated_at
```

---

# Roles

For Phase 1:

```text
KULTUR_OWNER

KULTUR_ADMIN

KULTUR_OPERATOR

KULTUR_VOLUNTEER

ADVERTISER_ADMIN

ADVERTISER_VIEWER

VENUE_ADMIN

VENUE_OPERATOR
```

---

# Example

| User     | Organization           | Role             |
| -------- | ---------------------- | ---------------- |
| Abhishek | KULTUR                 | KULTUR_OWNER     |
| Rahul    | KULTUR                 | KULTUR_VOLUNTEER |
| Amit     | DN Homes               | ADVERTISER_ADMIN |
| Suresh   | Saheed Nagar Committee | VENUE_ADMIN      |

---

# 🔥 IMPORTANT DESIGN DECISION

Do we need a separate `roles` table?

## Phase 1: NO.

Use a PostgreSQL enum.

```text
organization_role
```

Why?

Because our roles are currently fixed and understood.

Later, if KULTUR needs a custom permissions engine:

```text
roles
permissions
role_permissions
```

We can introduce it.

**Do not build that now.**

---

# ENTITY 2 — EVENTS

Now we answer:

> What exactly is Ganesh Puja?

Ganesh Puja is an **event**.

But:

# `Ganesh Puja 2026` is a specific event instance.

---

## Table

```text
events
────────────────────────────

id

organizer_organization_id

name

slug

event_type

description

starts_at

ends_at

status

created_at

updated_at
```

---

# Example

```text
Event:

Saheed Nagar Ganesh Puja 2026
```

Organizer:

```text
Saheed Nagar Ganesh Puja Committee
```

---

# Event types

For Phase 1:

```text
GANESH_PUJA
```

Yes.

Seriously.

We don't need:

```text
SPORTS
CONCERT
COLLEGE_FEST
CRICKET
MARATHON
```

yet.

We can add those later.

---

# Why separate 2026 and 2027?

Because:

```text
Saheed Nagar Ganesh Puja 2026
```

and:

```text
Saheed Nagar Ganesh Puja 2027
```

have different:

- dates
- campaigns
- sponsors
- announcements
- analytics
- production batches

Therefore:

```text
EVENT 2026
```

is different from:

```text
EVENT 2027
```

---

# ENTITY 3 — VENUES

This answers:

> Where does the event physically happen?

# Table: `venues`

```text
venues
────────────────────────────

id

name

slug

address

city

state

country

latitude

longitude

geo_radius_meters

created_at

updated_at
```

---

# Example

```text
Venue:

Saheed Nagar Pandal
```

Location:

```text
Bhubaneswar
Odisha
India
```

---

# The relationship

```text
ORGANIZATION
      │
      │ organizes
      ▼
EVENT
      │
      │ happens at
      ▼
VENUE
```

---

# IMPORTANT

A venue is not an event.

A venue can exist across years.

Example:

```text
Saheed Nagar Pandal
```

can host:

```text
Ganesh Puja 2026

Ganesh Puja 2027

Ganesh Puja 2028
```

Therefore:

# Don't put venue details inside `events`.

---

# ENTITY 3B — EVENT VENUES

Can an event have multiple locations?

Yes.

Example:

```text
Ganesh Puja Festival
      │
      ├── Main Pandal
      │
      ├── Entry Gate
      │
      └── Cultural Stage
```

So instead of putting:

```text
events.venue_id
```

I recommend:

# `event_venues`

```text
event_venues
────────────────────────────

id

event_id

venue_id

label

is_primary

created_at
```

---

# Example

```text
Saheed Nagar Ganesh Puja 2026

        │
        ├── Main Pandal
        │
        ├── Food Area
        │
        └── Entry Gate
```

For Phase 1, you may have only one.

But this table gives us flexibility **without making the system complicated**.

---

# ENTITY 4 — CAMPAIGNS

Now we enter the commercial world.

# What is a campaign?

A campaign is:

> **A commercial marketing operation managed by KULTUR for an advertiser.**

Example:

```text
DN Homes
     ×
Ganesh Puja 2026
```

---

# Table

```text
campaigns
────────────────────────────

id

kultur_organization_id

advertiser_organization_id

name

slug

description

status

starts_at

ends_at

created_by

created_at

updated_at
```

---

# Campaign status

```text
DRAFT

PLANNED

ACTIVE

PAUSED

COMPLETED

CANCELLED
```

---

# Example

```text
Campaign:

DN Homes Ganesh Puja 2026
```

Relationship:

```text
KULTUR
   │
   │ manages
   ▼
CAMPAIGN
   │
   │ sponsored by
   ▼
DN HOMES
```

---

# ENTITY 5 — CAMPAIGN ACTIVATIONS

🔥 This is one of the most important entities.

A campaign is the overall commercial agreement.

An activation is:

> **Where and when that campaign is physically running.**

---

## Table

```text
campaign_activations
────────────────────────────

id

campaign_id

event_id

event_venue_id

name

status

starts_at

ends_at

created_at

updated_at
```

---

# Example

```text
Campaign:
DN Homes Ganesh Puja 2026

                │
                ▼

Activation:
Saheed Nagar Main Pandal
```

---

# Why do we need this?

Because one campaign might run at:

```text
DN Homes Campaign

       │
       ├── Saheed Nagar
       │
       ├── Rasulgarh
       │
       └── Patia
```

Each one is a different activation.

---

# This gives us:

```text
Campaign
      │
      ▼
Activation
      │
      ▼
Physical Location
```

---

# ENTITY 6 — CAMPAIGN CONFIGURATION

Now:

> What does the customer actually see?

We need campaign-specific content.

I would **not put everything directly in campaigns**.

Instead:

# `campaign_configs`

```text
campaign_configs
────────────────────────────

id

campaign_id

title

subtitle

sponsor_name

sponsor_logo_url

hero_image_url

theme_config

experience_type

game_type

reward_config

created_at

updated_at
```

---

# For Ganesh Puja

```text
experience_type:

GANESH_PUJA
```

Game:

```text
CATCH_MODAK
```

---

# Example

```text
Title:
Celebrate Ganesh Puja with DN Homes

Game:
Catch the Modak

Reward:
₹X promotional offer
```

---

# IMPORTANT

Use configuration.

Don't create:

```text
GaneshPage.tsx

DNHomesGaneshPage.tsx

KhimjiGaneshPage.tsx
```

Instead:

```text
ScanPage

    ↓

Campaign Config

    ↓

Dynamic Components
```

---

# ENTITY 7 — PRODUCTION BATCHES

Now we enter the physical bottle system.

# Table: `production_batches`

```text
production_batches
────────────────────────────

id

campaign_activation_id

batch_code

quantity

qr_token

status

printed_at

activated_at

distributed_at

created_at

updated_at
```

---

# Example

```text
Batch:

GN26-SN-001
```

Quantity:

```text
10,000 bottles
```

---

# Relationship

```text
Campaign
     │
     ▼
Activation
     │
     ▼
Production Batch
     │
     ▼
10,000 Bottles
```

---

# The QR decision

We already decided:

# ONE BATCH = ONE GENERIC QR

Example:

```text
https://kultur.live/scan/GN26-SN-001
```

All 10,000 bottles can have:

```text
THE SAME QR
```

---

# Why?

Because individual QR printing adds operational complexity.

Instead:

```text
Bottle identity
❌

Human identity
✅
```

Uniqueness happens after the user verifies themselves.

---

# Batch statuses

```text
PLANNED

PRINTING

READY

DELIVERED

ACTIVE

PAUSED

EXHAUSTED

CLOSED
```

---

# ENTITY 8 — VOLUNTEER OPERATIONS

Volunteers are users belonging to KULTUR.

```text
PROFILE

   │

   ▼

ORGANIZATION MEMBER

   │

   ▼

KULTUR_VOLUNTEER
```

---

But we need tasks.

# Table: `volunteer_assignments`

```text
volunteer_assignments
────────────────────────────

id

volunteer_user_id

production_batch_id

event_venue_id

task_type

status

assigned_at

completed_at

created_at
```

---

# Example

```text
Volunteer:
Rahul

Task:

Deliver

Batch:
GN26-SN-001

To:

Saheed Nagar Main Pandal
```

---

# Task types

Phase 1:

```text
DELIVERY

SETUP

RESUPPLY
```

That's enough.

---

# ENTITY 9 — DELIVERY CONFIRMATION

We should not immediately build complicated geofencing.

Let's structure for it.

# Table: `batch_deliveries`

```text
batch_deliveries
────────────────────────────

id

production_batch_id

delivered_by

latitude

longitude

delivered_at

notes

status
```

---

# Later

We can validate:

```text
Volunteer GPS

       ↓

Venue coordinates

       ↓

Distance calculation

       ↓

Inside geo radius?

YES → Allow confirmation

NO → Reject
```

---

# For Phase 1

I recommend:

### GPS optional.

Don't let GPS block operations on day one.

Festival ground networks and permissions can fail.

Instead:

```text
Delivery Confirmation

GPS if available

+ Timestamp

+ Volunteer identity
```

---

# ENTITY 10 — PUBLIC SCANS

Now the public system begins.

Customer scans:

```text
/scan/[batchCode]
```

---

# Request flow

```text
PHONE

   ↓

QR SCAN

   ↓

/scan/GN26-SN-001

   ↓

Production Batch

   ↓

Campaign Activation

   ↓

Campaign

   ↓

Campaign Config

   ↓

Ganesh Experience
```

---

# Table: `scan_sessions`

I recommend this instead of only `scan_logs`.

Why?

Because a customer interaction is more useful than just:

```text
IP + timestamp
```

---

## Table

```text
scan_sessions
────────────────────────────

id

production_batch_id

campaign_activation_id

started_at

last_seen_at

completed_at

user_agent

referrer

ip_hash

status
```

---

# Status

```text
STARTED

ENGAGED

GAME_COMPLETED

CLAIM_STARTED

CLAIM_COMPLETED

ABANDONED
```

---

# Important privacy decision

I would avoid storing raw IP addresses unless absolutely necessary.

Instead:

```text
ip_hash
```

This is cleaner.

---

# Scan flow

```text
SCAN

  ↓

Create Scan Session

  ↓

Render Experience

  ↓

User Plays Game

  ↓

Update Session

GAME_COMPLETED
```

---

# ENTITY 11 — EXPERIENCE EVENTS

This is our analytics system.

Instead of adding 100 columns:

```text
game_started

game_finished

reward_clicked

modal_opened
```

We create:

# `experience_events`

```text
experience_events
────────────────────────────

id

scan_session_id

event_type

event_data

created_at
```

---

# Example events

```text
PAGE_VIEWED

GAME_STARTED

GAME_COMPLETED

REWARD_OPENED

PHONE_SUBMITTED

OTP_SENT

OTP_VERIFIED

CLAIM_COMPLETED
```

---

# Example

```json
{
  "score": 840,
  "duration_seconds": 31
}
```

---

# This is extremely useful.

Your dashboard can later calculate:

```text
Scans

↓

Game Starts

↓

Game Completions

↓

Claim Starts

↓

Phone Verifications

↓

Voucher Claims
```

That is our funnel.

---

# ENTITY 12 — CLAIMS

Now the customer wants the reward.

We need to separate:

# Customer

# Claim

# Voucher

Don't put everything inside `leads`.

---

# Table: `claims`

```text
claims
────────────────────────────

id

campaign_id

production_batch_id

scan_session_id

phone_e164

phone_hash

verification_status

status

claimed_at

created_at
```

---

# Phone format

Always normalize:

```text
+919876543210
```

This is E.164.

---

# IMPORTANT SECURITY

I would **not store phone data carelessly**.

We need two values:

```text
phone_e164
```

Used operationally.

And:

```text
phone_hash
```

Used for identity matching.

---

# But don't assume hashing makes the whole data problem disappear.

Phone numbers are personal data.

Hashing is useful for matching, but it is not automatically a complete privacy solution.

We should later define:

- consent
- retention
- deletion
- advertiser access

For now, architect the data correctly.

---

# Claim status

```text
STARTED

PHONE_SUBMITTED

OTP_SENT

VERIFIED

VOUCHER_ISSUED

FAILED
```

---

# ENTITY 13 — OTP VERIFICATION

We should not build OTP ourselves.

Eventually:

```text
User enters phone

      ↓

OTP Provider

      ↓

OTP verification

      ↓

KULTUR receives success

      ↓

Claim verified
```

---

# Important

Don't store:

```text
OTP = 123456
```

in your database.

No.

The OTP provider manages that.

Our system stores:

```text
verification_status
```

and provider reference IDs if necessary.

---

# Table

Optional:

```text
verification_attempts
────────────────────────────

id

claim_id

provider

provider_reference

status

created_at
```

---

# ENTITY 14 — LEADS

Now:

> What is a lead?

A lead is not exactly the same thing as a claim.

A lead represents a customer relationship created for an advertiser.

For Phase 1, we can connect them.

# Table: `leads`

```text
leads
────────────────────────────

id

campaign_id

claim_id

phone_e164

phone_hash

consent_marketing

consent_timestamp

source

created_at
```

---

# Why separate claims and leads?

Because later:

A person might:

```text
Claim reward
```

but not consent to:

```text
Marketing communication
```

Those are different things.

This is an important design distinction.

---

# For Phase 1

You may simplify the UI.

But database architecture should preserve:

```text
Reward Consent

≠

Marketing Consent
```

---

# ENTITY 15 — VOUCHERS

Now we generate the actual reward.

# Table

```text
vouchers
────────────────────────────

id

campaign_id

claim_id

lead_id

voucher_code

status

issued_at

expires_at

redeemed_at

created_at
```

---

# Example

```text
KULTUR-DNH-GN26-A7X92K
```

---

# Voucher statuses

```text
ISSUED

ACTIVE

REDEEMED

EXPIRED

CANCELLED
```

---

# The fundamental relationship

```text
SCAN SESSION

      ↓

CLAIM

      ↓

LEAD

      ↓

VOUCHER
```

---

# ENTITY 16 — VOUCHER REDEMPTION

Do not simply do:

```text
voucher.is_redeemed = true
```

We need an audit trail.

# Table

```text
voucher_redemptions
────────────────────────────

id

voucher_id

redeemed_by_user_id

redemption_channel

redeemed_at

notes
```

---

# Why?

Because:

```text
Who redeemed it?

When?

Which staff member?

Which channel?
```

should be known.

---

# Redemption channels

```text
PARTNER_DASHBOARD

API

MANUAL
```

---

# The redemption flow

```text
Customer shows code

       ↓

Staff searches code

       ↓

Voucher found

       ↓

Atomic validation

       ↓

ACTIVE?

       ↓

YES

       ↓

Redeem

       ↓

Create redemption record

       ↓

Voucher becomes REDEEMED
```

---

# ENTITY 17 — VENUE LIVE DATA

For Ganesh Puja, the venue organizer needs live controls.

I recommend:

# `venue_live_updates`

```text
venue_live_updates
────────────────────────────

id

event_venue_id

update_type

title

message

priority

starts_at

ends_at

created_by

created_at
```

---

# Examples

```text
CROWD_STATUS

ANNOUNCEMENT

RESUPPLY_ALERT
```

---

# Crowd example

```text
LOW

MEDIUM

HIGH
```

---

# Better architecture

Don't create:

```text
events.crowd_status
```

because crowd status changes.

Instead:

```text
venue_live_updates
```

creates a history.

---

# ENTITY 18 — CAMPAIGN REWARDS

Don't hardcode rewards inside React.

# Table

```text
campaign_rewards
────────────────────────────

id

campaign_id

name

description

reward_type

terms

valid_from

valid_until

status

created_at
```

---

# Example

```text
DN Homes Ganesh Offer

Type:
PROMOTIONAL

Valid:
September 2026
```

---

# Then:

```text
Campaign

    ↓

Reward

    ↓

Claim

    ↓

Voucher
```

---

# ENTITY 19 — ANALYTICS

We already collect data through:

```text
scan_sessions

experience_events

claims

leads

vouchers

voucher_redemptions
```

Therefore:

# Don't create an analytics table yet.

Your dashboard queries the actual system.

Example:

```text
Total Scans

COUNT(scan_sessions)
```

---

```text
Games Completed

COUNT(experience_events)
WHERE event_type = GAME_COMPLETED
```

---

```text
Claims

COUNT(claims)
WHERE verification_status = VERIFIED
```

---

```text
Vouchers Redeemed

COUNT(voucher_redemptions)
```

---

# 🔥 THE COMPLETE DATA RELATIONSHIP

This is the final ERD concept.

```text
┌─────────────────┐
│   auth.users    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    profiles     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ organization_members    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────┐
│  organizations  │
└───────┬─────────┘
        │
        ├──────────────┐
        │              │
        ▼              ▼
   advertisers    venue organizers
                       │
                       ▼
                    events
                       │
                       ▼
                 event_venues
                       │
                       ▼
                    venues


KULTUR + ADVERTISER
          │
          ▼
      campaigns
          │
          ├─────────────► campaign_configs
          │
          ├─────────────► campaign_rewards
          │
          ▼
 campaign_activations
          │
          ▼
 production_batches
          │
          ▼
   scan_sessions
          │
          ▼
 experience_events
          │
          ▼
       claims
          │
          ├──────────► verification_attempts
          │
          ▼
        leads
          │
          ▼
       vouchers
          │
          ▼
 voucher_redemptions
```

---

# 🏗️ NOW THE REAL MONOLITH ARCHITECTURE

We are using:

# Next.js + Supabase

```text
                    INTERNET
                        │
                        ▼
                 NEXT.JS MONOLITH
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
       PUBLIC          ADMIN         SERVER
       SCAN UI       DASHBOARDS      ACTIONS
         │              │              │
         └──────────────┼──────────────┘
                        │
                        ▼
                    SUPABASE
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
      AUTH          POSTGRES          STORAGE
```

---

# What does monolith mean here?

Everything is in one Next.js application.

```text
kultur/
```

contains:

```text
Public scan page

Admin dashboard

Advertiser dashboard

Venue dashboard

Volunteer portal

Server actions

Route handlers

Business logic
```

One deployment.

One codebase.

One Supabase backend.

---

# The recommended folder structure

```text
kultur/
│
├── app/
│
│   ├── (public)/
│   │
│   │   └── scan/
│   │       └── [batchCode]/
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
│   │   └── analytics/
│   │
│   ├── advertiser/
│   │
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── leads/
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
│   │   └── assignments/
│   │
│   └── api/
│       │
│       ├── voucher/
│       │   └── redeem/
│       │
│       └── webhooks/
│
├── components/
│
│   ├── ui/
│   │
│   ├── scan/
│   │
│   ├── games/
│   │
│   ├── campaign/
│   │
│   └── dashboards/
│
├── features/
│
│   ├── organizations/
│   ├── events/
│   ├── venues/
│   ├── campaigns/
│   ├── activations/
│   ├── production/
│   ├── scans/
│   ├── claims/
│   ├── vouchers/
│   └── analytics/
│
├── lib/
│
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   │
│   ├── auth/
│   │
│   └── utils/
│
├── actions/
│
│   ├── organizations.ts
│   ├── events.ts
│   ├── campaigns.ts
│   ├── batches.ts
│   ├── claims.ts
│   └── vouchers.ts
│
├── types/
│
├── supabase/
│
│   └── migrations/
│
└── middleware.ts
```

---

# 🔥 MY IMPORTANT ARCHITECTURE CHANGE

I recommend:

## Feature-based business logic.

Instead of this:

```text
components/
actions/
utils/
types/
```

becoming one massive mess.

We should organize important business domains:

```text
features/campaigns

features/claims

features/vouchers
```

Example:

```text
features/
└── campaigns/
    │
    ├── queries.ts
    ├── actions.ts
    ├── types.ts
    ├── validations.ts
    └── service.ts
```

This is much cleaner as the monolith grows.

---

# THE PUBLIC SCAN FLOW

Now let's build the most important flow.

```text
CUSTOMER

    │

    ▼

SCANS QR

    │

    ▼

/scan/[batchCode]

    │

    ▼

Find production batch

    │

    ▼

Find campaign activation

    │

    ▼

Find campaign

    │

    ▼

Find campaign configuration

    │

    ▼

Create scan session

    │

    ▼

RENDER GANESH EXPERIENCE
```

---

# Public UI

For Ganesh Puja:

```text
┌────────────────────────────┐
│                            │
│       KULTUR LOGO          │
│                            │
│       🪷 GANESH PUJA       │
│                            │
│   Welcome to the Pandal    │
│                            │
│     [ LIVE STATUS ]        │
│                            │
│     🎮 CATCH MODAK         │
│                            │
│       PLAY NOW             │
│                            │
│       SPONSORED BY         │
│        DN HOMES            │
│                            │
└────────────────────────────┘
```

---

# GAME FLOW

```text
Page Loaded

    ↓

Game Started

    ↓

experience_event

GAME_STARTED

    ↓

User Plays

    ↓

Game Finished

    ↓

experience_event

GAME_COMPLETED

    ↓

Reward unlocked
```

---

# CLAIM FLOW

```text
Reward

   ↓

Claim Now

   ↓

Enter Phone Number

   ↓

Validate

   ↓

OTP

   ↓

Verified

   ↓

Create Claim

   ↓

Create Lead

   ↓

Generate Voucher

   ↓

Display Voucher
```

---

# FRAUD PROTECTION

Since QR is generic:

```text
ONE QR
     ↓
10,000 BOTTLES
```

we cannot use bottle identity.

Instead:

# Claim identity is based on the verified phone.

Constraint:

```text
ONE VERIFIED PHONE
+
ONE CAMPAIGN
=
ONE CLAIM
```

Database concept:

```text
UNIQUE(campaign_id, phone_hash)
```

🔥

That is our main Phase-1 anti-repeat protection.

---

# BUT WHAT IF A USER SCANS AGAIN?

Allowed.

```text
Scan

Scan

Scan

Scan
```

No problem.

But:

```text
Claim again?

NO.
```

---

# DATABASE CONSTRAINT

Conceptually:

```sql
UNIQUE (campaign_id, phone_hash)
```

This protects against concurrent requests better than relying only on frontend logic.

---

# VOUCHER GENERATION

Generate only after:

```text
OTP VERIFIED
```

Then:

```text
CRYPTOGRAPHIC RANDOM CODE
```

Example:

```text
KULTUR-GN26-DNH-X72K9A
```

---

# Never generate vouchers in the frontend.

❌

```text
React component
    ↓
Math.random()
    ↓
Voucher
```

NO.

Instead:

```text
CLIENT

   ↓

SERVER ACTION

   ↓

VALIDATE

   ↓

DATABASE TRANSACTION

   ↓

GENERATE VOUCHER

   ↓

RETURN RESULT
```

---

# 🔒 AUTHORIZATION ARCHITECTURE

We have four major dashboards.

---

## 1. KULTUR ADMIN

Can:

```text
Create organizations

Create events

Create venues

Create campaigns

Create activations

Create batches

Assign volunteers

View everything
```

---

## 2. ADVERTISER

Can:

```text
View their campaigns

View campaign analytics

View eligible leads

View vouchers

Redeem vouchers
```

Cannot:

```text
View another advertiser

Create KULTUR organizations

Access volunteer operations
```

---

## 3. VENUE ORGANIZER

Can:

```text
View their events

View their venues

Post announcements

Update crowd status

Request resupply
```

Cannot:

```text
View advertiser data

View other venues

Access all KULTUR campaigns
```

---

## 4. VOLUNTEER

Can:

```text
View assignments

View assigned batches

Confirm delivery

Request help
```

Cannot:

```text
View campaign leads

View advertiser data

Create campaigns
```

---

# RLS STRATEGY

This is where Supabase becomes important.

RLS should protect data even if somebody tries to bypass your frontend.

Supabase explicitly recommends RLS and least-privilege access for exposed data; secret/service-role credentials must never be exposed to the frontend because they bypass RLS. ([Supabase][2])

---

# The principle

```text
Frontend Authorization
        +
Server Authorization
        +
Database RLS
```

Three layers.

---

# Never rely on:

```text
if (role === "admin")
```

in React alone.

That's only UI protection.

---

# Our actual model

```text
REQUEST

   ↓

Next.js Server

   ↓

Check User

   ↓

Check Organization Membership

   ↓

Check Role

   ↓

Supabase RLS

   ↓

DATABASE
```

---

# MULTI-TENANCY

Now let's understand our tenant boundaries.

## Advertiser tenant

DN Homes should see:

```text
DN Homes campaigns

DN Homes leads

DN Homes vouchers
```

Not:

```text
Khimji data
```

---

## Venue tenant

Saheed Nagar Committee sees:

```text
Saheed Nagar events

Saheed Nagar venues

Saheed Nagar live updates
```

---

# How does RLS know?

Through:

```text
auth.uid()
```

↓

```text
profiles
```

↓

```text
organization_members
```

↓

```text
organization_id
```

↓

authorized resources.

---

# PRODUCTION FLOW

This is how physical bottles enter.

```text
ADMIN

  ↓

Create Campaign

  ↓

Create Activation

  ↓

Create Production Batch

  ↓

Quantity = 10,000

  ↓

Generate Batch Code

GN26-SN-001

  ↓

Generate QR URL

/scan/GN26-SN-001

  ↓

Export QR artwork

  ↓

Printing

  ↓

Batch READY

  ↓

Volunteer assigned

  ↓

Delivered

  ↓

Batch ACTIVE
```

---

# VOLUNTEER FLOW

```text
Volunteer Login

      ↓

Dashboard

      ↓

Today's Assignments

      ↓

GN26-SN-001

      ↓

Deliver to:

Saheed Nagar

      ↓

Confirm Delivery

      ↓

GPS if available

      ↓

Batch becomes DELIVERED
```

Then:

```text
KULTUR Admin

or

automatic operational rule

      ↓

Batch ACTIVE
```

---

# IMPORTANT

I would NOT automatically activate the batch merely because delivery occurred.

Why?

Someone might:

```text
Deliver bottles

at 2 PM

Event starts

at 6 PM
```

We should support:

```text
DELIVERED

↓

WAITING

↓

ACTIVE
```

---

# LIVE VENUE FLOW

Venue organizer:

```text
Login

   ↓

My Event

   ↓

Live Controls
```

Controls:

```text
Crowd:

LOW

MEDIUM

HIGH
```

---

Also:

```text
Announcement:

"Aarti begins at 7 PM"
```

---

Customer scan page:

```text
Supabase Realtime

       ↓

Live update

       ↓

UI changes
```

---

# For Phase 1

Keep it simple.

Only:

```text
Crowd Status

Announcement
```

Do not add:

```text
Live police coordination

Emergency evacuation

AI crowd prediction
```

😂 Not yet, bro.

---

# ADVERTISER FLOW

```text
Advertiser Login

      ↓

Dashboard

      ↓

My Campaign

      ↓

Metrics
```

Metrics:

```text
Total Scans

Game Starts

Game Completions

Claim Attempts

Verified Claims

Vouchers Issued

Vouchers Redeemed
```

---

# Funnel

```text
100,000 scans

     ↓

70,000 game starts

     ↓

45,000 game completions

     ↓

20,000 claim starts

     ↓

15,000 verified claims

     ↓

8,000 redeemed
```

This is much more valuable than merely:

```text
QR scans = 100,000
```

---

# THE CORE BUSINESS DASHBOARD

KULTUR admin sees:

```text
ACTIVE EVENTS

ACTIVE CAMPAIGNS

ACTIVE BATCHES

TOTAL SCANS

VERIFIED CLAIMS

VOUCHERS ISSUED

VOUCHERS REDEEMED
```

---

# 🧩 DYNAMIC GANESH EXPERIENCE

Now let's solve frontend architecture.

Don't do:

```text
if campaign === DN Homes
```

No.

Instead:

```text
campaign_config
```

determines:

```text
theme

game

reward

sponsor

content
```

---

# Example configuration

Conceptually:

```json
{
  "experience": "GANESH_PUJA",
  "game": "CATCH_MODAK",
  "theme": "ganesh_2026",
  "reward": "DN_HOMES_OFFER"
}
```

---

# Component system

```text
ScanPage
    │
    ▼
ExperienceRenderer
    │
    ▼
GaneshPujaExperience
    │
    ├── GaneshHeader
    │
    ├── CrowdStatus
    │
    ├── Announcement
    │
    ├── CatchModakGame
    │
    └── RewardDrawer
```

---

# FUTURE EXTENSION

Later:

```text
ExperienceRenderer

       │

       ├── GANESH_PUJA
       │
       ├── SPORTS
       │
       ├── CONCERT
       │
       └── COLLEGE_FEST
```

But for now:

# Build only:

```text
GANESH_PUJA
```

---

# ⚡ CACHING ARCHITECTURE

I want to correct one earlier claim.

We should **not describe Next.js caching as permanent "RAM cache with zero DB load."**

In production, deployment topology and cache behavior matter.

Instead, our architecture should say:

```text
Campaign metadata
       ↓
Next.js cache where appropriate
       ↓
Supabase database
```

For public scan pages, optimize reads.

But **don't build an in-memory process-local cache as our production architecture**.

Why?

Because serverless instances may be:

```text
different

temporary

distributed
```

---

# Phase 1 recommendation

Initially:

```text
Supabase
+
Next.js server-side data access
+
careful caching/revalidation
```

That's enough.

Only introduce Redis or an external cache when metrics prove we need it.

---

# SCAN LOGGING

Do not overengineer queues on day one.

Phase 1:

```text
Scan request

   ↓

Render page

   ↓

Log asynchronously where possible
```

But ensure:

> Critical operations such as claims and vouchers are strongly consistent and transactional.

---

# PHASE 1

Simple:

```text
Next.js

↓

Supabase Postgres
```

---

# PHASE 2

If traffic demands it:

```text
Next.js

    ↓

Queue

    ↓

Worker

    ↓

Supabase
```

---

# DON'T BUILD THE QUEUE NOW.

Not until required.

---

# THE DATABASE TABLE LIST

Here is our complete list.

## Identity

```text
profiles
```

---

## Organization

```text
organizations

organization_members
```

---

## Event

```text
events

venues

event_venues
```

---

## Commercial

```text
campaigns

campaign_configs

campaign_rewards

campaign_activations
```

---

## Physical Operations

```text
production_batches

volunteer_assignments

batch_deliveries
```

---

## Consumer

```text
scan_sessions

experience_events

claims

verification_attempts

leads

vouchers

voucher_redemptions
```

---

## Live Venue

```text
venue_live_updates
```

---

# THE FINAL RELATIONSHIP

```text
PROFILE
   │
   ▼
ORGANIZATION MEMBER
   │
   ▼
ORGANIZATION


VENUE ORGANIZATION
   │
   ▼
EVENT
   │
   ▼
EVENT VENUE
   │
   ▼
VENUE


KULTUR
  +
ADVERTISER
      │
      ▼
   CAMPAIGN
      │
      ├── CONFIG
      │
      ├── REWARD
      │
      ▼
   ACTIVATION
      │
      ├────────► EVENT
      │
      └────────► EVENT VENUE
      │
      ▼
PRODUCTION BATCH
      │
      ▼
   QR SCAN
      │
      ▼
SCAN SESSION
      │
      ▼
EXPERIENCE EVENT
      │
      ▼
     CLAIM
      │
      ├── OTP
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

# 🗺️ THE COMPLETE GANESH PUJA EXAMPLE

Let's simulate the entire system.

---

## STEP 1 — KULTUR EXISTS

```text
Organization:

KULTUR
```

---

## STEP 2 — ADVERTISER JOINS

```text
Organization:

DN Homes
```

---

## STEP 3 — VENUE ORGANIZER JOINS

```text
Organization:

Saheed Nagar Ganesh Puja Committee
```

---

## STEP 4 — EVENT

```text
Saheed Nagar Ganesh Puja 2026
```

---

## STEP 5 — VENUE

```text
Saheed Nagar Main Pandal
```

---

## STEP 6 — CAMPAIGN

```text
DN Homes Ganesh Puja Campaign
```

---

## STEP 7 — ACTIVATION

```text
Campaign:

DN Homes Ganesh Puja

Location:

Saheed Nagar Main Pandal
```

---

## STEP 8 — BATCH

```text
GN26-SN-001

Quantity:

10,000 bottles
```

---

## STEP 9 — QR

Every bottle:

```text
kultur.live/scan/GN26-SN-001
```

---

## STEP 10 — CUSTOMER

Customer scans.

```text
QR

↓

Batch

↓

Activation

↓

Campaign

↓

Ganesh Experience
```

---

## STEP 11 — GAME

```text
Catch the Modak

↓

Game Complete
```

---

## STEP 12 — CLAIM

```text
Enter phone

↓

OTP

↓

Verified
```

---

## STEP 13 — DATABASE

```text
Claim created

↓

Lead created

↓

Voucher generated
```

---

## STEP 14 — CUSTOMER SEES

```text
KULTUR-GN26-DNH-A7X92K
```

---

## STEP 15 — REDEMPTION

Customer goes to advertiser.

```text
Staff Dashboard

↓

Enter Voucher

↓

Validate

↓

Redeem
```

---

# 🚀 BUILD ORDER

Now bro, **DO NOT randomly start coding all tables**.

Build in this order.

---

# SPRINT 1 — FOUNDATION

### Build:

```text
Next.js

Supabase

Auth

profiles

organizations

organization_members
```

Goal:

```text
Users can log in.

Users belong to organizations.

Roles work.
```

---

# SPRINT 2 — EVENTS

Build:

```text
events

venues

event_venues
```

Goal:

```text
KULTUR can register

Ganesh Puja 2026

and

Saheed Nagar Pandal.
```

---

# SPRINT 3 — CAMPAIGNS

Build:

```text
campaigns

campaign_configs

campaign_rewards

campaign_activations
```

Goal:

```text
KULTUR creates:

DN Homes Ganesh Campaign.
```

---

# SPRINT 4 — PRODUCTION

Build:

```text
production_batches

volunteer_assignments

batch_deliveries
```

Goal:

```text
Generate:

GN26-SN-001
```

---

# SPRINT 5 — PUBLIC SCAN

Build:

```text
/scan/[batchCode]
```

Goal:

```text
Scan QR

↓

Load campaign

↓

Render Ganesh UI
```

---

# SPRINT 6 — GAME

Build:

```text
CatchModakGame
```

Goal:

```text
Game completion unlocks reward.
```

---

# SPRINT 7 — CLAIM

Build:

```text
claims

OTP

leads
```

Goal:

```text
Verified phone.

One claim per campaign.
```

---

# SPRINT 8 — VOUCHERS

Build:

```text
vouchers

voucher_redemptions
```

Goal:

```text
Issue

↓

Validate

↓

Redeem.
```

---

# SPRINT 9 — DASHBOARDS

Build:

```text
KULTUR

Advertiser

Venue

Volunteer
```

---

# SPRINT 10 — ANALYTICS

Build:

```text
Scan Funnel

↓

Game Funnel

↓

Claim Funnel

↓

Redemption Funnel
```

---

# 🔒 WHAT WE ARE NOT BUILDING YET

This is extremely important.

## NOT PHASE 1:

❌ Microservices

❌ Redis

❌ Kafka

❌ Kubernetes

❌ Separate workers

❌ CRM webhooks

❌ Google Ads integration

❌ Meta Ads integration

❌ Complex geofencing

❌ AI recommendations

❌ Multiple event types

❌ Individual bottle QR tracking

❌ Massive distributed queues

---

# OUR PHASE 1 STACK

```text
FRONTEND
────────────

Next.js

TypeScript

Tailwind


BACKEND
────────────

Next.js Server Actions

Next.js Route Handlers


DATABASE
────────────

Supabase PostgreSQL


AUTH
────────────

Supabase Auth


SECURITY
────────────

Supabase RLS


REALTIME
────────────

Supabase Realtime
```

This keeps the system a **modular monolith**.

---

# 🧠 THE ARCHITECTURAL PRINCIPLE

Every major feature should answer:

### Who?

```text
profiles
```

### Which organization?

```text
organizations
```

### Where?

```text
venues
```

### What event?

```text
events
```

### What commercial campaign?

```text
campaigns
```

### Where is the campaign running?

```text
campaign_activations
```

### Which physical production?

```text
production_batches
```

### What did the customer do?

```text
scan_sessions

experience_events
```

### Did they claim?

```text
claims
```

### Is there a lead?

```text
leads
```

### What reward?

```text
vouchers
```

### Was it redeemed?

```text
voucher_redemptions
```

---

# 🏆 MY FINAL EXPERT VERDICT

Bro, **this is now a legitimate system architecture**.

Not just:

> "Make QR → save phone number → give coupon."

We now have a complete chain:

```text
BUSINESS

↓

ORGANIZATION

↓

EVENT

↓

LOCATION

↓

CAMPAIGN

↓

ACTIVATION

↓

PRODUCTION

↓

QR

↓

EXPERIENCE

↓

CONVERSION

↓

VOUCHER

↓

REDEMPTION

↓

ANALYTICS
```

## And the best part?

We are **not overengineering Phase 1**.

We build Ganesh Puja.

One event type.

One experience.

One game.

Generic batch QR.

One monolithic Next.js application.

One Supabase project.

Then, once that works in the real world, **we expand the same architecture**.

---

# 🚨 WHAT I WOULD DO NEXT

**Do not start the frontend first.**

Start with:

# **SPRINT 1: DATABASE + AUTH FOUNDATION**

Specifically, we should now create the **actual production-grade Supabase SQL schema**, in the correct dependency order:

```text
1. ENUMS

2. profiles

3. organizations

4. organization_members

5. events

6. venues

7. event_venues

8. campaigns

9. campaign_configs

10. campaign_rewards

11. campaign_activations

12. production_batches

13. consumer tables

14. vouchers

15. indexes

16. constraints

17. RLS

18. helper authorization functions
```

**That should be our next working step.** I would write it carefully as actual SQL migrations rather than jumping into UI code. Supabase's current documentation specifically emphasizes reviewing RLS policies and least-privilege access for production, so the schema and authorization foundation should come first. ([Supabase][3])

[1]: https://supabase.com/docs/guides/auth/server-side?utm_source=chatgpt.com "Server-Side Rendering | Supabase Docs"
[2]: https://supabase.com/docs/guides/database/secure-data?utm_source=chatgpt.com "Securing your data | Supabase Docs"
[3]: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs?utm_source=chatgpt.com "Use Supabase with Next.js | Supabase Docs"

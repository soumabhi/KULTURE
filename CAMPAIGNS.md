# YES BHAI. LET'S DO ENTITY #5 — CAMPAIGNS. 🔥

This is probably the **most important business entity in the entire KULTUR system**.

Because until now we have designed the **world around the campaign**:

* Users
* Roles
* Organizations
* Events
* Venues
* Event Venues

Now we design the thing that actually makes KULTUR money:

> **A sponsor wants to run a branded activation during Ganesh Puja through KULTUR bottles.**

That is a **Campaign**.

I’m going to design this from a real system-designer perspective, while keeping **Phase 1 strictly Ganesh Puja-focused**.

Supabase/Postgres is a good fit here because foreign keys model entity relationships and join tables handle many-to-many relationships. We should use those relationships rather than stuffing everything into one giant campaign JSON object. ([Supabase][1])

---

# 🟣 ENTITY #5 — CAMPAIGNS

## First, forget databases for 30 seconds.

Imagine this real situation.

### KULTUR says:

> We are operating during Ganesh Puja 2026.

A company says:

> "We want to promote our brand."

For example:

```text
SPONSOR COMPANY
      │
      ▼
Khimji Jewellers
```

They want:

* Their branding on KULTUR bottles
* Their offer shown after scanning
* Users to interact digitally
* Phone numbers collected with consent
* Leads generated
* Campaign results measured

That entire marketing operation is:

# 🎯 A CAMPAIGN

---

# 1️⃣ WHAT EXACTLY IS A CAMPAIGN?

My definition for KULTUR:

> **A Campaign is a sponsor-funded marketing initiative operated by KULTUR for a defined business objective within a specific event context.**

Let's break that down.

Example:

```text
Campaign Name:

Khimji Ganesh Rewards 2026
```

It might have:

```text
Sponsor:
Khimji Jewellers

Event:
Ganesh Puja 2026

Objective:
Lead Generation

Offer:
Special festive reward

Status:
Active
```

That is the **business definition**.

---

# 🧠 CAMPAIGN ≠ BATCH

This is extremely important.

We must not confuse these.

## Campaign

The marketing initiative.

```text
KHIMJI GANESH REWARDS 2026
```

## Batch

A physical production/distribution unit.

```text
5,000 bottles
```

So:

```text
CAMPAIGN
    │
    │ can have
    ▼
BATCHES
```

Example:

```text
Khimji Campaign
      │
      ├── Batch 001
      │
      ├── Batch 002
      │
      └── Batch 003
```

We will design **Batches later**.

For now:

# Campaign = Marketing Business Object

# Batch = Physical Operational Object

🔥 Keep this separation forever.

---

# 2️⃣ WHO OWNS A CAMPAIGN?

Let's ask a difficult question.

Does Khimji create it?

Or does KULTUR create it?

My answer:

# The sponsor OWNS the marketing initiative.

But:

# KULTUR OPERATES it.

So the architecture should represent both.

---

## Example

```text
SPONSOR ORGANIZATION

Khimji Jewellers
        │
        │ owns
        ▼
CAMPAIGN

Khimji Ganesh Rewards 2026
        │
        │ operated by
        ▼
KULTUR
```

Therefore our campaign should have:

```text
sponsor_organization_id
```

But we **do not necessarily need**:

```text
kultur_organization_id
```

Why?

Because, for Phase 1:

> Every campaign in this system is operated by KULTUR.

We already know that.

Adding unnecessary foreign keys is bad design.

---

# 3️⃣ DOES A CAMPAIGN BELONG TO AN EVENT?

For our Phase 1:

# YES.

Absolutely.

Example:

```text
CAMPAIGN

Khimji Ganesh Rewards 2026
            │
            ▼
EVENT

Ganesh Puja 2026
```

So:

```text
campaigns.event_id
```

---

# Why?

Because this campaign is specifically contextual.

It exists because:

```text
GANESH PUJA 2026
```

exists.

---

# But think carefully.

Could Khimji have:

```text
Ganesh Puja Campaign
```

and later:

```text
Durga Puja Campaign?
```

Yes.

Those are two campaigns.

```text
Khimji
   │
   ├── Campaign A
   │      │
   │      ▼
   │   Ganesh Puja
   │
   │
   └── Campaign B
          │
          ▼
       Durga Puja
```

Perfect.

---

# 4️⃣ ONE SPONSOR CAN HAVE MANY CAMPAIGNS

Example:

```text
KHIMJI JEWELLERS
        │
        ├───────────────┐
        │               │
        ▼               ▼

Campaign A          Campaign B

Ganesh Puja         Future Event
2026
```

Therefore:

```text
organizations
       │
       │
       │ 1 → MANY
       ▼
campaigns
```

Specifically:

```text
Sponsor Organization
       │
       │ owns
       ▼
Campaign
```

---

# 5️⃣ NOW THE BIG QUESTION:

# Does a Campaign belong to one Venue?

NO. ❌

This is where we need to be very precise.

Suppose:

```text
Khimji Ganesh Rewards 2026
```

runs at:

```text
Saheed Nagar
```

and:

```text
Rasulgarh
```

and:

```text
Nayapalli
```

Then:

```text
Campaign
      │
      │
      ▼
???
```

We cannot do this:

```text
campaigns.venue_id
```

Because then one campaign can only point to one venue.

---

# 6️⃣ CAMPAIGN → EVENT VENUE

Remember our architecture:

```text
EVENT
   │
   ▼
EVENT_VENUES
   │
   ├── Saheed Nagar
   │
   ├── Rasulgarh
   │
   └── Nayapalli
```

Now:

```text
CAMPAIGN
     │
     │
     ▼
CAMPAIGN DEPLOYMENTS
     │
     ├─────────────┐
     │             │
     ▼             ▼

EVENT VENUE A   EVENT VENUE B
```

🔥

This is the correct model.

---

# 7️⃣ WHAT IS A CAMPAIGN DEPLOYMENT?

Definition:

> **A Campaign Deployment represents a campaign being activated at a specific Event Venue.**

Example:

```text
Campaign:
Khimji Ganesh Rewards 2026

Event Venue:
Saheed Nagar Pandal
```

That is:

```text
CAMPAIGN DEPLOYMENT #1
```

Then:

```text
Campaign:
Khimji Ganesh Rewards 2026

Event Venue:
Rasulgarh Pandal
```

That is:

```text
CAMPAIGN DEPLOYMENT #2
```

---

# Visualize this

```text
                 CAMPAIGN

       Khimji Ganesh Rewards 2026

                        │
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼

     CAMPAIGN DEPLOYMENT    CAMPAIGN DEPLOYMENT

              │                   │
              ▼                   ▼

       Saheed Nagar         Rasulgarh
```

---

# 🧠 WHY IS `campaign_deployments` SO IMPORTANT?

Because the **deployment itself has data**.

For example:

At Saheed Nagar:

```text
10,000 bottles
```

At Rasulgarh:

```text
5,000 bottles
```

Different deployment status:

```text
Saheed Nagar:

ACTIVE
```

```text
Rasulgarh:

PLANNED
```

So:

```text
campaign_deployments
```

is not just a boring join table.

It becomes:

# 🚀 THE OPERATIONAL ACTIVATION UNIT

---

# 8️⃣ THE CAMPAIGN HIERARCHY

Now look at this carefully.

```text
SPONSOR ORGANIZATION
          │
          │ owns
          ▼
       CAMPAIGN
          │
          │ belongs to
          ▼
        EVENT
          │
          │ contains
          ▼
     EVENT VENUES


CAMPAIGN
     │
     │ deployed through
     ▼
CAMPAIGN DEPLOYMENTS
     │
     ▼
EVENT VENUES
```

Let's combine it:

```text
              SPONSOR
                 │
                 │
                 ▼
              CAMPAIGN
                 │
                 │
                 ▼
               EVENT
                 │
                 │
          ┌──────┴───────┐
          │              │
          ▼              ▼

      EVENT VENUE    EVENT VENUE


              ▲              ▲
              │              │
              │              │

      CAMPAIGN DEPLOYMENT
              │
              │
              ▼
           CAMPAIGN
```

---

# 9️⃣ NOW: WHAT DATA ACTUALLY BELONGS INSIDE A CAMPAIGN?

This is where many developers make a mess.

They create:

```text
campaigns
```

with:

```text
title
color
game
logo
offer
phone
coupon
header
venue
analytics
batch
volunteer
everything
```

# ❌ TERRIBLE.

We must separate data based on responsibility.

---

# I propose the Campaign has 5 logical areas:

```text
CAMPAIGN
    │
    ├── Identity
    │
    ├── Business Rules
    │
    ├── Schedule
    │
    ├── Status
    │
    └── Relationships
```

---

# 🟢 A. CAMPAIGN IDENTITY

This answers:

> What is this campaign?

```text
id

name

slug
```

Example:

```text
id:
uuid

name:
Khimji Ganesh Rewards 2026

slug:
khimji-ganesh-2026
```

---

# 🟡 B. BUSINESS RELATIONSHIPS

This answers:

> Who owns it and where does it operate?

```text
sponsor_organization_id

event_id
```

---

# 🔵 C. BUSINESS OBJECTIVE

This answers:

> Why does this campaign exist?

For Phase 1:

```text
LEAD_GENERATION
```

Potentially later:

```text
LEAD_GENERATION

BRAND_AWARENESS

FOOTFALL

COUPON_REDEMPTION
```

But Bhai:

# DO NOT OVERENGINEER.

For Ganesh Puja Phase 1:

I recommend:

```text
campaign_objective
```

as a controlled value.

Initially:

```text
LEAD_GENERATION
```

---

# 🟣 D. CAMPAIGN SCHEDULE

```text
starts_at

ends_at
```

Example:

```text
Starts:
September 7

Ends:
September 17
```

This is important because:

```text
Campaign
    │
    ▼
ACTIVE?
```

should eventually depend on:

```text
status
+
time
```

---

# 🔴 E. CAMPAIGN STATUS

I recommend:

```text
DRAFT

READY

ACTIVE

PAUSED

COMPLETED

CANCELLED
```

---

# What do these mean?

## DRAFT

```text
Admin is building it.
```

Nothing should be public.

---

## READY

```text
Everything configured.

Not yet live.
```

---

## ACTIVE

```text
Users can scan.
```

🔥

---

## PAUSED

```text
Campaign temporarily stopped.
```

QR scans should not generate offers.

---

## COMPLETED

```text
Campaign finished successfully.
```

Historical data remains.

---

## CANCELLED

```text
Campaign terminated.
```

---

# 🔥 Important distinction

Do not use:

```text
is_active boolean
```

I prefer:

```text
status enum
```

Why?

Because:

```text
true / false
```

cannot tell us:

```text
DRAFT?

PAUSED?

COMPLETED?

CANCELLED?
```

A state machine is more expressive.

---

# 10️⃣ THE CORE `campaigns` TABLE

My current recommendation:

```text
campaigns
────────────────────────────────

id uuid PK

sponsor_organization_id uuid FK

event_id uuid FK

name text

slug text unique

objective

status

starts_at timestamptz

ends_at timestamptz

created_at

updated_at
```

That's it.

# 😮 "WAIT, WHERE IS THE LOGO?"

Not here.

---

# 😮 "WHERE IS THE OFFER?"

Not here.

---

# 😮 "WHERE IS THE GAME?"

Not here.

---

# 😮 "WHERE IS THE QR?"

Not here.

🔥🔥🔥

Because these are different concepts.

---

# 1️⃣1️⃣ CAMPAIGN CORE VS CAMPAIGN EXPERIENCE

This is a very important architectural separation.

A campaign is the:

# BUSINESS OBJECT

But the scan screen is the:

# CUSTOMER EXPERIENCE

Example:

```text
CAMPAIGN

Khimji Ganesh Rewards 2026
```

Business data:

```text
Sponsor

Event

Schedule

Status
```

Customer experience:

```text
Logo

Colors

Headline

Game

Offer

Reward UI
```

These should not necessarily be mixed.

---

# I recommend:

```text
CAMPAIGN
      │
      │
      ▼
CAMPAIGN EXPERIENCE
```

Eventually.

But...

# 🚨 NOT YET.

We need to think carefully about the scan experience before creating the table.

For Phase 1, we know everything is:

# GANESH PUJA ONLY.

So we should avoid building a massive generic CMS.

---

# 12️⃣ MY PHASE 1 DECISION

For now:

```text
campaigns
```

should represent:

# THE BUSINESS CAMPAIGN

Then later:

```text
campaign_experiences
```

can represent:

# WHAT THE USER SEES

For example:

```text
campaign_experiences
──────────────────────

id

campaign_id

experience_type

config
```

BUT I would not create this yet.

Why?

Because we haven't designed:

* Offers
* Games
* Scan screens
* Live venue information

Creating a `config JSONB` now would just be guessing.

---

# 🔥 THIS IS A PRINCIPLE WE WILL FOLLOW

> **Do not create a table because we think we might need it. Create it when we understand its responsibility.**

---

# 1️⃣3️⃣ NOW LET'S DESIGN CAMPAIGN DEPLOYMENTS

This is the second major entity.

```text
campaign_deployments
```

---

# Definition

> A campaign deployment is the activation of one campaign at one event venue.

So:

```text
Campaign A
+
Event Venue A
=
Campaign Deployment
```

---

# Example

```text
CAMPAIGN

Khimji Ganesh Rewards 2026


EVENT VENUE

Saheed Nagar × Ganesh Puja 2026


RESULT:

Khimji Campaign
at
Saheed Nagar
```

---

# DATABASE

```text
campaign_deployments
────────────────────────────

id uuid PK

campaign_id uuid FK

event_venue_id uuid FK

status

created_at

updated_at
```

---

# Constraint

We must prevent:

```text
Khimji Campaign
+
Saheed Nagar
```

from being added twice.

So:

```sql
UNIQUE(campaign_id, event_venue_id)
```

---

# 1️⃣4️⃣ DEPLOYMENT STATUS

A deployment may have its own status.

Example:

Campaign:

```text
ACTIVE
```

But:

```text
Saheed Nagar:

ACTIVE
```

and:

```text
Rasulgarh:

NOT ACTIVE YET
```

Therefore:

```text
campaign_deployment.status
```

should exist.

---

I recommend:

```text
PLANNED

READY

ACTIVE

PAUSED

COMPLETED

CANCELLED
```

Yes, similar to Campaign.

---

# 🧠 WHY?

Because:

```text
CAMPAIGN
```

is the overall marketing initiative.

While:

```text
CAMPAIGN DEPLOYMENT
```

is the local operational activation.

---

# Example

```text
CAMPAIGN

Status:

ACTIVE


Deployment 1:

Saheed Nagar

ACTIVE


Deployment 2:

Rasulgarh

PAUSED


Deployment 3:

Nayapalli

READY
```

Perfectly possible.

---

# 1️⃣5️⃣ NOW THE REAL GANESH PUJA FLOW

Let's simulate it.

---

## STEP 1 — KULTUR creates the Event

```text
EVENT

Ganesh Puja 2026
```

---

## STEP 2 — KULTUR adds Venues

```text
Saheed Nagar

Rasulgarh

Nayapalli
```

---

## STEP 3 — Event Venues are created

```text
Ganesh Puja 2026
+
Saheed Nagar
```

↓

```text
Event Venue #1
```

And so on.

---

## STEP 4 — Sponsor exists

```text
ORGANIZATION

Khimji Jewellers
```

Type:

```text
SPONSOR
```

---

## STEP 5 — Campaign is created

```text
CAMPAIGN

Khimji Ganesh Rewards 2026
```

Relationships:

```text
Sponsor:
Khimji Jewellers

Event:
Ganesh Puja 2026
```

---

## STEP 6 — Campaign Deployments

Admin chooses:

☑ Saheed Nagar

☑ Rasulgarh

⬜ Nayapalli

The system creates:

```text
CAMPAIGN DEPLOYMENT

Campaign:
Khimji

Event Venue:
Saheed Nagar
```

and:

```text
CAMPAIGN DEPLOYMENT

Campaign:
Khimji

Event Venue:
Rasulgarh
```

---

# 🔥 THIS IS THE MASTER RELATIONSHIP

```text
             SPONSOR ORGANIZATION
                    │
                    │ owns
                    ▼

                 CAMPAIGN
                    │
                    │ belongs to
                    ▼

                  EVENT
                    │
                    │
                    ▼

              EVENT VENUES


CAMPAIGN
    │
    │ deploys
    ▼

CAMPAIGN DEPLOYMENTS
    │
    │
    ├───────────────┐
    │               │
    ▼               ▼

EVENT VENUE A    EVENT VENUE B
```

---

# 1️⃣6️⃣ NOW LET'S TALK ABOUT WHO CREATES THE CAMPAIGN

My recommendation:

# PHASE 1:

```text
MASTER ADMIN
```

creates everything.

Why?

Because KULTUR is still small.

We don't want a sponsor company randomly changing:

* Offers
* Data collection
* Event settings
* Deployments

The workflow should be:

```text
SPONSOR
    │
    │ provides requirements
    ▼
KULTUR ADMIN
    │
    │ configures
    ▼
CAMPAIGN
```

---

# Later:

We can allow:

```text
Sponsor Admin
```

to edit limited fields.

But:

# NOT NOW.

---

# 1️⃣7️⃣ WHAT SHOULD THE ADMIN DO?

Imagine our Master Admin UI.

## Create Campaign

```text
┌───────────────────────────────┐
│ CREATE CAMPAIGN               │
│                               │
│ Sponsor                       │
│ [Khimji Jewellers ▼]          │
│                               │
│ Event                         │
│ [Ganesh Puja 2026 ▼]          │
│                               │
│ Campaign Name                 │
│ [_______________________]     │
│                               │
│ Start Date                    │
│ [_______________________]     │
│                               │
│ End Date                      │
│ [_______________________]     │
│                               │
│ Status                        │
│ [DRAFT ▼]                     │
│                               │
│        [ CREATE CAMPAIGN ]    │
└───────────────────────────────┘
```

After creation:

```text
CAMPAIGN
      │
      ├── Deployments
      │
      ├── Offer
      │
      ├── Batches
      │
      ├── Scan Experience
      │
      └── Analytics
```

🔥

---

# 1️⃣8️⃣ NOW, A VERY IMPORTANT QUESTION:

# CAN MULTIPLE SPONSORS OWN ONE CAMPAIGN?

Example:

```text
Khimji
+
DN Homes
+
Another Sponsor
```

all on one campaign.

For Phase 1:

# ❌ NO.

One Campaign = One Sponsor Organization.

Why?

Because multiple sponsors immediately create complexity:

* Whose leads?
* Which offer?
* Whose branding?
* Who pays?
* Which dashboard?
* Who owns the data?

Don't build complexity before we need it.

So:

```text
ONE CAMPAIGN
        │
        ▼
ONE SPONSOR
```

Later, if necessary:

```text
campaign_sponsors
```

can exist.

But:

# NOT NOW.

---

# 1️⃣9️⃣ DOES ONE EVENT HAVE MANY CAMPAIGNS?

YES.

Example:

```text
GANESH PUJA 2026
       │
       ├─────────────┐
       │             │
       ▼             ▼

Khimji Campaign   DN Homes Campaign
```

Potentially:

```text
Event
  │
  │ 1 → MANY
  ▼
Campaigns
```

---

# 2️⃣0️⃣ CAN ONE CAMPAIGN DEPLOY TO MANY VENUES?

YES.

```text
Campaign
    │
    │
    ▼
Deployments
    │
    ├── Saheed Nagar
    │
    ├── Rasulgarh
    │
    └── Nayapalli
```

---

# 2️⃣1️⃣ CAN ONE EVENT VENUE HAVE MANY CAMPAIGNS?

Potentially yes.

Example:

```text
Saheed Nagar
      │
      ├── Khimji Campaign
      │
      └── DN Homes Campaign
```

But...

# 🚨 BUSINESS RULE QUESTION.

Do we actually want this during Phase 1?

Maybe not.

Because one bottle may become confusing.

```text
Bottle

Khimji branding

But QR shows DN Homes?
```

No.

---

# MY RECOMMENDATION

For Phase 1:

> **An Event Venue can have multiple campaigns in the database, but only one campaign deployment should be ACTIVE at a time.**

🔥

This gives us flexibility.

---

# Example

```text
Saheed Nagar

Morning:

Campaign A
ACTIVE
```

Then later:

```text
Campaign A
COMPLETED
```

```text
Campaign B
ACTIVE
```

---

# Database-level enforcement?

We can eventually enforce:

> Only one ACTIVE deployment per Event Venue.

But I would initially handle this through a transactional server-side operation rather than prematurely adding complicated database logic.

---

# 2️⃣2️⃣ THE CAMPAIGN STATE MACHINE

This is how I think about it.

```text
             CREATE
                │
                ▼

             DRAFT
                │
                │ Configure
                ▼

             READY
                │
                │ Activate
                ▼

             ACTIVE
             /      \
            /        \
           ▼          ▼

        PAUSED     COMPLETED
           │
           │ Resume
           ▼

        ACTIVE


CANCELLED
can happen before or during activation
```

---

# 🚨 VALID TRANSITIONS

We should eventually enforce these.

```text
DRAFT
 ↓
READY
 ↓
ACTIVE
 ↓
PAUSED ↔ ACTIVE
 ↓
COMPLETED
```

And:

```text
DRAFT → CANCELLED
```

```text
READY → CANCELLED
```

Potentially:

```text
ACTIVE → CANCELLED
```

---

# Why does this matter?

Because we don't want someone accidentally doing:

```text
COMPLETED

↓

ACTIVE
```

without deliberate logic.

---

# 2️⃣3️⃣ SHOULD THE PUBLIC QR LOOK UP THE CAMPAIGN DIRECTLY?

Eventually, yes.

But not by:

```text
campaign UUID
```

like:

```text
/scan/8d83-a928-2938...
```

That's ugly and exposes implementation details.

Instead:

```text
/scan/[public_identifier]
```

Example:

```text
kultur.live/scan/khimji-ganesh-2026
```

But wait.

This is important.

We earlier discussed:

```text
/scan/[batchId]
```

Since physical printing is generic per batch.

We should not decide this until we design:

# ENTITY #6 — BATCHES

Because the physical QR relationship determines the URL architecture.

So for now:

# ❌ Do not lock the scan URL.

Good system design means:

> **Do not decide a downstream interface before designing the entity that owns it.**

---

# 2️⃣4️⃣ WHAT DATA DOES CAMPAIGN NOT OWN?

This is equally important.

Campaign should NOT own:

❌ Individual bottles

❌ Volunteer GPS

❌ Individual scans

❌ Individual phone numbers

❌ Individual coupon codes

❌ Delivery confirmations

Those belong to future entities.

---

# The architecture:

```text
CAMPAIGN
    │
    ├── has deployments
    │
    ├── has batches
    │
    ├── has offers
    │
    ├── receives scans
    │
    └── generates leads
```

But the campaign should not become a dumping ground.

---

# 2️⃣5️⃣ THE COMPLETE CAMPAIGN MODEL

## Core entity

```text
campaigns
──────────────────────────────

id

sponsor_organization_id

event_id

name

slug

objective

status

starts_at

ends_at

created_at

updated_at
```

---

## Deployment entity

```text
campaign_deployments
──────────────────────────────

id

campaign_id

event_venue_id

status

created_at

updated_at
```

---

# Relationships

```text
ORGANIZATION
(Sponsor)
       │
       │ 1
       │
       ▼
CAMPAIGN
       │
       │ belongs to
       ▼
EVENT


CAMPAIGN
       │
       │ 1 → MANY
       ▼

CAMPAIGN DEPLOYMENTS
       │
       │ MANY → 1
       ▼

EVENT VENUE
```

---

# 🏆 THE FULL SYSTEM SO FAR

Bhai, look at this.

We now have an actual relational architecture emerging.

```text
                         USERS
                           │
                           ▼
                        PROFILES
                           │
                           ▼
                  ORGANIZATION MEMBERS
                           │
                           ▼
                     ORGANIZATIONS
                     /           \
                    /             \
                   ▼               ▼

              KULTUR          SPONSOR ORG
                                    │
                                    │ owns
                                    ▼
                                 CAMPAIGN
                                    │
                                    │ belongs to
                                    ▼
                                  EVENT
                                    │
                                    ▼
                              EVENT VENUES
                              /           \
                             /             \
                            ▼               ▼

                        VENUE         VENUE ORGANIZATION


CAMPAIGN
    │
    │ deploys through
    ▼

CAMPAIGN DEPLOYMENTS
    │
    ▼

EVENT VENUES
```

🔥🔥🔥

---

# 🎯 THE MOST IMPORTANT BUSINESS CHAIN

Here is KULTUR in one sentence:

```text
SPONSOR
   │
   │ pays for
   ▼
CAMPAIGN
   │
   │ operates during
   ▼
EVENT
   │
   │ activates at
   ▼
EVENT VENUES
   │
   │ receives
   ▼
BOTTLE BATCHES
   │
   │ contain
   ▼
QR CODES
   │
   │ bring
   ▼
USERS
   │
   │ who interact with
   ▼
CAMPAIGN EXPERIENCE
   │
   │ and may create
   ▼
LEADS / REWARDS
```

# THIS IS KULTUR. 🚀

---

# 🔥 ONE CORRECTION I WANT TO MAKE TO OUR OLD ARCHITECTURE

Earlier, the architecture talked heavily about:

> `batch_id` inside the `campaigns` table.

I would **not do that anymore**.

That was an oversimplification.

The correct direction is:

```text
CAMPAIGN
    │
    │
    ▼
BATCHES
```

Because:

* One campaign can produce multiple batches.
* Different venues may receive different batches.
* Batches may be produced at different times.
* Each batch can have different quantities.
* Each batch may have a different QR destination/configuration.

So:

# `batch_id` does NOT belong inside `campaigns`.

Instead:

```text
batches.campaign_id
```

will likely exist.

🔥 This is exactly why designing entities one by one was the correct move.

---

# 🟢 ENTITY #5 — PROVISIONALLY LOCKED

We have:

### Entity #1

```text
USERS & ROLES
```

### Entity #2

```text
ORGANIZATIONS
```

### Entity #3

```text
EVENTS
```

### Entity #4

```text
VENUES & EVENT VENUES
```

### Entity #5

```text
CAMPAIGNS & CAMPAIGN DEPLOYMENTS
```

---

# 🚨 NOW WE MUST DESIGN THE PHYSICAL WORLD

The next entity should be:

# 🟠 ENTITY #6 — BATCHES & PRODUCTION

This is where your **actual bottle manufacturing logic** begins.

We will answer:

* What exactly is a batch?
* Does a batch belong to a Campaign or Campaign Deployment?
* Can one batch go to multiple venues?
* What does "production" mean in the database?
* Who creates a batch?
* Who activates it?
* What is batch quantity?
* How do volunteers receive batches?
* Where does the generic printed QR belong?
* Should QR identify the Batch or Campaign Deployment?
* What happens when 10,000 bottles have the same QR?
* How do we track scans without unique bottle IDs?
* What happens when a batch runs out?
* How do we connect printing → delivery → activation?

## My strong recommendation:

**Next we do `ENTITY #6 — BATCHES, PRODUCTION & PHYSICAL DISTRIBUTION` before designing QR codes.**

Because **the QR is printed on the physical product**, so the physical production model must come first.

The official architecture principles we're following here—relational foreign keys for entity integrity, join tables for relationship-specific data, indexed relationship columns, and database-enforced authorization—fit very naturally with Supabase/Postgres. ([Supabase][2])

**Next: ENTITY #6 — BATCHES & PRODUCTION.**

[1]: https://supabase.com/docs/guides/database/tables?utm_source=chatgpt.com "Tables and Data | Supabase Docs"
[2]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"

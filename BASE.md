Yes. **Now we stop treating KULTUR as a collection of features.**

We need to turn everything into **one coherent Ganesh Puja system**.

And I agree with your instruction:

> **For now, we design ONLY for Ganesh Puja.**
>
> No sports. No concerts. No generic multi-event abstraction. Those can come later.

But we will design Ganesh Puja in a way that **doesn't create technical dead ends**.

---

# 🕉️ FIRST: WHY ARE WE ACTUALLY BUILDING THIS?

Let's simplify everything.

## We are NOT building:

❌ A water bottle company
❌ A QR code website
❌ A game website
❌ An admin dashboard
❌ A coupon generator

Those are only **parts**.

# We are building this:

> **A system that connects physical Ganesh Puja distribution with measurable digital engagement and sponsor campaigns.**

The fundamental loop is:

```text
                     KULTUR

        PHYSICAL WORLD          DIGITAL WORLD

             │                       │

      Water Bottle              QR Scan
             │                       │
             └──────────┬────────────┘
                        │
                        ▼
                 GANESH PUJA
                 PARTICIPANT
                        │
                        ▼
                 DIGITAL EXPERIENCE
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
           GAME      OFFER     INFORMATION
              │         │
              └─────────┼─────────┘
                        │
                        ▼
                 PHONE + CONSENT
                        │
                        ▼
                   VERIFIED LEAD
                        │
                        ▼
                 CAMPAIGN DATA
```

That is the system.

---

# 🚨 ONE IMPORTANT CORRECTION

Some of our earlier architecture was becoming **too ambitious too early**.

For example:

```text
50,000 concurrent users
Global edge architecture
Complex microservices
Sports plugins
Concert plugins
Third-party CRM integrations
```

Forget that **for Phase 1**.

We have one mission:

# 🕉️ KULTUR × GANESH PUJA 2026

We need to successfully run:

```text
ONE FESTIVAL
↓
MULTIPLE LOCATIONS
↓
MULTIPLE SPONSORS POSSIBLY
↓
MULTIPLE BOTTLE BATCHES
↓
VOLUNTEERS
↓
REAL USERS
↓
REAL DATA
```

If we can do that beautifully, **then we have a platform**.

---

# 🧠 THE MOST IMPORTANT THING: THE REAL-WORLD HIERARCHY

This is where I would begin as the system designer.

Let's define reality.

---

# LEVEL 1 — KULTUR

At the top:

```text
KULTUR
```

KULTUR owns the platform.

```text
KULTUR
│
├── Admins
│
├── Companies
│
├── Campaigns
│
├── Locations
│
├── Volunteers
│
└── Data
```

---

# LEVEL 2 — COMPANIES

KULTUR approaches a company.

Example:

```text
KULTUR
   │
   ▼
SPONSOR COMPANY
```

Example:

```text
KULTUR
   │
   └──── Khimji Jewellers
```

The company is an **advertiser/sponsor**.

They may have:

```text
Company
│
├── Company Details
├── Contact Person
├── Brand Assets
└── Campaigns
```

---

# LEVEL 3 — GANESH PUJA CAMPAIGN

Now suppose:

```text
Khimji Jewellers
```

wants to participate.

KULTUR creates:

```text
Campaign:

Khimji × Ganesh Puja 2026
```

Architecture:

```text
KULTUR

   │

   ▼

COMPANY
Khimji Jewellers

   │

   ▼

CAMPAIGN

Ganesh Puja 2026
```

The campaign contains:

```text
Campaign

├── Sponsor
├── Offer
├── Design
├── Duration
├── Locations
└── Bottle Allocation
```

---

# LEVEL 4 — LOCATIONS

Ganesh Puja is not one place.

It may be:

```text
Ganesh Puja Campaign
│
├── Location A
│
├── Location B
│
├── Location C
│
└── Location D
```

For example:

```text
GANESH PUJA 2026
│
├── Pandal A
│
├── Pandal B
│
└── Pandal C
```

Each location is a **real operational entity**.

A location has:

```text
Location

Name
Address
Coordinates
Organiser
Operating Dates
Status
```

Example:

```text
Location

Name:
Saheed Nagar Ganesh Puja

Coordinates:
Latitude
Longitude

Status:
ACTIVE
```

---

# 🧠 HERE IS THE FIRST BIG RELATIONSHIP

```text
KULTUR
   │
   │ creates
   ▼
COMPANY
   │
   │ sponsors
   ▼
CAMPAIGN
   │
   │ operates at
   ▼
LOCATIONS
```

But wait.

We need another relationship.

---

# 🧑‍🤝‍🧑 VOLUNTEERS

Volunteers don't belong permanently to a campaign.

A volunteer belongs to:

```text
KULTUR
```

Then KULTUR assigns them.

```text
KULTUR

Volunteer
   │
   │
   ▼
Assignment
   │
   ▼
Location
```

Example:

```text
Volunteer: Rahul

Assigned to:

Saheed Nagar Pandal
```

But later Rahul could be assigned elsewhere.

Therefore:

# Volunteer ↔ Location is many-to-many.

```text
VOLUNTEERS

Rahul
Priya
Amit

        │

        ▼

ASSIGNMENTS

        │

        ▼

LOCATIONS

Pandal A
Pandal B
Pandal C
```

So we create:

```text
volunteer_assignments
```

---

# 📦 NOW COMES BATCH PRODUCTION

This is where the physical world enters.

Suppose:

```text
Campaign:
Khimji × Ganesh Puja 2026
```

We decide:

```text
20,000 bottles
```

But we don't think:

```text
20,000 individual bottles
```

We think:

# Production Batches.

```text
CAMPAIGN

20,000 bottles

      │

      ▼

BATCHES

Batch 01 → 5,000

Batch 02 → 5,000

Batch 03 → 5,000

Batch 04 → 5,000
```

So:

```text
Campaign
    │
    ├── Batch 01
    │
    ├── Batch 02
    │
    ├── Batch 03
    │
    └── Batch 04
```

Each batch has:

```text
Batch

ID
Quantity
QR URL
Production Status
Delivery Status
```

---

# 🟢 YOUR GENERIC QR IDEA FITS PERFECTLY HERE

Every bottle in:

```text
Batch 01
```

can contain:

```text
THE SAME QR CODE
```

For example:

```text
kultur.live/scan/batch-01
```

That is practical.

```text
BATCH 01

5,000 bottles

QR:

████████
████████
████████
```

All 5,000 bottles:

```text
Same QR
```

---

# 🔥 BUT HERE IS A VERY IMPORTANT DESIGN DECISION

I would **not make batchId visible as a meaningful internal ID**.

Instead:

```text
/scan/ganesh-khimji-a7x92
```

or:

```text
/scan/xY72kLm
```

Internally:

```text
Public Scan Code
       │
       ▼
Batch
       │
       ▼
Campaign
```

Because URLs are public interfaces.

We shouldn't expose:

```text
Batch 001
Batch 002
Batch 003
```

unless we intentionally want to.

---

# 🏭 COMPLETE PHYSICAL PRODUCTION FLOW

Now look at the real-world process.

```text
ADMIN
   │
   ▼
CREATE COMPANY
   │
   ▼
CREATE GANESH PUJA CAMPAIGN
   │
   ▼
SELECT LOCATIONS
   │
   ▼
DECIDE QUANTITY
   │
   ▼
CREATE BATCHES
   │
   ▼
GENERATE QR
   │
   ▼
SEND DESIGN TO PRINTING
   │
   ▼
BOTTLES PRODUCED
```

Then:

```text
BATCH
   │
   ▼
ASSIGN VOLUNTEER
   │
   ▼
DELIVER TO LOCATION
   │
   ▼
ACTIVATE
```

---

# 🚚 BATCH DELIVERY

This needs its own concept.

Don't directly say:

```text
Batch → Location
```

Because physically things move.

Instead:

```text
BATCH
   │
   ▼
DELIVERY
   │
   ▼
LOCATION
```

Example:

```text
Batch 01

Quantity:
5000

Delivery:

Volunteer:
Rahul

Destination:
Pandal A

Status:
DELIVERED
```

Therefore:

```text
batch_deliveries
```

This becomes important later for:

```text
Who delivered it?
When?
Where?
How many?
```

---

# 🧠 THE COMPLETE BUSINESS STRUCTURE

Now we have:

```text
                         KULTUR
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
    COMPANIES           LOCATIONS            VOLUNTEERS
        │                   │                    │
        │                   │                    │
        ▼                   │                    ▼
    CAMPAIGNS               │               ASSIGNMENTS
        │                   │                    │
        │                   │                    │
        └──────────┐   ┌────┘                    │
                   │   │                         │
                   ▼   ▼                         ▼
                     BATCHES
                        │
                        ▼
                     DELIVERY
                        │
                        ▼
                     ACTIVATION
```

This is the **physical operations layer**.

---

# 📱 NOW THE USER SCANS

A person receives:

```text
KULTUR WATER BOTTLE
```

They see:

```text
SCAN ME
```

They scan:

```text
QR
│
▼

/scan/xY72kLm
```

The system does:

```text
PUBLIC CODE
      │
      ▼
RESOLVE BATCH
      │
      ▼
RESOLVE CAMPAIGN
      │
      ▼
RESOLVE LOCATION
      │
      ▼
LOAD EXPERIENCE
```

This is critical.

---

# 🧠 WHAT DOES THE USER ACTUALLY SEE?

Since we're focusing only on Ganesh Puja:

```text
SCAN
 │
 ▼
GANESH PUJA EXPERIENCE
```

I would make this a **specific journey**.

Not generic dynamic UI yet.

---

# 🕉️ SCREEN 1 — LANDING

```text
┌───────────────────────────────┐
│                               │
│          🕉️ GANESHA            │
│                               │
│       KULTUR × SPONSOR        │
│                               │
│  Welcome to Ganesh Puja 2026  │
│                               │
│                               │
│       [ EXPLORE ↓ ]           │
│                               │
└───────────────────────────────┘
```

The system knows:

```text
Batch
↓
Campaign
↓
Sponsor
↓
Location
```

So it can personalize.

Example:

> Welcome to Saheed Nagar Ganesh Puja.

---

# SCREEN 2 — PUJA INFORMATION

Possible information:

```text
Today's Schedule

🕉️ Aarti
🎵 Cultural Program
📍 Location
🕐 Timing
```

This gives the venue value.

---

# SCREEN 3 — THE GAME

Now:

```text
PLAY
```

For Ganesh Puja:

# Catch the Modak

```text
┌───────────────────────────┐
│                           │
│       🥥                  │
│             🥥             │
│                           │
│          🧺               │
│                           │
│        SCORE: 42           │
│                           │
└───────────────────────────┘
```

User plays.

The game runs mostly locally.

---

# SCREEN 4 — GAME COMPLETION

```text
🎉

YOU COMPLETED THE GAME!

Your Score:

78

[ CLAIM YOUR OFFER ]
```

Now comes the important business part.

---

# 🎁 OFFER GATE

This is where I would change our terminology.

We should not automatically call every user:

```text
LEAD
```

The user is first:

# A Participant.

Then:

```text
Participant
```

plays the game.

Then:

```text
Participant
```

chooses to claim an offer.

Only after consenting and providing information does that interaction potentially become a sponsor lead.

The flow:

```text
PARTICIPANT

    │

    ▼

GAME

    │

    ▼

OFFER INTEREST

    │

    ▼

PHONE VERIFICATION

    │

    ▼

CONSENT

    │

    ▼

CLAIM
```

---

# 🔐 PHONE NUMBER

The user enters:

```text
+91 __________
```

But here's a critical real-world point:

**A phone number should not automatically mean permission to market to that person.**

For the system, separate:

### 1. Phone verification / reward fulfilment

and

### 2. Marketing consent

These should not be silently bundled together.

India's DPDP framework emphasizes that consent should be specific, informed, clear, and tied to the stated purpose; it also recognizes withdrawal of consent. TRAI separately describes consent for commercial communications as voluntary permission for a specified purpose. ([DPDP Act 2023][1])

So I would architect:

```text
PHONE NUMBER

        │

        ▼

OTP VERIFICATION

        │

        ▼

REWARD FULFILMENT CONSENT

        │

        ├───────────────┐
        │               │
        ▼               ▼

CLAIM ONLY       OPTIONAL MARKETING
```

This is a **much cleaner architecture**.

---

# 🧠 THE DATA MODEL SHOULD REFLECT THAT

Not:

```text
phone_number

=
marketing lead
```

Instead:

```text
participant_identity
```

and:

```text
campaign_consent
```

Conceptually:

```text
PARTICIPANT

id
phone
phone_verified
```

Then:

```text
CONSENT

participant_id
campaign_id

purpose:
REWARD_FULFILMENT

granted:
true
```

Optionally:

```text
purpose:
SPONSOR_MARKETING

granted:
true/false
```

This is important.

---

# 📲 OTP FLOW

I would design:

```text
USER
 │
 ▼
ENTER PHONE
 │
 ▼
SEND OTP
 │
 ▼
ENTER OTP
 │
 ▼
VERIFY
 │
 ▼
CREATE/RESOLVE PARTICIPANT
```

Now we know:

```text
This phone was verified.
```

---

# 🎟️ OFFER CLAIM

Now:

```text
VERIFIED PARTICIPANT
          │
          ▼
CHECK ELIGIBILITY
```

For example:

```text
Has this person already claimed
this campaign?
```

```text
YES → Return existing claim
```

```text
NO → Create claim
```

This is important:

# Do not simply throw an error if they already claimed.

Better:

```text
USER CLAIMS AGAIN
       │
       ▼
FIND EXISTING CLAIM
       │
       ▼
RETURN EXISTING VOUCHER
```

Why?

Because:

```text
User refreshes page
```

or:

```text
Network fails
```

They shouldn't lose their reward.

This is called:

# Idempotency.

---

# 🎫 THE CLAIM MODEL

```text
OFFER_CLAIM

id

campaign_id

participant_id

voucher_code

status

created_at
```

Status:

```text
ISSUED
REDEEMED
EXPIRED
CANCELLED
```

---

# 🔥 IMPORTANT: BATCH AND CLAIM ARE DIFFERENT

This is subtle.

The QR belongs to:

```text
BATCH
```

The offer belongs to:

```text
CAMPAIGN
```

So:

```text
USER SCANS

BATCH A

       │

       ▼

CAMPAIGN
```

Then:

```text
CLAIM

belongs to:

PARTICIPANT + CAMPAIGN
```

This prevents:

```text
Same person
│
├── Batch 01 → Claim
├── Batch 02 → Claim
├── Batch 03 → Claim
```

if your rule is:

```text
ONE CLAIM PER CAMPAIGN
```

This is a major improvement over:

```text
One phone per batch.
```

For Ganesh Puja, I would recommend:

# ONE VERIFIED PERSON = ONE OFFER PER CAMPAIGN

unless business rules say otherwise.

---

# 🧠 COMPLETE CUSTOMER JOURNEY

Now let's put it together.

```text
┌──────────────────────────┐
│   USER GETS BOTTLE       │
└─────────────┬────────────┘
              │
              ▼
        SCANS QR CODE
              │
              ▼
      /scan/public-code
              │
              ▼
        RESOLVE BATCH
              │
              ▼
       RESOLVE CAMPAIGN
              │
              ▼
       GANESH PUJA SCREEN
              │
              ▼
        PLAY MODAK GAME
              │
              ▼
        GAME COMPLETES
              │
              ▼
        VIEW OFFER
              │
              ▼
       ENTER PHONE NUMBER
              │
              ▼
           OTP
              │
              ▼
       VERIFIED PERSON
              │
              ▼
      CHECK PRIOR CLAIM
              │
        ┌─────┴──────┐
        │            │
        ▼            ▼
     EXISTS        NEW
        │            │
        ▼            ▼
 RETURN CODE    CREATE CLAIM
        │            │
        └─────┬──────┘
              │
              ▼
         SHOW VOUCHER
```

---

# 📊 NOW: WHAT DATA ARE WE COLLECTING?

We need to be very disciplined.

I would divide data into **four categories**.

---

# 1️⃣ OPERATIONAL DATA

For KULTUR.

```text
Company
Campaign
Location
Batch
Production Quantity
Delivery
Volunteer
```

Example:

```text
Batch 04

Produced:
5,000

Delivered:
5,000

Location:
Saheed Nagar
```

---

# 2️⃣ EVENT DATA

Anonymous or pseudonymous interaction data.

```text
Scan
Page Open
Game Started
Game Completed
Offer Opened
```

Example:

```text
SCAN_EVENT

campaign_id
batch_id
timestamp
```

This tells us:

```text
How many scans?
```

---

# 3️⃣ PARTICIPANT DATA

Only when necessary.

```text
Verified Phone
Participant ID
```

Potentially:

```text
Phone Hash
```

And raw phone should be protected appropriately.

---

# 4️⃣ CLAIM DATA

```text
Voucher
Status
Issued
Redeemed
Expired
```

---

# THE DATA PIPELINE

```text
                        USER

                          │

                 ┌────────┴────────┐

                 │                 │

                 ▼                 ▼

            EVENT DATA         PERSONAL DATA

                 │                 │

                 ▼                 ▼

              ANALYTICS       PARTICIPANT

                 │                 │

                 ▼                 ▼

             DASHBOARD         CLAIM

                                      │

                                      ▼

                                  VOUCHER
```

---

# 🧑‍💻 NOW THE ADMIN SIDE

This is where your original question begins:

> Relationship between admin → company → campaign → locations → volunteers → production → QR → scan → phone → offer → data.

Let's map the Master Admin journey.

---

# 👑 MASTER ADMIN

The Master Admin is KULTUR.

Their journey:

```text
LOGIN

 │

 ▼

KULTUR DASHBOARD
```

Then:

```text
1. CREATE COMPANY

2. CREATE CAMPAIGN

3. SELECT LOCATIONS

4. ASSIGN VOLUME

5. CREATE BATCHES

6. GENERATE QR

7. ASSIGN VOLUNTEERS

8. TRACK DELIVERY

9. ACTIVATE BATCH

10. MONITOR RESULTS
```

---

# STEP 1 — CREATE COMPANY

```text
COMPANY

Name

Logo

Contact Person

Email

Phone
```

Example:

```text
Company:

Khimji Jewellers
```

---

# STEP 2 — CREATE CAMPAIGN

```text
Campaign

Name:
Ganesh Puja 2026

Sponsor:
Khimji Jewellers

Start Date:
...

End Date:
...

Offer:
...
```

---

# STEP 3 — SELECT LOCATIONS

```text
Campaign

Khimji × Ganesh Puja

Locations:

☑ Pandal A

☑ Pandal B

☑ Pandal C
```

This requires a relationship table:

```text
campaign_locations
```

Because:

```text
Campaign A → Location A

Campaign A → Location B
```

and potentially later:

```text
Location A → Campaign B
```

---

# STEP 4 — CREATE BATCHES

Example:

```text
Campaign:

Ganesh Puja 2026

Total:

20,000 bottles
```

Admin:

```text
Create Batch
```

```text
Batch 01

Quantity:

5,000
```

```text
Batch 02

Quantity:

5,000
```

---

# STEP 5 — ASSIGN BATCH TO LOCATION

```text
Batch 01

Destination:

Saheed Nagar
```

```text
Batch 02

Destination:

Rasulgarh
```

---

# STEP 6 — ASSIGN VOLUNTEER

```text
Delivery

Batch:
Batch 01

Volunteer:
Rahul

Destination:
Saheed Nagar
```

---

# STEP 7 — QR

The system generates:

```text
PUBLIC SCAN CODE
```

Example:

```text
Ab7Kp92X
```

QR becomes:

```text
kultur.live/scan/Ab7Kp92X
```

That QR goes into the bottle design.

---

# STEP 8 — PRODUCTION

The batch lifecycle:

```text
DRAFT
 │
 ▼
READY_FOR_PRINT
 │
 ▼
PRINTED
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

This is a **state machine**.

I strongly recommend this.

---

# 🚚 VOLUNTEER FLOW

Volunteer logs in.

```text
VOLUNTEER DASHBOARD
```

They see:

```text
Today's Tasks

━━━━━━━━━━━━━━━━━━

📦 Batch 01

Destination:

Saheed Nagar

Quantity:

5,000

Status:

READY
```

They click:

```text
START DELIVERY
```

Then:

```text
ARRIVE
```

For Phase 1, I would **not immediately implement strict geofencing**.

Why?

GPS can fail.

Permissions can fail.

Phones can have poor accuracy.

Instead:

```text
Location verification:

✓ GPS

+ 

✓ Manual confirmation
```

Later we can make stricter controls.

---

# 📍 DELIVERY CONFIRMATION

```text
Volunteer

arrives

      │

      ▼

CONFIRM DELIVERY

      │

      ├── GPS captured
      │
      ├── Time captured
      │
      └── Batch confirmed

              │

              ▼

        DELIVERY RECORD
```

Then:

```text
Batch:

DELIVERED
```

Admin can activate it.

---

# 🟢 BATCH ACTIVATION

This is extremely important.

QR codes might be printed before the event.

But the campaign should not necessarily work immediately.

Therefore:

```text
QR EXISTS

≠

QR ACTIVE
```

Instead:

```text
PRINTED
    │
    ▼
INACTIVE

    │

EVENT STARTS

    │

    ▼

ACTIVE
```

Then scans work.

---

# 🧠 THE COMPLETE ENTITY RELATIONSHIP

This is the architecture I would lock.

```text
                         KULTUR
                            │
                            │
                    ┌───────┴────────┐
                    │                │
                    ▼                ▼
                 USERS           COMPANIES
                    │                │
                    │                │
                    ▼                ▼
                 ROLES          CAMPAIGNS
                                      │
                        ┌─────────────┼─────────────┐
                        │             │             │
                        ▼             ▼             ▼
                    LOCATIONS       OFFER        BATCHES
                        │                            │
                        │                            ▼
                        │                        QR CODE
                        │                            │
                        ▼                            ▼
                   VOLUNTEERS                      SCANS
                        │                            │
                        ▼                            ▼
                   ASSIGNMENTS                   PARTICIPANTS
                                                     │
                                                     ▼
                                                CONSENTS
                                                     │
                                                     ▼
                                                   CLAIMS
                                                     │
                                                     ▼
                                                 VOUCHERS
```

---

# 🗄️ THE DATABASE I WOULD DESIGN

For Ganesh Puja Phase 1:

## Core

```text
profiles
companies
campaigns
locations
campaign_locations
```

## Operations

```text
volunteers
volunteer_assignments

batches
batch_deliveries
```

## QR

```text
public_scan_codes
```

## Customer Experience

```text
scan_events
game_sessions
```

## Identity

```text
participants
phone_verifications
consents
```

## Business

```text
offers
claims
vouchers
```

---

# 🔥 THE MOST IMPORTANT RELATIONSHIPS

```text
COMPANY

1

│

▼

MANY CAMPAIGNS
```

```text
CAMPAIGN

MANY

↔

MANY

LOCATIONS
```

```text
CAMPAIGN

1

│

▼

MANY BATCHES
```

```text
LOCATION

1

│

▼

MANY DELIVERIES
```

```text
VOLUNTEER

1

│

▼

MANY ASSIGNMENTS
```

```text
BATCH

1

│

▼

MANY SCANS
```

```text
PARTICIPANT

1

│

▼

MANY CLAIMS
```

But:

```text
CAMPAIGN + PARTICIPANT

=

ONE CLAIM
```

for our Phase 1 rule.

---

# 🎯 NOW LET'S DEFINE THE ACTUAL PRODUCT

I would divide KULTUR Ganesh Puja into **five systems**.

---

# SYSTEM 1 — CONTROL SYSTEM

Used by KULTUR.

```text
ADMIN

Company
Campaign
Locations
Batches
Volunteers
Data
```

---

# SYSTEM 2 — GROUND OPERATIONS

Used by volunteers.

```text
VOLUNTEER

Tasks
Delivery
Confirmation
Status
```

---

# SYSTEM 3 — PHYSICAL QR SYSTEM

```text
BATCH

↓

PUBLIC CODE

↓

QR

↓

BOTTLE
```

---

# SYSTEM 4 — PARTICIPANT EXPERIENCE

```text
SCAN

↓

GANESH PUJA PAGE

↓

GAME

↓

OFFER

↓

PHONE

↓

OTP

↓

VOUCHER
```

---

# SYSTEM 5 — INTELLIGENCE

```text
SCANS

GAME STARTS

GAME COMPLETIONS

OFFER OPENS

PHONE VERIFICATIONS

CLAIMS

REDEMPTIONS
```

This creates your funnel:

```text
SCANS
1000

   ↓

GAME STARTS
800

   ↓

GAME COMPLETIONS
600

   ↓

OFFER OPENED
500

   ↓

PHONE VERIFIED
250

   ↓

CLAIMED
200

   ↓

REDEEMED
80
```

# THAT is valuable to the sponsor.

Not just:

> "We distributed 20,000 bottles."

But:

> "8,000 people scanned. 4,900 completed the interaction. 1,800 voluntarily verified their number for the offer. 700 offers were redeemed."

---

# 🧠 WHAT I WOULD REMOVE FOR NOW

To keep us focused:

❌ Sports mode
❌ Concert mode
❌ Generic plugin architecture
❌ CRM integrations
❌ Webhooks
❌ Multi-event component registry
❌ Complex distributed queues
❌ Over-engineered geofencing
❌ 50,000 concurrent-user assumptions

We can design the boundaries correctly without building all of that now.

---

# 🚀 WHAT WE BUILD NOW

# KULTUR GANESH PUJA V1

```text
                    KULTUR ADMIN

                         │

        ┌────────────────┼────────────────┐

        ▼                ▼                ▼

    COMPANY          CAMPAIGN         LOCATIONS

                         │

                         ▼

                      BATCHES

                         │

                         ▼

                        QR

                         │

                         ▼

                      BOTTLES

                         │

                         ▼

                      VOLUNTEER

                         │

                         ▼

                      DELIVERY

                         │

                         ▼

                       ACTIVE

                         │

                         ▼

                      QR SCAN

                         │

                         ▼

                 GANESH PUJA SCREEN

                         │

                         ▼

                   CATCH MODAK

                         │

                         ▼

                       OFFER

                         │

                         ▼

                     PHONE + OTP

                         │

                         ▼

                       CONSENT

                         │

                         ▼

                       CLAIM

                         │

                         ▼

                      VOUCHER

                         │

                         ▼

                    ANALYTICS
```

---

# 🏆 MY EXPERT DECISION

If you ask me:

> **"Where do we begin?"**

We **DO NOT begin with Next.js folders.**

We **DO NOT begin with Supabase SQL.**

We begin with one thing:

# THE DOMAIN MODEL.

Before a single line of code, we lock these answers:

### 1. What exists?

```text
Company
Campaign
Location
Volunteer
Batch
Offer
Participant
Claim
Voucher
```

### 2. Who owns what?

### 3. What can happen to each entity?

### 4. What states can each entity have?

### 5. What relationships exist?

---

## My recommended next step

**Let's do this properly, together:**

### 🧩 STEP 1 — Build the complete KULTUR Ganesh Puja Domain Model

We will take **one entity at a time**:

```text
1️⃣ KULTUR / USERS & ROLES
2️⃣ COMPANY
3️⃣ CAMPAIGN
4️⃣ LOCATION
5️⃣ VOLUNTEER
6️⃣ BATCH
7️⃣ DELIVERY
8️⃣ QR / SCAN
9️⃣ PARTICIPANT
🔟 GAME SESSION
1️⃣1️⃣ OFFER
1️⃣2️⃣ CONSENT
1️⃣3️⃣ CLAIM
1️⃣4️⃣ VOUCHER
1️⃣5️⃣ ANALYTICS
```

For each one, we will decide:

```text
What is it?

Why does it exist?

Who creates it?

Who owns it?

What fields does it need?

What does it connect to?

What states does it have?
```

**Only after this is locked will we design the database.**

One final caution as we build the phone/OTP/lead side: we should architect consent and data collection explicitly rather than assuming an OTP equals marketing permission. India's DPDP framework and telecom consent rules make that separation important. ([DPDP Act 2023][1])

**I recommend our next message starts with Entity #1: `KULTUR USERS, ADMINS & ROLES`—and we design it from absolute basics.**

[1]: https://www.dpdpact2023.com/chapter-2?utm_source=chatgpt.com "Digital Personal Data Protection Act 2023 (DPDP Act 2023) - Ministry of Law and Justice | Official Government Version"

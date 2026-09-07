YES. **Now we stop talking vaguely and actually design Entity #1.**

# KULTUR MONOLITH ARCHITECTURE

## Entity #1 — USERS, ADMINS & ROLES

We are building **one Next.js monolith + one Supabase backend**.

Not microservices.

```text
                ┌─────────────────────┐
                │     NEXT.JS APP     │
                │                     │
                │ Public Scan UI      │
                │ Admin Dashboard     │
                │ Company Portal      │
                │ Volunteer Portal    │
                │ Venue Portal        │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │      SUPABASE       │
                │                     │
                │ Auth                │
                │ PostgreSQL          │
                │ RLS                 │
                │ Realtime            │
                │ Storage              │
                └─────────────────────┘
```

This fits the Next.js App Router model and Supabase's cookie-based auth/RLS architecture well. ([Supabase][1])

---

# FIRST: THE BIGGEST DECISION

## ❌ We should NOT make separate user tables for every role.

Don't do:

```text
admins
advertisers
volunteers
venue_organizers
```

That becomes messy.

Instead:

# ONE AUTH IDENTITY

```text
auth.users
     │
     ▼
profiles
```

Every human being who logs into KULTUR has:

```text
ONE USER
ONE AUTH ID
ONE PROFILE
```

Then we decide:

> **What is this user allowed to do?**

through roles and relationships.

---

# 1️⃣ THE CORE USER ENTITY

## `auth.users`

Supabase manages authentication.

```text
auth.users

id
email
phone
created_at
```

We don't manually mess with this as our main business table.

Then:

# `profiles`

```text
profiles
────────────────────────────

id                UUID PK
auth_user_id      UUID UNIQUE

full_name         TEXT
email             TEXT
phone             TEXT

status            TEXT
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

Relationship:

```text
Supabase Auth
auth.users
    │
    │ 1 : 1
    ▼
profiles
```

Example:

```text
AUTH USER

ID:
abc-123

Email:
abhishek@kultur.in


PROFILE

Name:
Abhishek

Phone:
+91XXXXXXXXXX
```

---

# 2️⃣ WHAT IS A ROLE?

A role answers:

> **What can this person do inside KULTUR?**

For Ganesh Puja Phase 1:

# Our initial roles:

```text
SUPER_ADMIN
KULTUR_ADMIN
COMPANY_ADMIN
VENUE_ORGANIZER
VOLUNTEER
```

And:

```text
CUSTOMER
```

But important:

# 🚨 CUSTOMER IS DIFFERENT

The person scanning the bottle:

```text
QR Scanner
     ↓
plays game
     ↓
claims offer
```

does **not need to become a logged-in KULTUR user**.

Therefore:

```text
AUTHENTICATED PLATFORM USERS

SUPER_ADMIN
KULTUR_ADMIN
COMPANY_ADMIN
VENUE_ORGANIZER
VOLUNTEER
```

while:

```text
PUBLIC USER

CUSTOMER / SCANNER
```

is handled separately through the scan/lead flow.

---

# 3️⃣ THE ROLE TABLE

We should make:

## `roles`

```text
roles
────────────────────────

id                UUID PK

code              TEXT UNIQUE

name              TEXT
description       TEXT
```

Initial records:

```text
SUPER_ADMIN
KULTUR_ADMIN
COMPANY_ADMIN
VENUE_ORGANIZER
VOLUNTEER
```

Example:

| Code            | Meaning                      |
| --------------- | ---------------------------- |
| SUPER_ADMIN     | Full system control          |
| KULTUR_ADMIN    | Kultur operations            |
| COMPANY_ADMIN   | Manages their company        |
| VENUE_ORGANIZER | Manages assigned venue/event |
| VOLUNTEER       | Performs field tasks         |

---

# 4️⃣ CAN A USER HAVE MULTIPLE ROLES?

YES.

This is important.

Imagine:

```text
Abhishek
```

is:

```text
SUPER_ADMIN
```

But another person might be:

```text
VENUE_ORGANIZER
+
VOLUNTEER
```

for some weird operational reason.

So we don't put:

```sql
role = "ADMIN"
```

directly inside `profiles`.

Instead:

# `user_roles`

```text
user_roles

id
user_id
role_id
created_at
```

Relationship:

```text
profiles
    │
    │
    ├────────────┐
    │            │
    ▼            ▼
user_roles     roles
```

More clearly:

```text
USER
 Abhishek
     │
     ├──── SUPER_ADMIN
     │
     └──── KULTUR_ADMIN
```

This is a proper flexible RBAC structure.

Supabase RLS can use authenticated user identity via `auth.uid()`, while authorization logic should remain securely enforced server-side and at the database layer—not merely by hiding UI. ([Next.js][2])

---

# 5️⃣ BUT HERE IS THE REAL KULTUR PROBLEM

Roles alone are **not enough**.

For example:

```text
COMPANY_ADMIN
```

What company?

```text
Khimji?
DN Homes?
Another sponsor?
```

Similarly:

```text
VENUE_ORGANIZER
```

Which venue?

Similarly:

```text
VOLUNTEER
```

Which event?

THIS is where our architecture becomes interesting.

---

# 6️⃣ WE NEED ORGANIZATIONAL OWNERSHIP

Let's establish the major entities.

```text
KULTUR
   │
   ├── Companies
   │
   ├── Events
   │
   ├── Venues
   │
   ├── Campaigns
   │
   └── Users
```

But their relationships matter.

---

# 7️⃣ COMPANY

A company is:

```text
Khimji Jewellers
DN Homes
XYZ Brand
```

Table:

## `companies`

```text
companies
────────────────────────────

id                  UUID PK

name                TEXT
legal_name          TEXT

status              TEXT

logo_url            TEXT

created_at
updated_at
```

Example:

```text
COMPANY

ID:
company_001

Name:
Khimji Jewellers
```

---

# 8️⃣ COMPANY USERS

Now:

> Which people belong to Khimji?

We create:

## `company_members`

```text
company_members
────────────────────────

id

company_id

user_id

role_in_company

created_at
```

Example:

```text
Khimji Jewellers
        │
        │
        ├────────── Rahul
        │           COMPANY_ADMIN
        │
        ├────────── Priya
        │           COMPANY_MEMBER
        │
        └────────── Amit
                    COMPANY_ANALYST
```

This is important because:

# ❌ We should not create one global "advertiser role" and assume access to everything.

Instead:

```text
Rahul
   │
   │ belongs to
   ▼
Khimji
```

Therefore Rahul sees:

```text
ONLY KHIMJI DATA
```

Not DN Homes.

---

# 9️⃣ NOW THE VENUE QUESTION

You previously asked:

> **Venue organizer is location or does it come under event or campaign?**

The answer is:

# 🔥 VENUE ≠ EVENT

This is extremely important.

Example:

```text
LOCATION / VENUE

Saheed Nagar
```

can exist independently.

But:

```text
EVENT

Ganesh Puja 2026
```

happens there.

So:

```text
VENUE
   │
   │ hosts
   ▼
EVENT
```

---

# 🔟 VENUE ENTITY

## `venues`

```text
venues
────────────────────────────

id

name

address

city
state
country

latitude
longitude

geofence_radius_meters

created_at
```

Example:

```text
VENUE

Saheed Nagar Pandal

Latitude:
20.xxxxxx

Longitude:
85.xxxxxx

Geofence:
100 meters
```

---

# 1️⃣1️⃣ EVENT ENTITY

For our Phase 1:

# GANESH PUJA

We create:

## `events`

```text
events
────────────────────────────

id

name

event_type

starts_at
ends_at

status

created_at
```

Example:

```text
EVENT

Ganesh Puja 2026

Type:
FESTIVAL

Starts:
...

Ends:
...
```

---

# IMPORTANT RELATIONSHIP

Initially:

```text
EVENT
   │
   └──────── occurs at ────────► VENUE
```

But long-term an event might use multiple venues.

Therefore architecturally:

# MANY-TO-MANY

```text
events
    │
    │
    ▼
event_venues
    │
    │
    ▼
venues
```

## `event_venues`

```text
event_id
venue_id
```

For Ganesh Puja:

```text
GANESH PUJA 2026
       │
       ├──── Saheed Nagar Pandal
       │
       ├──── Venue B
       │
       └──── Venue C
```

🔥 This gives us future scalability.

---

# 1️⃣2️⃣ WHERE DOES THE VENUE ORGANIZER BELONG?

Not directly:

```text
User → Venue
```

because an organizer might only be responsible for a venue **during a specific event**.

Example:

```text
Rahul

organizes:

Saheed Nagar Pandal
DURING
Ganesh Puja 2026
```

So:

# `event_venue_organizers`

```text
id

event_venue_id

user_id

role
```

Architecture:

```text
USER
  │
  ▼
EVENT VENUE ORGANIZER
  │
  ▼
EVENT + VENUE
```

Example:

```text
Ganesh Puja 2026
        │
        ▼
Saheed Nagar Pandal
        │
        ▼
Venue Organizer
        │
        ▼
Rahul
```

This is much more accurate.

---

# 1️⃣3️⃣ NOW CAMPAIGN

This is where the business starts making sense.

A campaign is:

> **A specific company's marketing activation for a specific event/venue context.**

Example:

```text
Company:
Khimji Jewellers

Event:
Ganesh Puja 2026

Venue:
Saheed Nagar Pandal

Campaign:
Khimji Ganesh Puja Rewards 2026
```

---

# `campaigns`

```text
campaigns
────────────────────────────

id

company_id

event_id

name

status

starts_at
ends_at

created_at
updated_at
```

Relationship:

```text
COMPANY
   │
   │
   ▼
CAMPAIGN
   │
   │
   ▼
EVENT
```

But the campaign may run at one or multiple event venues.

So:

# `campaign_venues`

```text
campaign_id

event_venue_id
```

Architecture:

```text
Khimji
   │
   ▼
Campaign
   │
   ├──── Saheed Nagar
   │
   └──── Another Pandal
```

---

# 🔥 THE MASTER RELATIONSHIP

Now look at this:

```text
                    KULTUR
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
      USERS         COMPANIES       EVENTS
        │              │              │
        │              │              ▼
        │              │           VENUES
        │              │              │
        │              ▼              │
        │          CAMPAIGNS ◄────────┘
        │              │
        │              │
        ▼              ▼
      ROLES        CAMPAIGN
                  ACTIVATION
```

This is our foundation.

---

# 1️⃣4️⃣ NOW THE ADMIN

We need to distinguish:

## SUPER ADMIN

```text
YOU
```

Controls everything.

Can:

```text
Create companies
Create events
Create venues
Create campaigns
Assign users
Create production batches
View everything
```

---

## KULTUR ADMIN

Internal Kultur employee.

Can potentially:

```text
Create campaigns
Manage events
Manage venues
Manage batches
Assign volunteers
```

But perhaps cannot:

```text
Delete system
Create Super Admin
```

---

# 1️⃣5️⃣ COMPANY ADMIN

Example:

```text
Khimji Admin
```

Can see:

```text
Khimji Company

├── Campaigns
├── Leads
├── Offers
├── Coupon Redemptions
└── Analytics
```

Cannot see:

```text
DN Homes
```

Architecture:

```text
USER
  │
  ▼
COMPANY MEMBER
  │
  ▼
KHIMJI
  │
  ▼
KHIMJI CAMPAIGNS
```

---

# 1️⃣6️⃣ VENUE ORGANIZER

They don't need to see company financial information.

They see:

```text
MY EVENT

Ganesh Puja 2026

MY VENUE

Saheed Nagar
```

They can:

```text
Update crowd status

LOW
MEDIUM
HIGH
```

Add:

```text
Announcements
```

Request:

```text
Water Resupply
```

See:

```text
Bottle distribution status
```

But they cannot:

```text
See customer phone numbers
See all campaign leads
See another venue
```

---

# 1️⃣7️⃣ VOLUNTEER

Volunteer is operational.

Example:

```text
Volunteer: Amit

Today's Tasks:

1. Pick Batch A
2. Deliver to Saheed Nagar
3. Confirm arrival
4. Confirm quantity
```

Relationship:

```text
VOLUNTEER
     │
     ▼
VOLUNTEER ASSIGNMENT
     │
     ├──── EVENT
     │
     ├──── VENUE
     │
     └──── PRODUCTION BATCH
```

So we eventually need:

## `volunteer_assignments`

```text
id

volunteer_user_id

event_id

venue_id

batch_id

status

assigned_at
completed_at
```

---

# 1️⃣8️⃣ WHAT DOES THE CUSTOMER LOOK LIKE?

Customer is PUBLIC.

```text
NO LOGIN
NO KULTUR ACCOUNT
```

Flow:

```text
PERSON
   │
   │ scans QR
   ▼
/scan/[batch-code]
   │
   ▼
PUBLIC EXPERIENCE
   │
   ▼
GAME
   │
   ▼
CLAIM OFFER
   │
   ▼
PHONE VERIFICATION
   │
   ▼
LEAD CREATED
```

So:

# Customer ≠ KULTUR User

Initially.

The customer becomes a:

```text
LEAD
```

inside the campaign.

---

# 1️⃣9️⃣ THE FULL ENTITY #1 MODEL

```text
                    ┌──────────────────┐
                    │   auth.users     │
                    │  Supabase Auth   │
                    └────────┬─────────┘
                             │
                             │ 1:1
                             ▼
                    ┌──────────────────┐
                    │     profiles     │
                    └────────┬─────────┘
                             │
                             │
             ┌───────────────┴───────────────┐
             │                               │
             ▼                               ▼
       user_roles                     company_members
             │                               │
             ▼                               ▼
          roles                           companies
```

Then operationally:

```text
                     EVENTS
                        │
                        │
                        ▼
                  EVENT_VENUES
                        │
                        ▼
                     VENUES


COMPANIES
     │
     ▼
 CAMPAIGNS
     │
     ▼
CAMPAIGN_VENUES
     │
     ▼
 EVENT_VENUES
```

---

# 🔥 OUR EXACT GANESH PUJA EXAMPLE

Let's simulate reality.

## STEP 1

You create:

```text
EVENT

Ganesh Puja 2026
```

---

## STEP 2

You create:

```text
VENUE

Saheed Nagar Pandal
```

---

## STEP 3

Connect:

```text
Ganesh Puja 2026
        │
        ▼
Saheed Nagar Pandal
```

---

## STEP 4

Create company:

```text
Khimji Jewellers
```

---

## STEP 5

Create:

```text
CAMPAIGN

Khimji × Ganesh Puja 2026
```

---

## STEP 6

Target:

```text
Saheed Nagar Pandal
```

---

## STEP 7

Assign:

```text
VENUE ORGANIZER

Rahul
```

to:

```text
Ganesh Puja
+
Saheed Nagar
```

---

## STEP 8

Assign volunteer:

```text
Amit
```

to:

```text
Production Batch #001
+
Saheed Nagar
```

---

# FINAL VISUAL

```text
                       KULTUR
                          │
                          │
                   SUPER ADMIN
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    COMPANY             EVENT             USERS
        │                 │                 │
        ▼                 ▼                 ▼
   KHIMJI          GANESH PUJA        VOLUNTEERS
        │                 │
        │                 ▼
        │             VENUES
        │                 │
        └─────────┐       │
                  ▼       ▼
                   CAMPAIGN
                       │
                       │
                       ▼
              CAMPAIGN VENUE
                       │
                       ▼
              PRODUCTION BATCH
                       │
                       ▼
                  QR CODE
                       │
                       ▼
                   CUSTOMER
                       │
                       ▼
                     LEAD
                       │
                       ▼
                     OFFER
```

# 🚨 MY EXPERT DECISION

For KULTUR, **I would NOT start coding campaigns yet.**

I would lock these entities first:

### ENTITY #1A

```text
auth.users
profiles
roles
user_roles
```

### ENTITY #1B

```text
companies
company_members
```

### ENTITY #2

```text
events
venues
event_venues
```

Only after that:

### ENTITY #3

```text
campaigns
campaign_venues
```

Then:

### ENTITY #4

```text
production_batches
```

Then QR.

Because the QR is the **end of an operational chain**, not the beginning.

---

## 🔥 NEXT WE SHOULD DO:

# ENTITY #1A — `KULTUR USERS, PROFILES, ROLES & AUTH`

I will design it **properly from absolute database basics**, including:

* Exact Supabase tables
* Every column
* Primary keys
* Foreign keys
* Why each column exists
* User → Role relationship
* Super Admin security
* How login works
* Next.js route protection
* RLS thinking
* Exact Ganesh Puja example
* Full ER relationship

**And then we move entity by entity until the entire KULTUR monolith is designed.**

The Next.js/Supabase approach is technically sound: Supabase supports cookie-based Next.js auth and RLS, while Next.js recommends separating authentication, session management, and authorization and centralizing secure authorization logic. ([Supabase][1])

[Supabase Next.js Auth guide](https://supabase.com/docs/guides/auth/quickstarts/nextjs?utm_source=chatgpt.com)
[Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com)

**Next: I recommend we build ENTITY #1A in full detail—not just talk about it, but define the actual database architecture.**

[1]: https://supabase.com/docs/guides/auth/quickstarts/nextjs?utm_source=chatgpt.com "Use Supabase Auth with Next.js | Supabase Docs"
[2]: https://nextjs.org/docs/app/guides/authentication?utm_source=chatgpt.com "Guides: Authentication | Next.js"

see KULTUR_V1_SIMEIGHT.md next
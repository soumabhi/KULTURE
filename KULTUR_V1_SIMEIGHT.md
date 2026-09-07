# YES. Let’s design **ENTITY #1A completely**.

We are now officially designing the first real foundation of the **KULTUR monolith**:

# ENTITY #1A

# 👤 KULTUR USERS, PROFILES, AUTHENTICATION & ROLES

And I am going to make one important correction to our earlier architecture:

> **We should not over-engineer this into a generic `roles` + `user_roles` system yet.**

For **Ganesh Puja Phase 1**, we need a clean architecture that works now but can expand later.

Supabase itself recommends keeping application user data in a public table linked to `auth.users`, protected with RLS. Next.js separately emphasizes authentication, session management, and authorization, with sensitive authorization checked against trusted data rather than merely hidden in the UI. ([Next.js][1])

---

# 0. FIRST: WHAT ARE WE ACTUALLY BUILDING?

Before tables, understand this:

There are **two completely different kinds of people** in KULTUR.

```text
┌──────────────────────────────────────┐
│              KULTUR                  │
└──────────────────────────────────────┘

         PEOPLE WHO LOG IN
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼

 KULTUR TEAM   COMPANY      VENUE/
               PEOPLE      VOLUNTEERS


         PUBLIC PEOPLE
                 │
                 ▼

            QR SCANNERS
            / CUSTOMERS
```

These must **not** be treated identically.

---

# A. PLATFORM USERS

These people log into the software.

Examples:

* You
* Kultur employees
* Khimji Jewellers employees
* Venue organizers
* Volunteers

They need:

```text
Authentication
+
Session
+
Authorization
```

---

# B. PUBLIC CUSTOMERS

These people:

```text
Scan QR
    ↓
Open mobile page
    ↓
Play game
    ↓
Claim offer
```

They **do not need a KULTUR account**.

Therefore:

# 🚨 A CUSTOMER SHOULD NOT GO INTO `auth.users`

at least in our Phase 1 architecture.

Their data will eventually belong to:

```text
scan_sessions
leads
voucher_claims
```

We will design those later.

---

# 1. THE AUTHENTICATION FOUNDATION

We use:

# Supabase Auth

```text
┌──────────────────────────────┐
│        SUPABASE AUTH         │
│                              │
│         auth.users           │
│                              │
│  id                          │
│  email                       │
│  phone                       │
│  encrypted credentials       │
│  auth metadata               │
└──────────────┬───────────────┘
               │
               │
               ▼
```

Supabase Auth manages the identity and issues the authenticated user identity used by RLS. For a Next.js SSR application using cookie sessions, Supabase's current guidance is to use its SSR tooling for cookie-based sessions. ([Supabase][2])

---

# IMPORTANT

We do **not** manually create our own:

```text
users
password
password_hash
session_token
```

tables.

❌ Bad:

```text
users

id
email
password_hash
session
```

Why?

Because then we would be rebuilding authentication.

Instead:

```text
Supabase Auth
       +
KULTUR Application Data
```

---

# 2. THE FIRST REAL KULTUR TABLE

# `profiles`

Every authenticated person gets exactly one profile.

```text
auth.users
      │
      │ 1 : 1
      │
      ▼
profiles
```

---

## OUR DESIGN

```sql
profiles
──────────────────────────────────────────

id                      UUID PK

full_name               TEXT

phone                   TEXT

avatar_url              TEXT

status                  TEXT

created_at              TIMESTAMPTZ

updated_at              TIMESTAMPTZ
```

But let's understand every field.

---

# `id`

```text
id UUID PRIMARY KEY
```

This is also:

```text
auth.users.id
```

Relationship:

```text
auth.users.id
       =
profiles.id
```

Example:

```text
auth.users

id:
550e8400-xxxx


profiles

id:
550e8400-xxxx
```

This is the cleanest relationship.

Supabase's own user-management guidance shows a public profile table referencing `auth.users`, commonly with `on delete cascade`. ([Supabase][3])

---

# `full_name`

```text
Abhishek Hansdak
```

Simple.

We do not need:

```text
first_name
middle_name
last_name
```

yet.

For Phase 1:

```text
full_name
```

is enough.

---

# `phone`

This is for internal platform users.

Example:

```text
+919876543210
```

Important:

This is **not** necessarily the same thing as:

```text
auth.users.phone
```

We may later authenticate with email/password while storing a business contact phone.

Therefore:

```text
auth identity
≠
business profile data
```

---

# `avatar_url`

Optional.

Later:

```text
Supabase Storage
       ↓
profile photo
       ↓
avatar_url
```

Not important for MVP.

But cheap to support.

---

# `status`

We should use an enum.

```text
ACTIVE
SUSPENDED
INVITED
```

For Phase 1:

```text
ACTIVE
SUSPENDED
```

is sufficient.

Why?

Imagine a volunteer leaves Kultur.

We don't want to necessarily delete them.

We do:

```text
status = SUSPENDED
```

Their historical activity remains.

---

# 3. THE FIRST BIG DECISION

## HOW DO WE REPRESENT ROLES?

Earlier we said:

```text
roles
user_roles
```

That is flexible.

But I would change our approach.

# For KULTUR, roles are NOT the whole authorization system.

Why?

Because this:

```text
COMPANY_ADMIN
```

doesn't tell us enough.

We need to know:

```text
COMPANY_ADMIN

OF WHICH COMPANY?
```

Similarly:

```text
VENUE_ORGANIZER

OF WHICH EVENT?
OF WHICH VENUE?
```

And:

```text
VOLUNTEER

ASSIGNED TO WHAT?
```

Therefore:

# 🔥 ROLE + RELATIONSHIP

is our actual authorization model.

---

# 4. THE GLOBAL KULTUR ROLE

We have only one truly global hierarchy:

```text
SUPER_ADMIN
KULTUR_ADMIN
```

These are internal Kultur roles.

So:

## `profiles.platform_role`

```text
platform_role
```

Values:

```text
SUPER_ADMIN
KULTUR_ADMIN
NONE
```

Our conceptual table:

```text
profiles
─────────────────────────────

id

full_name

phone

status

platform_role

created_at
updated_at
```

Example:

```text
ABHISHEK

platform_role:

SUPER_ADMIN
```

---

# WHY NOT PUT EVERYTHING HERE?

Don't do this:

```text
platform_role:

SUPER_ADMIN
COMPANY_ADMIN
VENUE_ORGANIZER
VOLUNTEER
```

Because then:

```text
COMPANY_ADMIN
```

has no company attached.

That's broken.

---

# 5. OUR REAL AUTHORIZATION ARCHITECTURE

Here is the system.

```text
                    USER
                      │
                      ▼
                  PROFILE
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼

   GLOBAL AUTHORITY          CONTEXTUAL ACCESS

   SUPER_ADMIN               Company membership
   KULTUR_ADMIN              Venue assignment
                             Volunteer assignment
```

🔥 This is the key concept.

---

# 6. SUPER ADMIN

Example:

```text
Abhishek
```

Profile:

```text
platform_role:

SUPER_ADMIN
```

Access:

```text
✓ Create company
✓ Create event
✓ Create venue
✓ Create campaign
✓ Create batches
✓ Assign volunteers
✓ Invite users
✓ View everything
```

Conceptually:

```text
SUPER_ADMIN
      │
      ▼
ENTIRE KULTUR SYSTEM
```

---

# 7. KULTUR ADMIN

Example:

```text
Future Kultur Operations Manager
```

```text
platform_role:

KULTUR_ADMIN
```

Can:

```text
✓ Manage events
✓ Manage venues
✓ Manage campaigns
✓ Manage production
✓ Manage volunteers
```

But maybe:

```text
✗ Create SUPER_ADMIN
✗ Change critical system settings
```

We'll define exact permissions later.

---

# 8. COMPANY ACCESS IS NOT A GLOBAL ROLE

Now:

# Khimji Jewellers

We need:

```text
companies
```

Later.

But users belong to companies.

Therefore:

# `company_members`

```text
company_members
──────────────────────────────

id

company_id

user_id

membership_role

status

created_at
```

---

## `membership_role`

For Phase 1:

```text
ADMIN
MEMBER
VIEWER
```

Example:

```text
Khimji Jewellers

        │
        │
        ▼

company_members

Rahul → ADMIN
Priya → MEMBER
Amit  → VIEWER
```

---

# VISUAL

```text
                    RAHUL
                      │
                      ▼
                   PROFILE
                      │
                      │
                      ▼
               COMPANY_MEMBER
                      │
                      │
                      ▼
              KHIMJI JEWELLERS
                      │
                      │
                      ▼
               membership_role

                    ADMIN
```

Now we can answer:

> Is Rahul a Company Admin?

YES.

But specifically:

> **Rahul is ADMIN of Khimji Jewellers.**

That is much more powerful.

---

# 9. CAN ONE USER BELONG TO MULTIPLE COMPANIES?

Technically:

# YES.

Example:

```text
Marketing Agency Employee

       Rahul
         │
     ┌───┴────┐
     ▼        ▼

Khimji     DN Homes
ADMIN      VIEWER
```

We may not use this during Ganesh Puja.

But the architecture supports it.

---

# 10. VENUE ORGANIZER IS ALSO CONTEXTUAL

This is extremely important.

Let's revisit:

```text
Rahul
```

Rahul might be:

```text
Organizer
```

But organizer of what?

Not simply:

```text
Venue: Saheed Nagar
```

because the same venue could host different events.

```text
SAHEED NAGAR
      │
      ├── Ganesh Puja
      │
      ├── Durga Puja
      │
      └── Cultural Festival
```

Different organizers could exist.

Therefore:

# Venue Organizer belongs to the Event + Venue context.

Conceptually:

```text
EVENT
   +
VENUE
   ↓
EVENT_VENUE
```

Then:

```text
USER
   │
   ▼
EVENT_VENUE_MEMBER
   │
   ▼
EVENT_VENUE
```

---

# 11. THE FUTURE TABLE

# `event_venue_members`

```text
event_venue_members
────────────────────────────

id

event_venue_id

user_id

role

status

created_at
```

Role:

```text
ORGANIZER
STAFF
VIEWER
```

For Phase 1 we only need:

```text
ORGANIZER
```

---

# Example

```text
EVENT:

Ganesh Puja 2026


VENUE:

Saheed Nagar Pandal


EVENT_VENUE:

Ganesh Puja 2026
+
Saheed Nagar Pandal


MEMBER:

Rahul


ROLE:

ORGANIZER
```

---

# VISUAL

```text
                  RAHUL
                    │
                    ▼
         EVENT_VENUE_MEMBER
                    │
                    │ ROLE
                    ▼
               ORGANIZER
                    │
                    ▼
              EVENT_VENUE
                    │
             ┌──────┴──────┐
             ▼             ▼

       GANESH PUJA      SAHEED NAGAR
          2026             PANDAL
```

🔥 This is correct modelling.

---

# 12. VOLUNTEERS

Volunteers are different.

A volunteer doesn't necessarily "own" a venue.

They perform assignments.

Therefore we should **not** simply say:

```text
profile.role = VOLUNTEER
```

Instead:

```text
USER
  │
  ▼
VOLUNTEER ASSIGNMENT
```

Example:

```text
Amit
 │
 ├── Deliver Batch 001
 │
 │      ↓
 │
 │ Saheed Nagar
 │
 └── Deliver Batch 002
        ↓
      Venue B
```

Therefore:

# Volunteer status is contextual too.

---

# Phase 1

We can create:

## `volunteer_profiles`

```text
volunteer_profiles
────────────────────────

user_id

is_active

emergency_contact

created_at
```

Why separate?

Because not every user is a volunteer.

And volunteer-specific data doesn't belong inside:

```text
profiles
```

---

# Example

```text
profiles

Amit
 ↓

volunteer_profiles

is_active = true
```

Then later:

```text
volunteer_assignments
```

connects Amit to operational work.

---

# 13. SO WHAT ARE OUR ACTUAL USER-RELATED TABLES?

For Entity #1A:

```text
┌────────────────────────────┐
│        auth.users          │
│       Supabase owns        │
└──────────────┬─────────────┘
               │
               │ 1:1
               ▼
┌────────────────────────────┐
│          profiles          │
│       KULTUR owns          │
└──────────────┬─────────────┘
               │
       ┌───────┼──────────┐
       │       │          │
       ▼       ▼          ▼

 COMPANY    VENUE       VOLUNTEER
 MEMBERS    MEMBERS      PROFILE
```

Eventually:

```text
profiles
    │
    ├── company_members
    │
    ├── event_venue_members
    │
    │
    └── volunteer_profiles
```

---

# 14. COMPLETE DATABASE DESIGN

Now let's actually define the schema.

## ENUM #1

```sql
create type public.user_status as enum (
  'ACTIVE',
  'SUSPENDED'
);
```

---

## ENUM #2

```sql
create type public.platform_role as enum (
  'SUPER_ADMIN',
  'KULTUR_ADMIN',
  'NONE'
);
```

---

# `profiles`

```sql
create table public.profiles (

  id uuid primary key
    references auth.users(id)
    on delete cascade,

  full_name text not null,

  phone text,

  avatar_url text,

  status public.user_status
    not null
    default 'ACTIVE',

  platform_role public.platform_role
    not null
    default 'NONE',

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()

);
```

---

# STOP AND UNDERSTAND THIS

Our most important line:

```sql
id uuid primary key
references auth.users(id)
on delete cascade
```

means:

```text
auth.users

User ID
   │
   │
   ▼
profiles

Same User ID
```

If the Auth user is deleted:

```text
profile
   ↓
automatically deleted
```

Supabase documents this pattern for maintaining a public user table linked to `auth.users`. ([Supabase][3])

---

# 15. PROFILE CREATION

When a person signs up:

```text
STEP 1

User signs up

Email:
rahul@khimji.com
```

↓

```text
STEP 2

Supabase creates:

auth.users
```

↓

```text
STEP 3

We create:

profiles
```

↓

```text
STEP 4

User gets:

platform_role = NONE
```

Initially.

---

# Example

```text
auth.users

id:
123
```

Then:

```text
profiles

id:
123

full_name:
Rahul Sharma

platform_role:
NONE
```

Then Super Admin can assign Rahul to:

```text
Khimji Jewellers
```

through:

```text
company_members
```

---

# 16. HOW SHOULD USERS ENTER THE SYSTEM?

This is another important decision.

I recommend:

# 🚨 INVITATION-ONLY

For internal KULTUR users.

Don't allow:

```text
Random person
       ↓
Sign up
       ↓
Become a volunteer
```

No.

Instead:

```text
SUPER ADMIN
      │
      ▼
INVITES USER
      │
      ▼
USER RECEIVES INVITATION
      │
      ▼
USER CREATES ACCOUNT
      │
      ▼
ACCOUNT ACTIVATED
```

---

# WHY?

Because our system contains:

```text
Corporate leads
Campaign information
Venue operations
Volunteer logistics
```

We don't want open registration.

---

# GANESH PUJA PHASE 1 FLOW

You:

```text
SUPER_ADMIN
```

go to:

```text
/admin/users
```

You click:

```text
Invite User
```

You enter:

```text
Name: Amit
Email: amit@example.com
```

Then select:

```text
Volunteer
```

But remember:

Volunteer is not a global role.

Therefore internally:

```text
Create Auth Invitation
       ↓
User joins
       ↓
Profile created
       ↓
Volunteer profile created
```

Then:

```text
Assign work later
```

---

# 17. HOW WILL LOGIN WORK?

I recommend for Phase 1:

# EMAIL + PASSWORD

Why?

Because our users are:

```text
Admins
Company employees
Venue organizers
Volunteers
```

They are controlled users.

Flow:

```text
┌──────────────┐
│ Login Page   │
└──────┬───────┘
       │
       ▼

Email
Password

       │
       ▼

Supabase Auth

       │
       ▼

Authenticated
       │
       ▼

Get auth.uid()
       │
       ▼

Load profile
       │
       ▼

Determine access
```

---

# 18. AUTHENTICATION ≠ AUTHORIZATION

This is CRITICAL.

Suppose Rahul logs in.

Authentication asks:

> Who are you?

```text
Rahul
```

Authorization asks:

> What can Rahul do?

```text
Rahul

Can access:

✓ Khimji
✓ Khimji Campaigns

Cannot access:

✗ DN Homes
✗ Master Admin
```

Next.js explicitly separates authentication, session management, and authorization, and recommends centralizing authorization logic for sensitive actions. ([Next.js][1])

---

# 19. THE AUTHORIZATION PIPELINE

Every protected operation follows:

```text
REQUEST
   │
   ▼
AUTHENTICATION
   │
   │ Is user logged in?
   │
   ▼
USER ID
   │
   ▼
AUTHORIZATION
   │
   │ Does this user have permission?
   │
   ▼
DATABASE ACCESS
```

---

# 20. EXAMPLE: COMPANY ADMIN

Rahul requests:

```text
GET

/admin/company/campaigns
```

System:

```text
STEP 1

Is Rahul logged in?

YES
```

↓

```text
STEP 2

auth.uid()

123
```

↓

```text
STEP 3

Does Rahul belong to Khimji?

SELECT company_members
WHERE user_id = 123
```

↓

```text
YES
```

↓

```text
STEP 4

What role?

ADMIN
```

↓

```text
ALLOW
```

---

# 21. EXAMPLE: WRONG COMPANY

Rahul tries:

```text
/admin/company/dn-homes
```

System:

```text
auth.uid()

123
```

↓

```text
company_members

Does user 123 belong to DN Homes?

NO
```

↓

# ❌ DENIED

---

# 22. WHERE SHOULD THIS AUTHORIZATION HAPPEN?

# THREE LAYERS.

```text
┌───────────────────────────────┐
│          NEXT.JS UI           │
│                               │
│ Hide buttons                  │
│ Redirect users                │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│       SERVER AUTHORIZATION    │
│                               │
│ Server Actions                │
│ Route Handlers                │
│ Data Access Layer             │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│         SUPABASE RLS          │
│                               │
│ Final database protection     │
└───────────────────────────────┘
```

---

# 🔥 VERY IMPORTANT

UI protection alone means nothing.

Bad:

```tsx
if (user.role === "ADMIN") {
  showDeleteButton()
}
```

A hacker can directly call the endpoint.

Therefore:

```text
UI
+
Server authorization
+
RLS
```

Next.js recommends centralized authorization/data-access logic, while Supabase RLS provides database-level row filtering as defense in depth. ([Next.js][1])

---

# 23. OUR NEXT.JS MONOLITH STRUCTURE

For authentication:

```text
src/

├── app/
│
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   └── ...
│   │
│   └── ...
│
├── lib/
│
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   │
│   └── auth/
│       ├── require-user.ts
│       ├── require-platform-admin.ts
│       ├── require-company-access.ts
│       └── require-event-venue-access.ts
│
└── types/
    └── database.types.ts
```

Supabase's current Next.js guidance uses separate browser/server clients for the respective rendering environments. ([Supabase][4])

---

# 24. THE DATA ACCESS LAYER

This is where I want KULTUR to be disciplined.

We create:

```text
lib/auth/
```

Inside:

```text
require-user.ts
```

Conceptually:

```text
requireUser()
```

Does:

```text
Get current authenticated user

If no user:
    reject

Load profile

If suspended:
    reject

Return:
    user + profile
```

---

# 25. `requirePlatformAdmin()`

Conceptually:

```text
requirePlatformAdmin()
```

Checks:

```text
platform_role

SUPER_ADMIN
OR
KULTUR_ADMIN
```

If:

```text
NONE
```

↓

```text
DENY
```

---

# 26. `requireCompanyAccess(companyId)`

This is more interesting.

```text
requireCompanyAccess(
  companyId
)
```

Logic:

```text
Get authenticated user
       │
       ▼

Is SUPER_ADMIN?

YES
 ↓
ALLOW

NO
 ↓

Check company_members

Does user belong
to companyId?

YES
 ↓
ALLOW

NO
 ↓
DENY
```

Visual:

```text
              USER
                │
                ▼

       SUPER_ADMIN?
           │
      ┌────┴────┐
     YES       NO
      │         │
    ALLOW       ▼

         COMPANY MEMBER?
             │
        ┌────┴────┐
       YES       NO
        │         │
      ALLOW      DENY
```

---

# 27. `requireEventVenueAccess()`

Same concept.

```text
requireEventVenueAccess(
  eventVenueId
)
```

Checks:

```text
SUPER_ADMIN?
```

or:

```text
KULTUR_ADMIN?
```

or:

```text
event_venue_members?
```

If organizer:

```text
ALLOW
```

Otherwise:

```text
DENY
```

---

# 28. RLS — THE DATABASE FIREWALL

Now the really important part.

Every exposed table should have RLS enabled and only the required database privileges granted. Supabase's current RLS documentation explicitly recommends treating grants and policies separately and writing policies deliberately per operation. ([Supabase][5])

---

# PROFILE RLS

We want:

```text
User can see:

Their own profile
```

So conceptually:

```sql
CREATE POLICY
"Users can view own profile"

ON profiles

FOR SELECT

TO authenticated

USING (
  auth.uid() = id
);
```

Supabase documents `auth.uid()` as the authenticated user's ID and shows this pattern for own-row policies. ([Supabase][5])

---

# UPDATE

User can update:

```text
full_name
phone
avatar_url
```

But they must NOT update:

```text
platform_role
status
```

This is important.

---

# 🚨 COLUMN SECURITY PROBLEM

A simple RLS policy:

```text
User can update own profile
```

could allow:

```text
platform_role = SUPER_ADMIN
```

if we are careless.

Therefore:

# We should NOT let clients directly update profiles freely.

Instead:

```text
Client
   │
   ▼
Server Action
   │
   ▼
Validate allowed fields
   │
   ▼
Database
```

Example:

```text
updateMyProfile()

Allowed:

full_name
phone
avatar_url
```

Never:

```text
platform_role
status
```

---

# 29. WHO CAN CHANGE PLATFORM ROLES?

Only:

```text
SUPER_ADMIN
```

Eventually:

```text
SUPER_ADMIN
       │
       ▼
assignPlatformRole()
```

Example:

```text
Abhishek

assigns:

KULTUR_ADMIN

to:

Operations Manager
```

---

# 30. THE SUPER ADMIN BOOTSTRAP PROBLEM

Very important.

How do we create the FIRST Super Admin?

If the system has:

```text
No Super Admin
```

then:

> Who creates the Super Admin?

Answer:

# Bootstrap manually.

For initial development:

```text
1. Create your Supabase Auth account.

2. Create your profile.

3. Run one secure SQL migration.

4. Set:

platform_role = SUPER_ADMIN
```

Example:

```sql
update public.profiles
set platform_role = 'SUPER_ADMIN'
where id = 'YOUR_AUTH_USER_ID';
```

But:

# 🚨 This should not be an API.

We never expose:

```text
/promote-me-to-super-admin
```

😂

---

# 31. INVITATION ARCHITECTURE

For KULTUR, I recommend:

```text
SUPER ADMIN
      │
      ▼
INVITE
      │
      ▼
SUPABASE AUTH
      │
      ▼
USER ACCEPTS
      │
      ▼
PROFILE
      │
      ▼
ASSIGN CONTEXTUAL ACCESS
```

---

# Example: Khimji Employee

You create:

```text
Khimji Jewellers
```

Then:

```text
Invite Rahul
```

After signup:

```text
auth.users
       │
       ▼
profiles
       │
       ▼
company_members
```

Result:

```text
Rahul

belongs to

Khimji Jewellers

role:

ADMIN
```

---

# 32. FULL ENTITY RELATIONSHIP

Now let's see the complete Entity #1 architecture.

```text
                 ┌────────────────────┐
                 │    auth.users      │
                 │                    │
                 │   SUPABASE AUTH    │
                 └─────────┬──────────┘
                           │
                           │ 1 : 1
                           │
                           ▼
                 ┌────────────────────┐
                 │     profiles       │
                 │                    │
                 │ id                 │
                 │ full_name          │
                 │ phone              │
                 │ status             │
                 │ platform_role      │
                 └─────────┬──────────┘
                           │
             ┌─────────────┼───────────────┐
             │             │               │
             ▼             ▼               ▼

     company_members  event_venue_members  volunteer_profiles

             │             │               │
             │             │               │
             ▼             ▼               ▼

         COMPANIES      EVENT_VENUES     VOLUNTEER
```

---

# 33. OUR USER TYPES NOW

## 👑 SUPER ADMIN

```text
profiles.platform_role

SUPER_ADMIN
```

Scope:

```text
GLOBAL
```

---

## 🏢 KULTUR ADMIN

```text
profiles.platform_role

KULTUR_ADMIN
```

Scope:

```text
GLOBAL INTERNAL OPERATIONS
```

---

## 💎 COMPANY ADMIN

```text
company_members

membership_role:

ADMIN
```

Scope:

```text
SPECIFIC COMPANY
```

---

## 🎪 VENUE ORGANIZER

```text
event_venue_members

role:

ORGANIZER
```

Scope:

```text
SPECIFIC EVENT + VENUE
```

---

## 🚚 VOLUNTEER

```text
volunteer_profiles
```

Scope:

```text
ASSIGNED OPERATIONAL TASKS
```

---

# 34. THIS IS THE MOST IMPORTANT CONCEPT

# WE DON'T REALLY HAVE "5 TYPES OF USERS."

We have:

# ONE USER

```text
USER
```

with different relationships.

Example:

```text
                 RAHUL
                   │
                   ▼
                PROFILE
                   │
        ┌──────────┴───────────┐
        │                      │
        ▼                      ▼

COMPANY MEMBER        EVENT VENUE MEMBER

Khimji                Ganesh Puja

ADMIN                 ORGANIZER
```

Theoretically, Rahul could have both.

Our database doesn't break.

🔥 This is why relationship-based authorization is superior.

---

# 35. GANESH PUJA EXAMPLE

Let's populate our future system.

## Abhishek

```text
PROFILE

Name:
Abhishek

platform_role:

SUPER_ADMIN
```

---

## Rahul

```text
PROFILE

Name:
Rahul

platform_role:

NONE
```

Membership:

```text
COMPANY:

Khimji Jewellers

ROLE:

ADMIN
```

---

## Suresh

```text
PROFILE

Name:
Suresh

platform_role:

NONE
```

Event Venue Membership:

```text
EVENT:

Ganesh Puja 2026

VENUE:

Saheed Nagar Pandal

ROLE:

ORGANIZER
```

---

## Amit

```text
PROFILE

Name:
Amit

platform_role:

NONE
```

Volunteer:

```text
volunteer_profiles

is_active:

TRUE
```

---

# 36. ACCESS MATRIX

| Person          | System Access               |
| --------------- | --------------------------- |
| Super Admin     | Everything                  |
| Kultur Admin    | Internal operations         |
| Company Admin   | Their company's data        |
| Venue Organizer | Their event + venue         |
| Volunteer       | Their assignments           |
| QR Customer     | Public scan experience only |

---

# 37. ROUTE ARCHITECTURE

For our monolith:

```text
/
│
├── scan/
│   └── [batchCode]/
│
├── login/
│
├── admin/
│   │
│   ├── dashboard/
│   │
│   ├── users/
│   ├── companies/
│   ├── events/
│   ├── venues/
│   └── campaigns/
│
├── company/
│   │
│   ├── dashboard/
│   ├── campaigns/
│   ├── leads/
│   └── vouchers/
│
├── venue/
│   │
│   ├── dashboard/
│   └── live/
│
└── volunteer/
    │
    ├── dashboard/
    └── assignments/
```

---

# 38. SHOULD WE HAVE `/admin/master`?

I would simplify.

❌ Old:

```text
/admin/master
/admin/advertiser
/admin/venue
/admin/volunteer
```

I prefer:

```text
/admin/*
```

for internal Kultur administration.

And:

```text
/company/*
/venue/*
/volunteer/*
```

for contextual portals.

Why?

Because:

```text
/admin
```

means:

> Kultur controls this.

---

# 39. LOGIN REDIRECTION

After login:

```text
USER LOGS IN
      │
      ▼
LOAD ACCESS CONTEXT
      │
      ▼
WHERE SHOULD THEY GO?
```

---

## Super Admin

```text
/admin/dashboard
```

---

## Kultur Admin

```text
/admin/dashboard
```

---

## Company Admin

```text
/company/dashboard
```

---

## Venue Organizer

```text
/venue/dashboard
```

---

## Volunteer

```text
/volunteer/dashboard
```

---

# BUT WHAT IF ONE USER HAS MULTIPLE ACCESS TYPES?

Example:

```text
Rahul

Company Admin
+
Venue Organizer
```

Then:

# ❌ Never automatically guess.

Instead:

```text
/choose-workspace
```

```text
Welcome Rahul

Choose workspace:

[ Khimji Jewellers ]

[ Ganesh Puja Venue ]

```

This is a very scalable pattern.

---

# 40. THE SESSION FLOW

Our architecture:

```text
LOGIN
  │
  ▼
Supabase Auth
  │
  ▼
Session Cookie
  │
  ▼
Next.js Server
  │
  ▼
Authenticated User
  │
  ▼
Data Access Layer
  │
  ▼
Authorization Check
  │
  ▼
Page / Server Action
```

Supabase's SSR guidance supports cookie-based sessions so the authenticated session can be available to both server and client rendering contexts. ([Supabase][2])

---

# 41. DO WE PUT ROLES INSIDE JWT?

# My answer for KULTUR:

## NOT FOR PHASE 1.

Why?

You could put:

```text
role: SUPER_ADMIN
```

inside JWT custom claims.

But roles and memberships can change.

Example:

```text
Rahul removed from Khimji.
```

An old token could still contain stale claims until refreshed.

Therefore:

# Sensitive authorization checks should use current database data.

Next.js distinguishes lightweight session-based checks from secure checks against database-backed authorization data. ([Next.js][1])

---

# Our approach

```text
COOKIE

used for:

Identity
```

Then:

```text
DATABASE

used for:

Authorization
```

---

# 42. RLS STRATEGY

We should NOT write hundreds of complex policies immediately.

We start with a clear philosophy.

## Rule #1

```text
Public customer tables

ONLY expose what public customers need.
```

---

## Rule #2

```text
Authenticated user tables

RLS enabled.
```

---

## Rule #3

```text
Every contextual table

checks membership.
```

---

# Example

Company campaign:

```text
campaigns

company_id
```

Company user:

```text
company_members

company_id
user_id
```

RLS eventually says:

```text
Allow access

IF:

current user

belongs to

campaign.company_id
```

---

# Conceptually

```text
USER
  │
  ▼
COMPANY MEMBER?
  │
  │ YES
  ▼
COMPANY
  │
  ▼
CAMPAIGN
```

---

# 43. RLS HELPER FUNCTIONS

Eventually, we should create private helper functions.

For example:

```text
private.is_super_admin()
```

and:

```text
private.has_company_access(company_id)
```

and:

```text
private.has_event_venue_access(event_venue_id)
```

Supabase's RLS documentation specifically discusses carefully designed `security definer` helper functions for membership checks and recommends putting such helpers in a non-exposed schema with a fixed `search_path`. ([Supabase][5])

---

# Example conceptually

```sql
private.has_company_access(
  company_id
)
```

Returns:

```text
TRUE
```

if:

```text
User is:

SUPER_ADMIN

OR

belongs to company
```

---

# Then RLS becomes readable

Instead of:

```sql
massive horrible SQL
with ten joins
```

we can conceptually use:

```sql
using (
  private.has_company_access(company_id)
)
```

But we will design the actual secure SQL later when the `companies` entity exists.

---

# 44. INDEXING

We need indexes on authorization relationships.

For example:

```text
company_members

user_id
company_id
```

We will likely query:

```text
WHERE user_id = ?
```

and:

```text
WHERE company_id = ?
```

So indexes matter.

Supabase recommends indexing columns used by RLS filters; membership tables especially need indexes matching the direction in which authorization queries filter. ([Supabase][5])

---

# 45. OUR EXACT ENTITY #1A DATA MODEL

Here is the final architecture.

```text
┌─────────────────────────────────────────────┐
│                  auth.users                 │
│                                             │
│                 SUPABASE                    │
└──────────────────────┬──────────────────────┘
                       │
                       │ 1 : 1
                       ▼
┌─────────────────────────────────────────────┐
│                   profiles                  │
│                                             │
│ PK id                                       │
│ FK auth.users.id                            │
│                                             │
│ full_name                                   │
│ phone                                       │
│ avatar_url                                  │
│ status                                      │
│ platform_role                               │
│ created_at                                  │
│ updated_at                                  │
└──────────────────────┬──────────────────────┘
                       │
             ┌─────────┼──────────┐
             │         │          │
             ▼         ▼          ▼

      company_members  event_venue_members  volunteer_profiles

             │             │                │
             ▼             ▼                ▼

          COMPANY      EVENT + VENUE     VOLUNTEER
```

---

# 46. WHAT WE ARE NOT BUILDING YET

Very important.

We are NOT yet building:

```text
companies
events
venues
campaigns
batches
QR
leads
offers
```

Those are separate entities.

Entity #1A only establishes:

# WHO IS THIS PERSON?

and:

# HOW DOES THE SYSTEM KNOW THEY ARE ALLOWED TO DO SOMETHING?

---

# 47. FINAL DECISIONS — LOCKED 🔒

## Authentication

```text
Supabase Auth
```

---

## Session

```text
Cookie-based SSR session
```

---

## Public customer

```text
NO PLATFORM ACCOUNT
```

---

## Internal users

```text
Invitation controlled
```

---

## User identity

```text
auth.users
```

---

## User profile

```text
profiles
```

---

## Global authority

```text
SUPER_ADMIN
KULTUR_ADMIN
NONE
```

inside:

```text
profiles.platform_role
```

---

## Company access

```text
company_members
```

---

## Venue organizer access

```text
event_venue_members
```

---

## Volunteer identity

```text
volunteer_profiles
```

---

## Authorization

```text
UI
+
Next.js Server Authorization
+
Supabase RLS
```

---

# 🔥 THE ONE-SENTENCE ARCHITECTURE

> **KULTUR has one authenticated human identity (`auth.users` → `profiles`), while almost all permissions come from the person's relationship to a specific company, event-venue, or operational assignment—not from a giant global role list.**

---

# WHERE WE GO NEXT

Now Entity #1A is architecturally designed.

The next logical entity is:

# 🏢 ENTITY #1B — COMPANIES & COMPANY MEMBERSHIP

We will design:

```text
COMPANY
     │
     ├── Company details
     │
     ├── Sponsor information
     │
     ├── Branding
     │
     ├── Company members
     │
     └── Campaign ownership
```

And most importantly:

# **Exactly how a Super Admin creates a company and gives that company access to KULTUR.**

Then the chain becomes:

```text
USERS
   ↓
COMPANIES
   ↓
EVENTS
   ↓
VENUES
   ↓
CAMPAIGNS
   ↓
BATCHES
   ↓
QR
   ↓
SCANS
   ↓
GAMES
   ↓
CLAIMS
   ↓
LEADS
   ↓
OFFERS
   ↓
ANALYTICS
```

**This is now becoming a real system architecture, not just an idea.**

[1]: https://nextjs.org/docs/app/guides/authentication?utm_source=chatgpt.com "Guides: Authentication | Next.js"
[2]: https://supabase.com/docs/guides/auth/server-side?utm_source=chatgpt.com "Server-Side Rendering | Supabase Docs"
[3]: https://supabase.com/docs/guides/auth/managing-user-data?utm_source=chatgpt.com "User Management | Supabase Docs"
[4]: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs?utm_source=chatgpt.com "Build a User Management App with Next.js | Supabase Docs"
[5]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"

see KULTUR_V1_SIMNINE.md next
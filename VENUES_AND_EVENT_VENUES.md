YES BHAI. Now we do **ENTITY #4 — VENUES & EVENT VENUES**.

This is where **KULTUR stops being purely software** and connects to the actual Ganesh Puja ground operation: pandals, volunteers, bottle deliveries, GPS, campaigns, and QR scans.

I checked the current official Supabase and Next.js guidance. Supabase explicitly supports modeling relationships with foreign keys and many-to-many relationships through join tables—which is exactly why we should separate `venues` from `event_venues`. RLS should then enforce who can access which rows. ([Supabase][1])

---

# 📍 ENTITY #4 — VENUES & EVENT VENUES

## First: the most important distinction

There are **four things** people can accidentally mix together:

```text
LOCATION
VENUE
EVENT
VENUE ORGANIZATION
```

They are NOT the same thing.

---

# 1️⃣ WHAT IS A LOCATION?

A location is simply a geographic place.

Example:

```text
Saheed Nagar
Bhubaneswar
Odisha
India
```

It answers:

> **Where is something?**

A location can have:

```text
address
city
state
country
latitude
longitude
```

But for Phase 1:

# ❌ We do NOT need a separate `locations` entity.

Why?

Because we're building for **Ganesh Puja first**, not Google Maps.

Creating:

```text
countries
states
cities
areas
locations
```

would be unnecessary complexity.

---

# 2️⃣ WHAT IS A VENUE?

A Venue is:

> **A real physical place where KULTUR can operate.**

Example:

```text
Saheed Nagar Ganesh Puja Pandal
```

Another example:

```text
Rasulgarh Ganesh Puja Pandal
```

Later:

```text
Kalinga Stadium
```

---

# 🧠 Venue answers:

```text
WHERE CAN KULTUR OPERATE?
```

---

# THE `venues` TABLE

I recommend:

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

geofence_radius_meters

created_at

updated_at
```

Example:

```text
VENUE

name:
Saheed Nagar Ganesh Puja Pandal

city:
Bhubaneswar

state:
Odisha

latitude:
...

longitude:
...

geofence_radius_meters:
100
```

---

# 🗺️ WHY GPS BELONGS HERE

Because GPS describes the **real physical location**.

```text
VENUE
   │
   ├── latitude
   │
   ├── longitude
   │
   └── geofence radius
```

A volunteer eventually arrives there.

The system checks:

```text
Volunteer GPS
      │
      ▼
Distance from Venue GPS
      │
      ▼

Inside radius?

YES → Allow operation

NO → Block operation
```

---

# 🔥 BUT HERE IS THE BIG PROBLEM

Let's say:

```text
Saheed Nagar Pandal
```

exists in:

```text
Ganesh Puja 2026
```

What happens in:

```text
Ganesh Puja 2027?
```

Do we create another venue?

```text
Saheed Nagar Pandal 2026

Saheed Nagar Pandal 2027
```

# ❌ NO.

That creates duplicate physical entities.

Instead:

```text
VENUE

Saheed Nagar Pandal
```

is reusable.

Then:

```text
Ganesh Puja 2026
          │
          ▼
     EVENT_VENUE
          │
          ▼
Saheed Nagar Pandal
```

---

# 3️⃣ WHAT IS AN EVENT VENUE?

This is the most important concept.

> **An Event Venue represents a specific Venue participating operationally in a specific Event.**

Example:

```text
EVENT:
Ganesh Puja 2026

VENUE:
Saheed Nagar Pandal
```

Together:

# EVENT VENUE

---

# Visualize it

```text
┌─────────────────────────┐
│ EVENT                   │
│                         │
│ Ganesh Puja 2026        │
└────────────┬────────────┘
             │
             │
             ▼
      EVENT VENUE
             │
             │
             ▼
┌─────────────────────────┐
│ VENUE                   │
│                         │
│ Saheed Nagar Pandal     │
└─────────────────────────┘
```

---

# 🧠 WHY DO WE NEED THIS EXTRA TABLE?

Because the relationship itself has information.

For example:

```text
Saheed Nagar Pandal
```

might have permanent information:

```text
Address
GPS
City
```

But during:

```text
Ganesh Puja 2026
```

we need:

```text
Operational status

Opening time

Closing time

Assigned venue organization

KULTUR activation status
```

These are **event-specific**.

So we don't put them in `venues`.

We put them in:

```text
event_venues
```

---

# 🏗️ THE CORRECT DATABASE MODEL

```text
┌───────────────┐
│    EVENTS     │
└───────┬───────┘
        │
        │
        ▼
┌──────────────────┐
│   EVENT_VENUES   │
└─────────┬────────┘
          │
          │
          ▼
┌──────────────────┐
│      VENUES      │
└──────────────────┘
```

This is a standard relational approach: foreign keys represent relationships, and a dedicated join/relationship table is appropriate when the relationship itself needs data. ([Supabase][1])

---

# 4️⃣ THE `event_venues` TABLE

My recommended structure:

```text
event_venues
────────────────────────────

id

event_id

venue_id

venue_organization_id

status

opens_at

closes_at

created_at

updated_at
```

---

# REAL EXAMPLE

```text
EVENT_VENUE

Event:
Ganesh Puja 2026

Venue:
Saheed Nagar Pandal

Venue Organization:
Saheed Nagar Ganesh Puja Committee

Status:
ACTIVE
```

---

# 🔥 NOW WE INTRODUCE THE VENUE ORGANIZATION

Remember Entity #2?

```text
ORGANIZATION

Saheed Nagar Ganesh Puja Committee
```

Its type:

```text
VENUE_ORGANIZATION
```

That organization manages the event venue.

So:

```text
Saheed Nagar Committee
         │
         │ manages
         ▼
Saheed Nagar Event Venue
         │
         ▼
Ganesh Puja 2026
```

---

# 🎯 WHY I PREFER THIS

Because management can change.

Imagine:

### Ganesh Puja 2026

```text
Saheed Nagar Committee A
```

manages it.

### Ganesh Puja 2027

```text
Committee B
```

manages it.

The physical location hasn't changed.

```text
VENUE
Saheed Nagar Pandal
```

But the event-specific manager might.

Therefore:

```text
venue_organization_id
```

belongs more naturally to:

```text
event_venues
```

than permanently to `venues`.

🔥 This is a subtle but important architecture decision.

---

# 5️⃣ THE FULL RELATIONSHIP

Now look at this carefully:

```text
              ORGANIZATION
                    │
                    │
                    │ manages
                    ▼
                 EVENT_VENUE
                    │
           ┌────────┴────────┐
           │                 │
           ▼                 ▼
         EVENT              VENUE
```

Example:

```text
Saheed Nagar Committee
            │
            │ manages
            ▼
Saheed Nagar Event Venue
        /               \
       /                 \
      ▼                   ▼
Ganesh Puja 2026    Saheed Nagar Pandal
```

# THIS is the relationship we want.

---

# 6️⃣ VENUE STATUS VS EVENT VENUE STATUS

These should be different.

## Venue

The physical place:

```text
Saheed Nagar Pandal
```

might always exist in our database.

Its status could be:

```text
ACTIVE
INACTIVE
```

---

## Event Venue

Its participation in an event:

```text
Ganesh Puja 2026
```

could be:

```text
PLANNED
ACTIVE
CLOSED
CANCELLED
```

Example:

```text
VENUE
Saheed Nagar Pandal

Status:
ACTIVE
```

But:

```text
EVENT VENUE

Ganesh Puja 2026

Status:
CLOSED
```

after the festival ends.

These are different concepts.

---

# 7️⃣ WHAT DOES `EVENT_VENUE` ACTUALLY BECOME?

This is where KULTUR becomes interesting.

The Event Venue is our:

# 🏕️ OPERATIONAL HUB

Everything physical connects here.

```text
EVENT VENUE
      │
      ├── Venue Organization
      │
      ├── Campaign Deployments
      │
      ├── Bottle Batches
      │
      ├── Volunteer Assignments
      │
      └── Scan Analytics
```

🔥

This means:

> **The Event is the big container. The Event Venue is where actual operations happen.**

---

# 8️⃣ NOW LET'S PUT GANESH PUJA INTO THE DATABASE

Imagine Master Admin creates:

```text
EVENT

Ganesh Puja 2026
```

Then:

```text
VENUES

1. Saheed Nagar Pandal

2. Rasulgarh Pandal

3. Nayapalli Pandal
```

Then the system creates:

```text
EVENT_VENUES

Ganesh Puja 2026
+
Saheed Nagar Pandal


Ganesh Puja 2026
+
Rasulgarh Pandal


Ganesh Puja 2026
+
Nayapalli Pandal
```

Visually:

```text
                  GANESH PUJA 2026
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼

     EVENT VENUE     EVENT VENUE     EVENT VENUE
          │              │              │
          ▼              ▼              ▼

       Saheed        Rasulgarh      Nayapalli
       Nagar          Pandal         Pandal
```

---

# 9️⃣ NOW WHERE DOES THE CAMPAIGN GO?

This is the next major connection.

Let's say:

```text
SPONSOR

Khimji Jewellers
```

creates:

```text
CAMPAIGN

Khimji Ganesh Puja Rewards 2026
```

The campaign belongs to the event:

```text
Khimji Campaign
       │
       ▼
Ganesh Puja 2026
```

But it needs to operate at:

```text
Saheed Nagar

Rasulgarh
```

Not Nayapalli.

---

# ❌ WRONG DESIGN

```text
campaigns

venue_id
```

Why wrong?

Because that means:

```text
ONE CAMPAIGN
=
ONE VENUE
```

But we want:

```text
ONE CAMPAIGN
=
MULTIPLE VENUES
```

---

# ✅ CORRECT DESIGN

We need another relationship table:

```text
campaign_deployments
```

Like this:

```text
CAMPAIGN
    │
    │
    ▼
CAMPAIGN_DEPLOYMENT
    │
    │
    ▼
EVENT_VENUE
```

---

# Example

```text
Khimji Campaign
      │
      ├───────────────┐
      │               │
      ▼               ▼

Deployment A      Deployment B

      │               │

      ▼               ▼

Saheed Nagar    Rasulgarh
```

🔥

---

# THE FUTURE TABLE

```text
campaign_deployments
────────────────────────

id

campaign_id

event_venue_id

status

created_at
```

For now, just remember it.

We will design Campaigns properly later.

---

# 🔟 WHERE DO VOLUNTEERS GO?

Remember:

```text
Volunteer
```

is a KULTUR user.

They belong to:

```text
KULTUR Organization
```

But during Ganesh Puja:

```text
Volunteer Rahul
        │
        │ assigned
        ▼
EVENT VENUE
        │
        ▼
Saheed Nagar
```

So eventually:

```text
volunteer_assignments
```

will exist.

```text
VOLUNTEER
      │
      ▼
VOLUNTEER_ASSIGNMENT
      │
      ▼
EVENT_VENUE
```

---

# Example

```text
Rahul
  │
  ▼
Volunteer Assignment
  │
  ▼
Saheed Nagar Event Venue
  │
  ▼
Ganesh Puja 2026
```

---

# 🧠 WHY NOT PUT `event_venue_id` INSIDE PROFILES?

Because Rahul can work at:

```text
Day 1

Saheed Nagar
```

Then:

```text
Day 3

Rasulgarh
```

Then next year:

```text
Ganesh Puja 2027
```

So assignments are dynamic.

# User ≠ Assignment.

---

# 1️⃣1️⃣ WHERE DOES GEO-FENCING HAPPEN?

This is important.

Our data:

```text
VENUE

latitude
longitude
geofence_radius_meters
```

Volunteer browser:

```text
navigator.geolocation
```

returns:

```text
Volunteer Latitude

Volunteer Longitude
```

Then:

```text
                VENUE
                  │
                  │
       latitude / longitude
                  │
                  ▼

            DISTANCE CHECK
                  ▲
                  │
                  │
          VOLUNTEER GPS
```

---

# The logic

```text
Distance ≤ geofence radius?
```

### YES

```text
✓ Allow delivery confirmation
```

### NO

```text
❌ Block confirmation
```

---

# 🚨 BUT AN IMPORTANT REAL-WORLD CORRECTION

I would **not make GPS the only source of truth**.

Why?

GPS can be inaccurate.

A phone might report:

```text
±30 meters
```

or worse.

So we should eventually support:

```text
GPS verification
+
manual supervisor override
```

For Phase 1:

```text
GPS CHECK
      │
      ├── Inside radius → Allow
      │
      └── Outside radius → Require Admin Override
```

This will prevent volunteers from getting stuck because of poor GPS.

---

# 1️⃣2️⃣ WHERE DOES THE GEOFENCE RADIUS BELONG?

My initial recommendation:

```text
venues.geofence_radius_meters
```

Because it describes the physical area.

Example:

```text
Small Pandal:

50 meters
```

```text
Large Pandal:

150 meters
```

---

# BUT!

Later, we may discover that the geofence needs to change per event.

Example:

```text
Ganesh Puja 2026:

100 meters
```

```text
Ganesh Puja 2027:

200 meters
```

If that happens:

```text
event_venues
```

can have an optional override:

```text
geofence_radius_override_meters
```

But:

# ❌ We do not need this now.

Keep Phase 1 clean.

---

# 1️⃣3️⃣ WHAT DATA SHOULD THE VENUE ORGANIZER SEE?

This is where access control becomes contextual.

Suppose:

```text
Saheed Nagar Committee
```

manages:

```text
Saheed Nagar Event Venue
```

Their dashboard should see:

```text
✓ Their venue

✓ Their campaigns

✓ Their announcements

✓ Their relevant scan metrics

✓ Their resupply status
```

But:

```text
❌ Rasulgarh operations

❌ Other venue data

❌ Khimji's internal global data
```

---

# SECURITY MODEL

```text
USER
  │
  ▼
ORGANIZATION MEMBERSHIP
  │
  ▼
VENUE ORGANIZATION
  │
  ▼
EVENT VENUE
```

The database checks the relationship.

This is exactly the type of row-level access model for which Supabase RLS is useful: policies execute in the database and can express relationship-based access rules rather than trusting only frontend checks. ([Supabase][2])

---

# 1️⃣4️⃣ THE VENUE ORGANIZER RELATIONSHIP

Let's make this crystal clear.

## Organization:

```text
Saheed Nagar Ganesh Puja Committee
```

## Venue:

```text
Saheed Nagar Pandal
```

## Event:

```text
Ganesh Puja 2026
```

## Event Venue:

```text
Saheed Nagar Pandal
during
Ganesh Puja 2026
```

Now:

```text
┌─────────────────────────────────┐
│ ORGANIZATION                    │
│                                 │
│ Saheed Nagar Committee          │
└───────────────┬─────────────────┘
                │
                │ manages
                ▼
┌─────────────────────────────────┐
│ EVENT_VENUE                     │
│                                 │
│ Saheed Nagar × Ganesh Puja 2026 │
└───────────┬─────────────┬───────┘
            │             │
            ▼             ▼
        EVENT            VENUE
```

# This is our architecture.

---

# 1️⃣5️⃣ SHOULD A VENUE ORGANIZATION MANAGE MULTIPLE VENUES?

# YES.

Example:

```text
ORGANIZATION

Ganesh Festival Committee
          │
          ├── Venue A
          │
          ├── Venue B
          │
          └── Venue C
```

Our design supports that.

---

# 1️⃣6️⃣ CAN ONE VENUE HAVE DIFFERENT ORGANIZATIONS?

# YES.

Across different events.

Example:

```text
VENUE

Kalinga Stadium
```

During:

```text
Event A

Organization A manages operations
```

During:

```text
Event B

Organization B manages operations
```

Therefore:

# Organization management belongs to the Event Venue context.

Not necessarily permanently to the Venue.

---

# 🏆 THE FINAL VENUE DATABASE DESIGN

## `venues`

```text
venues
────────────────────────────

id uuid PK

name text

slug text unique

address text

city text

state text

country text

latitude numeric

longitude numeric

geofence_radius_meters integer

status

created_at

updated_at
```

---

# `event_venues`

```text
event_venues
────────────────────────────

id uuid PK

event_id uuid FK → events

venue_id uuid FK → venues

venue_organization_id uuid FK → organizations

status

opens_at

closes_at

created_at

updated_at
```

---

# 🔒 IMPORTANT CONSTRAINT

We should prevent:

```text
Ganesh Puja 2026
+
Saheed Nagar Pandal

being added twice.
```

So:

```text
UNIQUE(event_id, venue_id)
```

This is important.

---

# 1️⃣7️⃣ OUR SYSTEM SO FAR

Now look at what we have built conceptually.

```text
                         USERS
                           │
                           ▼
                        PROFILES
                           │
                           ▼
                ORGANIZATION_MEMBERS
                           │
                           ▼
                     ORGANIZATIONS
                           │
               ┌───────────┼───────────┐
               │           │           │
               ▼           ▼           ▼

            KULTUR      SPONSOR     VENUE ORG



                          EVENTS
                            │
                            ▼
                      EVENT_VENUES
                       /          \
                      /            \
                     ▼              ▼

                VENUES        VENUE ORG
```

Now the physical and digital worlds are beginning to connect.

---

# 🔥 THE ACTUAL GANESH PUJA MODEL

```text
                        KULTUR
                          │
                          │ Creates
                          ▼
                GANESH PUJA 2026
                       EVENT
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼

     EVENT VENUE      EVENT VENUE      EVENT VENUE

          │               │                │

          ▼               ▼                ▼

      Saheed           Rasulgarh        Nayapalli
      Nagar             Pandal           Pandal

          │

          ├───────────────┐

          │               │

          ▼               ▼

      Venue Org       Campaigns

          │               │

          ▼               ▼

      Organizers      Batches

                          │

                          ▼

                      QR SCANS
```

🔥🔥🔥

---

# 🧠 THE MOST IMPORTANT THING WE LEARNED

## A VENUE is a physical place.

```text
Saheed Nagar Pandal
```

## An EVENT is an occasion.

```text
Ganesh Puja 2026
```

## An EVENT VENUE is:

```text
Saheed Nagar Pandal

during

Ganesh Puja 2026
```

## A VENUE ORGANIZATION is:

```text
Saheed Nagar Ganesh Puja Committee
```

They are **four different things**.

---

# 🔒 ENTITY #4 — PROVISIONALLY LOCKED

We now have:

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

---

# 🚀 NOW COMES THE BUSINESS HEART OF KULTUR

# 🟣 ENTITY #5 — CAMPAIGNS

This is where we finally answer:

* What exactly is a Campaign?
* Who creates it?
* Does KULTUR create it or the Sponsor?
* How does a Sponsor Organization connect to it?
* Does a Campaign belong to one Event?
* Can one Campaign deploy to multiple Event Venues?
* What is the difference between a **Campaign** and a **Campaign Deployment**?
* Where do the offer, sponsor branding, QR configuration, game, and phone-number collection rules live?
* How do we prevent our database from becoming a giant JSON mess?

And we will construct:

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
         │ deploys through
         ▼
CAMPAIGN_DEPLOYMENTS
         │
         ▼
    EVENT_VENUES
```

# **THIS is where KULTUR's actual money-making engine begins.**

Next, we should design **ENTITY #5 — CAMPAIGNS** from absolute basics.

[1]: https://supabase.com/docs/guides/database/tables?utm_source=chatgpt.com "Tables and Data | Supabase Docs"
[2]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"

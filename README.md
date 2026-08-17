<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# DhakaMove — AI-Powered Smart Bus System for Dhaka

**Industry:** Urban Mobility & Public Transportation

**Solution Type:** AI-Integrated Mobile Platform

**Target Market:** Dhaka Metropolitan Area, Bangladesh

**DevPost Link:** https://devpost.com/software/dhakamove-ai-powered-smart-bus-system-for-dhaka

---

## The Problem

Every day, millions of Dhaka commuters stand at bus stops with zero information — no tracking, no booking, no certainty. The entire system runs blind.

- No way to know if the bus is 2 minutes or 40 minutes away
- Cash-only, no seat guarantee, chaotic boarding
- No safety visibility for family members
- Average commuter loses 3–4 hours daily to transit uncertainty
- Annual economic loss from Dhaka traffic: $3.8 billion USD (World Bank)

> Ahmed books a bus from Kuril to Gulistan. He arrives at 8:15am. By 9:00am, he still does not know — is the bus stuck in Banani? Did it already pass? He has no information. He just waits and guesses.

---

## The Solution

DhakaMove is a three-sided platform connecting commuters, bus operators, and city planners through a single intelligent system. It is built around three core principles:

**Visibility** — every commuter should know exactly where their bus is and when it will arrive, down to the minute.

**Control** — every commuter should be able to book a seat, pay digitally, and plan their trip without standing in uncertainty.

**Intelligence** — the system should learn Dhaka's patterns over time and proactively serve both commuters and operators with predictions, not just data.

The platform has three separate interfaces: a mobile app for commuters, a web dashboard for bus operators, and a data portal for city planners and BRTA. All three are powered by the same underlying data layer.

---

## Core Features — Detailed

### 1. Live Bus Tracking on Map

Every bus enrolled in DhakaMove carries a small GPS device installed in the vehicle. This device sends the bus's exact coordinates to the DhakaMove server every 5 seconds over a mobile data connection. The commuter app receives this data and renders the bus as a moving icon on a live map.

The map shows the full route path as a line, with every stop marked along it. The user can see how many stops remain before their pickup point, the current speed of the bus, and a live countdown in minutes. If the bus makes an unscheduled stop — for example, stuck in traffic — the countdown updates in real time.

This works for multiple buses simultaneously. If three buses are running on the same route, the commuter can see all three on the map and decide which one to catch.

- GPS location transmitted every 5 seconds via mobile data
- Route path, remaining stops, and live countdown all visible simultaneously
- Multiple buses on the same route displayed at once
- Map works on low-bandwidth connections for users with slower mobile data

### 2. Smart ETA with Dhaka Traffic Intelligence

Standard GPS applications calculate ETA using a simple formula: distance divided by average speed. This fails completely in Dhaka because the city's traffic is not average — it is highly time-dependent and location-dependent.

DhakaMove's ETA engine uses a machine learning model trained on months of historical GPS data from Dhaka roads. The model knows that the Farmgate intersection adds 12–18 minutes between 8am and 10am on weekdays, that Gulshan Avenue moves freely after 9pm, and that rain increases journey times on the Mirpur corridor by an average of 40%. These patterns are built into every ETA calculation.

The model continuously updates as new trip data comes in. The more buses and trips in the system, the more accurate it becomes.

- ML model trained on Dhaka-specific road and traffic data
- Time-of-day and day-of-week awareness built into every prediction
- Weather integration: rain, storm alerts adjust ETA automatically
- ETA recalculates every 30 seconds as the bus moves

### 3. Digital Seat Booking

Before DhakaMove, there was no concept of a reserved seat on a Dhaka public bus. Passengers rushed to board, the strongest got seats, and the rest stood for the entire journey. DhakaMove introduces structured seat booking to this system for the first time.

When a commuter opens the app and searches for a route, they see available buses with departure times and seat availability displayed as a simple grid — similar to booking a movie ticket. They select their preferred seat, confirm the booking, and pay through bKash, Nagad, Rocket, or a debit or credit card via SSLCommerz. A QR code ticket is generated instantly and stored in the app.

On the bus, a conductor device or a small scanner at the door reads the QR code when the passenger boards. The system marks the seat as occupied and the ticket as used. If a passenger does not show up, the seat is automatically released 2 minutes before departure.

- Seat map displayed per bus, updated in real time as bookings come in
- Payment via bKash, Nagad, Rocket, and card through SSLCommerz gateway
- QR code stored in the app — works without internet once downloaded
- No-show seat release: unoccupied booked seats released 2 minutes before departure
- Booking history and digital receipts stored in the app permanently

### 4. Nearest Stop Finder

The app uses the commuter's device GPS to detect their current location and displays all bus stops within walking distance, ranked by proximity. Each stop shows which bus routes pass through it, the next scheduled arrival for each route, and the live ETA based on current GPS data from active buses.

The stop data and route maps are cached on the device so the feature works even when the user has limited or no internet connection. This matters in Dhaka where connectivity can be inconsistent in certain areas.

- Stop list sorted by walking distance from user's current location
- Each stop shows all routes passing through it and next bus arrival times
- Live ETA per bus pulled from real GPS data, not just schedules
- Core data cached offline so the feature works without active internet

### 5. Smart Proactive Notifications

Most apps require users to open them and check actively. DhakaMove reverses this. Once a commuter books a trip or saves a regular route, the system monitors the bus in the background and sends push notifications at the right moments without the user doing anything.

The notification logic is designed around Dhaka's walking patterns. If a stop is typically a 7-minute walk from a residential area, the system sends the alert 9–10 minutes before the bus arrives — giving the user just enough time to walk out and reach the stop without running.

- "Your bus is 12 minutes away — leave now to reach the stop comfortably"
- "Bus delayed due to Mohakhali flyover congestion — new arrival time: 7:02 PM"
- "Your next bus on Route 8 is 4 minutes away — the one after it is in 19 minutes"
- "Heavy rain detected near Mirpur — estimated 25-minute delay on your route today"

Notification timing is personalised. The app learns how long each user typically takes to reach their stop and adjusts the alert window accordingly over time.

### 6. Crowd Level Indicator

Before boarding, commuters want to know whether a bus is comfortable or unbearably packed. DhakaMove estimates crowd level using two data sources: the number of scanned QR tickets relative to total bus capacity, and weight sensor data from buses equipped with it.

The result is displayed as a simple colour indicator on every bus visible on the map and in search results. Commuters can make an informed decision — board the current bus or wait 4 minutes for the next one that is half-empty.

- Crowd estimate derived from QR scan count vs. total seat and standing capacity
- Three levels: Comfortable, Moderate, and Packed
- Displayed on the map icon and in the route search results
- Updated every time a ticket is scanned or a passenger exits

### 7. Journey Share (Safety Feature)

Safety is a real concern for commuters in Dhaka, particularly for women traveling alone and for anyone traveling late at night. Journey Share addresses this directly.

When a commuter starts a trip, they can tap "Share Journey" and send a link to any contact — family member, friend, or colleague. That contact opens the link in any browser (no app required) and sees a live map showing the bus moving along the route, the user's current stop, and the estimated arrival time at the destination.

The system sends automatic WhatsApp or SMS notifications to the shared contact at three points: when the commuter boards the bus, when the bus is 2 stops from the destination, and when the commuter has arrived. If the bus deviates significantly from its route, an alert is sent to the contact automatically.

- Live tracking link works in any browser — the contact does not need the app
- Automatic notifications at boarding, near destination, and on arrival
- Route deviation alert: if bus goes off its registered path, contacts are notified
- Full trip log saved to the commuter's account after each journey

### 8. Driver and Bus Rating

After every completed trip, the app prompts the commuter with a quick 5-star rating screen. The rating covers four specific areas: driver behaviour, bus cleanliness, air conditioning or fan condition, and punctuality. An optional text comment can be added in Bangla or English.

This data feeds two places. First, it is visible to other commuters in the app — buses with consistently high ratings are highlighted in search results. Second, it feeds the operator's analytics dashboard, where patterns in ratings are surfaced automatically by the AI feedback system.

- 4-dimension rating: driver, cleanliness, AC/fan, punctuality
- Optional Bangla or English text comment
- High-rated buses highlighted in search results for other commuters
- All ratings fed into the operator analytics dashboard and AI analysis engine

---

## AI Integration (Powered by Gemini API)

### AI Trip Assistant

The most visible AI feature in the app. The commuter opens a chat interface and types their request in plain Bangla or English — no specific format required. The AI reads the message, understands the intent, checks current traffic data and bus availability, and responds with a complete trip plan.

> User: "Amare sokal 9tar moddhe Motijheel pouchate hobe, ami Uttaray achi."
> 
> AI: "Depart from Uttara Sector 10 Stop at 7:40 AM. Take Bus Route 19 toward Motijheel. Due to current Mirpur Road congestion, I recommend leaving 10 minutes earlier than usual today. Estimated arrival at Motijheel: 8:52 AM. The bus currently has 14 available seats."

The assistant is powered by Gemini API and has access to live bus data, real-time traffic, and the user's booking history to personalise its responses.

### AI Traffic Prediction

A separate ML model that runs continuously in the background, analyzing GPS speed data from all active buses across all routes. It produces corridor-level congestion predictions for the next 30, 60, and 90 minutes and feeds this data into the ETA engine and the Trip Assistant.

### AI Demand Forecasting

Analyzes historical booking and boarding data to predict which routes will be overcrowded at which times. Operators receive daily forecasts through their dashboard so they can schedule extra buses in advance rather than reacting after the fact.

### Behavioral Pattern Learning

After a commuter uses the app for 2 weeks, the system identifies their regular routes and times. It then sends proactive morning alerts without the user needing to search — the alert includes today's live traffic situation on their usual route and whether they should leave earlier or later than normal.

### Automated Feedback Analysis

The AI reads all text comments and star ratings across the entire fleet and produces a weekly operator report. It identifies specific buses, drivers, or routes with declining ratings, clusters complaints by category, and prioritises which issues need immediate attention versus gradual improvement.

### Dynamic Route Optimization

Over 3–6 months of operation, the system accumulates data on exactly where passengers board and exit every bus, every day. The AI analyzes this to identify stops with very low usage, areas with high boarding density but no nearby stop, and routes where most passengers exit before the final stop. These findings are packaged as data-backed proposals for BRTA and city planners.

---

## User Flow

```
Open App
  |
Enter: From (Kuril) to (Banani)
  |
AI suggests best bus and departure time
  |
Book seat → Pay via bKash → Receive QR ticket
  |
Live Map: Watch bus move toward you
  |
Alert: "Bus arriving in 8 minutes — head to stop"
  |
Board → Scan QR → Sit in reserved seat
  |
Share live journey with family
  |
Arrive → Rate the trip
```

---

## Current Limitations

These are honest constraints the project faces right now. They are not reasons to abandon the idea — they are the real challenges that need to be solved for the system to work at scale.

### 1. GPS Hardware Dependency

Every bus in the system must have a GPS device installed. This requires physical hardware procurement, installation across a large and fragmented fleet, and ongoing maintenance. Bus owners in Dhaka operate independently and may resist the cost and inconvenience of installation. Without hardware on the bus, there is no live tracking — the core feature does not work.

**Current reality:** For the hackathon prototype, GPS can be simulated using a phone mounted in a vehicle. At scale, this becomes a major operational and financial challenge.

### 2. No Centralized Bus Authority to Partner With

Dhaka's bus system is not run by a single entity. Hundreds of independent bus owners and small operators run their own vehicles under loose route associations. There is no single operator to sign a partnership with. Onboarding the system means convincing hundreds of individual owners one by one, or working through BRTA — a slow government process.

**Current reality:** Without operator buy-in, there are no buses in the system. This is the most difficult non-technical problem the project faces.

### 3. Conductor and Driver Resistance

The existing cash-based system benefits conductors and some drivers who may pocket fares without accountability. A digital booking and QR scan system removes this informality. Conductors may actively resist adoption, refuse to scan tickets, or undermine the process on the ground.

**Current reality:** Technology adoption requires human buy-in at every level. A QR scanner means nothing if the conductor ignores it.

### 4. Low Smartphone and Data Penetration Among Commuters

A significant portion of Dhaka's bus commuters — particularly those using lower-cost routes — use basic feature phones or have limited mobile data access. A smartphone app with live maps requires a reasonably modern device and an active data connection. These commuters would be excluded from the system in its current form.

**Current reality:** The app serves the segment with smartphones well. The lower-income majority segment is not yet served by this design.

### 5. No Historical Traffic Data to Train the AI Model

The AI Traffic Prediction engine requires months of historical GPS and traffic data from Dhaka roads to make accurate predictions. At launch, this data does not exist. In the early months, ETA predictions will be less accurate than claimed because the model has not yet learned Dhaka's patterns from real data.

**Current reality:** The AI gets smarter over time, but at launch it is essentially a rule-based system with general traffic assumptions — not a trained model.

### 6. Payment Gateway Reliability

bKash and Nagad are widely used in Bangladesh, but payment gateway failures and timeout errors are not uncommon. If a payment fails mid-booking, the user may lose confidence in the system. Handling failed transactions, refunds, and double-charges cleanly requires careful backend engineering.

**Current reality:** Payment reliability is a trust issue. One bad payment experience can cause a user to abandon the app permanently.

### 7. Real-Time Infrastructure Cost

Streaming GPS data from hundreds of buses, serving live map updates to thousands of concurrent users, and running AI predictions in the background requires significant cloud infrastructure. These are ongoing costs that scale with the number of buses and users, and must be covered before the platform reaches a revenue-generating scale.

**Current reality:** The unit economics only work at scale. Early operations will run at a loss until the fleet and user base grow large enough.

### 8. Offline and Low-Connectivity Scenarios

Dhaka has areas with inconsistent mobile coverage, and buses travel through tunnels, underpasses, and dense urban canyons where GPS signal drops. When a bus loses connectivity, its live position on the map freezes. When a commuter's phone has no data, the live map does not load.

**Current reality:** The app needs a degraded-mode experience — showing last-known position, cached schedules, and estimated position based on route speed — when connectivity is unavailable.

---

## Impact

- 45–60 minutes saved per commuter per day
- Safer solo travel, especially for women
- 20–30% better bus utilization for operators
- Optimized routes reduce fuel waste and emissions
- Digital payments bring unbanked users into the formal system

---

> "DhakaMove is not just a product — it is digital infrastructure for a city that has been underserved for too long. We are giving 22 million people what they deserve: certainty, safety, and control over their daily journey."

---

## Setup & Development

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

View your app in AI Studio: https://ai.studio/apps/1e1c2545-76bb-4c10-b66b-32dccd6e64f0

**DhakaMove — Smarter Buses. Safer Journeys. Better Dhaka.**

# Court Booking Platform

A full-stack web application for managing multi-resource bookings at a sports facility. Users can book courts, rent equipment, and hire coaches in atomic transactions with dynamic pricing and waitlist management.

## Deployed Links

- Frontend (Vercel): https://booking-court-app.vercel.app/
- Backend API (Render): https://booking-court-app.onrender.com/api/

> Note: The frontend uses `REACT_APP_API_BASE` at build time if set (Vercel environment variable). If not set, it falls back to the Render API URL above.

## Features

### 1. Multi-Resource Booking
- **Atomic Transactions**: Court + Equipment + Coach bookings are atomic—either all resources are reserved or none.
- **Concurrent Safety**: Uses MongoDB transactions and sessions to prevent double-booking.
- **Resource Validation**: Real-time availability checks across courts, equipment inventory, and coach schedules.

### 2. Dynamic Pricing Engine
- **Configurable Rules**: Admin-driven pricing rules (not hardcoded).
- **Rule Stacking**: Peak hours + Weekend + Indoor court premiums all apply together.
- **Live Price Breakdown**: Users see itemized cost before confirming.

Rules supported:
- **Peak Hours** (e.g., 6-9 PM): Multiplier (e.g., 1.5x)
- **Weekend Surcharge**: Fixed surcharge on Sat/Sun
- **Court Type Premium**: Indoor courts cost more than outdoor

### 3. Admin Configuration
- **Courts**: Add, edit, disable courts. Set base prices per court.
- **Equipment**: Manage inventory (rackets, shoes). Set rental rates.
- **Coaches**: Add coaches with hourly rates.
- **Pricing Rules**: Create and enable/disable dynamic pricing rules.

### 4. Waitlist & Cancellation
- If a slot is fully booked, users can join a waitlist.
- On cancellation, the first person in the waitlist is automatically promoted to a confirmed booking.

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Atlas or local)
- **Version Control**: Git

## Project Structure

```
/root
├── /backend
│   ├── /config        # DB connection setup
│   ├── /controllers   # Booking, courts, equipment, coaches logic
│   ├── /models        # Mongoose schemas
│   ├── /routes        # API endpoints
│   ├── /middleware    # Error handling, auth placeholders
│   ├── /utils         # Availability checker, price calculator, booking service
│   ├── server.js      # Entry point
│   ├── seed.js        # Database seeding script
│   └── package.json
│
├── /frontend
│   ├── /public
│   ├── /src
│   │   ├── /components
│   │   │   ├── CourtSelector.js
│   │   │   ├── TimeSlotSelector.js
│   │   │   ├── EquipmentSelector.js
│   │   │   ├── CoachSelector.js
│   │   │   └── PriceBreakdown.js
│   │   ├── /pages
│   │   │   ├── BookingPage.js
│   │   │   ├── BookingHistoryPage.js
│   │   │   └── AdminPanel.js
│   │   ├── /services
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (Atlas or local)

### Backend Setup

1. **Navigate to backend**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```env
   MONGO_URI=your mongo url
   PORT=5001
   ```
   > **Note**: Port 5001 is used to avoid conflicts with macOS AirPlay on port 5000.

4. **Run database seed** (populates courts, equipment, coaches, pricing rules):
   ```bash
   npm run seed
   ```

5. **Start the server**:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5001`.

### Frontend Setup

1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`.

## API Endpoints

### Courts
- `GET /api/courts` - List all courts
- `POST /api/courts` - Create a new court
- `PUT /api/courts/:id` - Update court (edit name, type, price, or toggle active status)
- `DELETE /api/courts/:id` - Delete a court

### Equipment
- `GET /api/equipment` - List all equipment
- `POST /api/equipment` - Add new equipment
- `PUT /api/equipment/:id` - Update equipment (edit name, quantity, rental price, or toggle active status)
- `DELETE /api/equipment/:id` - Delete equipment

### Coaches
- `GET /api/coaches` - List all coaches
- `POST /api/coaches` - Add new coach
- `PUT /api/coaches/:id` - Update coach (edit name, hourly rate, or toggle active status)
- `DELETE /api/coaches/:id` - Delete a coach

### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create a booking (atomic with availability check)
- `POST /api/bookings/check-availability` - Check if resources are available
- `POST /api/bookings/calculate-price` - Calculat
- `PUT /api/pricing/:id` - Update pricing rule (edit name, type, multiplier, surcharge, or toggle active status)
- `DELETE /api/pricing/:id` - Delete a pricing rulee price with breakdowns
- `POST /api/bookings/cancel` - Cancel booking and promote waitlist
- `GET /api/bookings/waitlist` - View waitlist

### Pricing Rules
- `GET /api/pricing` - List all pricing rules
- `POST /api/pricing` - Create a new pricing rule


## Pricing Engine Logic

1. **Base Price**: Retrieved from the court object.
2. **Apply Rules** (in order):
   - Time-based rules (peak hours): Multiply base price
   - Day-based rules (weekends): Add surcharge
   - Court-type rules (indoor premium): Add surcharge
3. **Equipment Fees**: Sum of all rented equipment costs
4. **Coach Fee**: Hourly rate of selected coach
5. **Total**: base + equipment + coach

Rules stack—all applicable rules are applied.

## Availability Logic

To prevent double-booking, the system:

1. **Checks Court Availability**: Queries overlapping confirmed bookings for the court.
2. **Checks Coach Availability**: Ensures the coach has no overlapping bookings.
3. **Checks Equipment Stock**: Verifies total available inventory minus booked quantities ≥ requested.
4. **Atomic Booking**: Uses MongoDB transactions. If any check fails, the entire booking fails.
5. **Waitlist Fallback**: If unavailable, user is added to waitlist (optional).

## Concurrency & Waitlist

- **Transactions**: All booking operations use MongoDB sessions to ensure atomicity.
- **Waitlist**: Users can opt-in if their preferred slot is full.
- **Auto-Promotion**: On cancellation, the first person in the waitlist is automatically promoted and notified.
- **Position Tracking**: Waitlist entries are ordered by position; on promotion, remaining positions are decremented.

## Seed Data

The `seed.js` script populates:

- **4 Courts**: 2 indoor ($15/hr), 2 outdoor ($10/hr)
- **2 Equipment**: Rackets (8 units @ $5), Shoes (6 units @ $3)
- **3 Coaches**: Coach A ($20/hr), Coach B ($25/hr), Coach C ($18/hr)
- **3 Pricing Rules**:
  - Peak Hours (6-9 PM): 1.5x multiplier
  - Weekend Surcharge: +$5
  - Indoor Premium: +$3

Run `npm run seed` to populate the database.

## Frontend Workflow

1. **Booking Page**:
   - Enter name and select date
   - Choose court
   - Select time slot
   - Add equipment (optional)
   - Add coach (optional)
   - See live price breakdown
   - Check availability
   - Confirm booking → Receive booking ID

2. **Booking History**:
   - View all past bookings with details and status
   - See pricing b (full CRUD for all resources):
   - **Courts**: Add, edit, delete, toggle enable/disable
   - **Equipment**: Add, edit, delete, toggle enable/disable
   - **Coaches**: Add, edit, delete, toggle enable/disable
   - **Pricing Rules**: Add, edit, delete, toggle enable/disable
   - **Inline Editing**: Edit resources directly in the list with immediate savet, coaches
   - Create and enable/disable pricing rules
   - View all configurations

## Example Workflow

1. User selects "Court 1 (Indoor)" on 2024-12-15, 6 PM for 1 hour.
2. User adds 2 rackets ($5 each) and selects "Coach A" ($20/hr).
3. **Price Calculation**:
   - Base: $15 (Court 1 indoor)
   - Peak Hour: $15 × 1.5 = $22.50 (6 PM is peak)
   - Indoor Premium: +$3 → $25.50
   - Equipment: 2 × $5 = $10
   - Coach: $20
   - **Total: $55.50**
4. User checks availability → All resources available ✓
5. User confirms booking → Booking confirmed with ID.

If the court was already booked, the system would offer a waitlist option instead.

## Notes & Assumptions(10 PM), displayed in 12-hour AM/PM format.
2. **Peak Hours**: Configurable via pricing rules (default 6-9 PM)
1. **Time Slots**: Fixed 1-hour slots (6 AM to 6 PM).
2. **Peak Hours**: Hardcoded as 6-9 PM (6 PM rule), but configurable via pricing rules.
3. **User Authentication**: Not implemented in this MVP. Each booking requires a name input.
4. **Notifications**: Waitlist promotio with optimized state management for multi-resource editing.
7. **Equipment Pricing**: Fixed async state issue—equipment rental costs now correctly calculated in real-tim.
5. **Pricing Rules Params**: Simplified for MVP; can be extended for more complex rules.
6. **Frontend State**: Uses React hooks; consider Redux/Context for larger scale.








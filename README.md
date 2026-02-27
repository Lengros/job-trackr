# JobTrackr

A mobile-first clickable web prototype for field service workers (plumbers, electricians, builders). The prototype simulates a complete job management workflow — from receiving a job to completion with photos, expenses, and auto-calculations.

Built for field validation with real workers to test UX hypotheses before building the full product.

## Quick Start

```bash
chmod +x init.sh
./init.sh
```

Or manually:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser (375px viewport recommended for mobile testing).

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** CSS Modules (mobile-first)
- **Routing:** React Router v6
- **State:** React Context + useReducer
- **Data:** In-memory fixtures (no backend)

## Screens

1. **Master Selection** — Choose a field worker profile
2. **Job List** — Browse assigned jobs with status tabs
3. **Job Detail** — View full job info and change status
4. **Photos** — View/add/delete job photos (simulated upload)
5. **Expenses** — Add/edit/delete expense items with auto-calculation
6. **Job Summary** — Receipt-style breakdown with grand total
7. **Sync Status** — View offline/online sync state for all items

## Features

- Mobile-first responsive layout (375px optimized)
- Complete job lifecycle: New → In Progress → Completed
- Expense tracking with auto-calculations
- Simulated photo uploads
- Network toggle (online/offline simulation)
- Sync status tracking (synced, pending, error, conflict)

## Project Structure

```
src/
├── components/    # Shared components (Layout, Header)
├── context/       # React Context + reducer for state
├── data/          # Fixture data (masters, jobs, photos, expenses)
├── screens/       # Screen components (7 screens)
└── styles/        # CSS Modules
```

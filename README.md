# QuarantineCare — Hospital Virus Quarantine & Treatment Management System

QuarantineCare is a centralized clinical and operational management web application designed for virus quarantine isolation facilities operating under strict admission, daily thermometry, physician rounds, and discharge protocols.

---

## 🏥 Problem Solved

A virus quarantine facility with a maximum capacity of **74 patients** experiences operational friction when relying on paper journals and disconnected procedures:
- Duplicate or missed daily temperature readings.
- Attending doctors visiting patients prior to temperature records being taken.
- Delayed discharge notices causing patients to occupy isolation beds longer than necessary.
- Absence of real-time monitoring of clinical outcomes against viral benchmarks (15% mortality ceiling and 85% expected treatment success rate).

**QuarantineCare** resolves these bottlenecks through systematic business rule automation:
1. **Enforced Single Daily Reading**: Only one official temperature record per patient per calendar day is permitted, eliminating duplicate and conflicting entries.
2. **Gated Clinical Workflow**: Doctors cannot complete or sign off on daily rounds until that day's temperature has been officially logged by nursing staff.
3. **Automated 3-Day Fever-Free Discharge Detection**: The system continuously tracks consecutive fever-free full calendar days (< 38.0°C). Any fever spike or missed reading breaks the streak. Once 3 full days elapse, Admin staff receive instantaneous clearance notifications.
4. **Explicit Administrative Discharge & Instant Room Release**: Administrative confirmation processes the discharge, immediately sanitizing and returning the bed (1–74) to the active inventory.
5. **Dynamic Epidemiological Analytics**: Mortality and recovery rates are computed strictly from resolved cases (excluding currently admitted patients) and benchmarked against the 15% mortality and 85% recovery targets.

---

## 👥 Demo User Accounts & Roles

QuarantineCare includes built-in role switcher buttons for instantaneous one-click login, as well as credentials for manual sign-in:

| Role | Demo Email | Password | Responsibilities & Capabilities |
| :--- | :--- | :--- | :--- |
| **Nurse** | `nurse@quarantinecare.com` | `demo123` | Morning vitals roster, record daily temperatures (°C), prevent duplicate daily readings, view overdue patient alerts. |
| **Doctor** | `doctor@quarantinecare.com` | `demo123` | Priority clinical queue, review longitudinal temperature charts, record treatment decisions & notes (gated by today's vitals). |
| **Admin** | `admin@quarantinecare.com` | `demo123` | Bed inventory & 74-room interactive ward map, register new patients, process protocol discharges, monitor mortality vs 15% benchmark. |

*Note: In the top navigation bar, an interactive **Role Quick-Switcher** allows instant toggle between Nurse, Doctor, and Admin roles without re-logging.*

---

## 🌟 Key Application Screens

- **Screen 1: Login & Role Selection** — QuarantineCare branding, demo credentials, and 1-click evaluator quick-launch buttons.
- **Screen 2: Admin Dashboard** — 8 summary KPI cards (74 beds total, occupied, available, active patients, pending temps, awaiting rounds, discharge eligible, total discharged), real-time benchmark comparison, interactive 74-bed ward layout.
- **Screen 3: Patient Management & Census** — Search by name or ID (QC-2026-XXXX), filter by status (Admitted, Discharged, Deceased), filter by room (1-74), and quick triage tags.
- **Screen 4: Patient Intake & Registration** — Auto-generated unique patient ID, strict room selection (1-74) preventing double-booking, baseline temperature recording.
- **Screen 5: Nurse Dashboard** — Operational morning roster categorized into Pending Measurement, Completed Today, and Overdue vitals.
- **Screen 6: Temperature Recording Modal** — Numerical Celsius input, duplicate daily record protection, live fever alert badge (≥ 38.0°C), and optional nurse notes.
- **Screen 7: Doctor Dashboard** — Priority clinical queue sorting patients by fever spikes, discharge readiness, and completed temperatures.
- **Screen 8: Patient Clinical File & History** — Longitudinal Recharts temperature line chart with 38.0°C reference threshold, visual 3-day streak pill indicators, and doctor encounter history.
- **Screen 9: Discharge Management Center** — Automatic identification of patients meeting 3 full consecutive fever-free days, one-click admin confirmation, and historical discharge registry.
- **Screen 10: Reports & Analytics** — Actual vs benchmark bar charts (Mortality vs 15%, Success vs 85%), outcome pie breakdown, mean quarantine stay duration.

---

## 📐 Business Logic & Rules Engine

### 1. Fever Threshold & Streak Rules
- **Configurable Fever Threshold**: Default set to **38.0°C** (adjustable via the top bar).
- **Streak Increment**: A calendar day reading **< 38.0°C** counts as fever-free and increments the patient's streak.
- **Streak Reset**: A temperature **≥ 38.0°C** resets the fever-free streak to **0**.
- **Missing Day Rule**: Any calendar day without an official recording breaks continuity and prevents streak advancement.
- **Discharge Eligibility**: A patient becomes eligible when their fever-free streak reaches **≥ 3 consecutive full calendar days**.

### 2. Clinical Workflow Gating
- A doctor cannot mark a visit as completed for a patient until that patient's temperature has been logged for the current calendar day.

### 3. Epidemiological Formulas
$$\text{Mortality Rate} = \left(\frac{\text{Total Deaths}}{\text{Total Patients with Completed Outcomes}}\right) \times 100$$

$$\text{Treatment Success Rate} = \left(\frac{\text{Total Recoveries}}{\text{Total Patients with Completed Outcomes}}\right) \times 100$$

*Active admitted patients are strictly excluded from completed outcome denominators until final clinical resolution.*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS, Lucide React Icons
- **Data Visualization**: Recharts (Interactive LineCharts, BarCharts, and PieCharts)
- **State Management & Persistence**: Reactive Context Engine backed by `localStorage` (data persists across browser refreshes with one-click factory reset).

---

## 🚀 Setup & Local Running Instructions

### Prerequisites
- Node.js (v18 or v20+)
- npm (v9+)

### Installation
```bash
# 1. Clone or navigate to the project directory
cd "d:/FACTWISE APP"

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will be available at `http://localhost:3000` (or `http://localhost:5173`).

### Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 Public Deployment Guide (Vercel / Netlify / GitHub Pages)

### Deploying to Vercel (Recommended):
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root and follow the prompts:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
3. Vercel will output your live, publicly accessible production URL.

### Deploying to Netlify:
1. Drag and drop the `dist/` directory into [Netlify Drop](https://app.netlify.com/drop) or link via Git repository.
2. Build command: `npm run build`
3. Publish directory: `dist`

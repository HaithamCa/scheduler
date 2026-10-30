# Interview Scheduler — Functional Source of Truth

This document describes the **actual product** as implemented. Before adding or changing behavior, read this file. If code and this guide disagree, stop and ask — do not silently change behavior.

Related: `README.md` is a short product overview. If it conflicts with this guide, **this guide wins**.

---

## 1. What the app is

Interview Scheduler is a weekday interview calendar with two doors into the same week:

- **Coordinator** runs the board: who is coming, who interviews them, add / edit / cancel any slot.
- **Student** (role name in code: `viewer`) claims open hours under their account name. They see busy vs open, never other people’s names, and only on their own slots do they see the interviewer.

There is no React Router. After sign-in, `src/index.js` renders either `Application` (coordinator) or `Availability` (viewer).

---

## 2. Environments and URLs

| Service | URL | Notes |
| --- | --- | --- |
| Frontend (local) | http://localhost:3000 | CRA; `.env.development` sets `PORT=3000` |
| API (local) | http://localhost:8003 | Companion repo `scheduler-api` |
| Frontend (live) | https://haithamca.github.io/scheduler | GitHub Pages |
| API (live) | Hosted `scheduler-api` origin | Set as `REACT_APP_API_URL` at build time |
| API reset | http://localhost:8003/api/debug/reset | Dev/test only; reseeds Postgres |
| Storybook | http://localhost:9009 | `npm run storybook` |
| Postgres | localhost:5432 | Database `scheduler_development` |

Frontend `package.json` has `"proxy": "http://localhost:8003"` for local development.

All days / appointments / interviewers requests (GET, PUT, DELETE) use `REACT_APP_API_URL` (`http://localhost:8003` in development).

`.env.development` also sets `REACT_APP_WEBSOCKET_URL=ws://localhost:8003`. The API can broadcast appointment changes; **the React app does not subscribe**. Other browsers/tabs do not live-update.

Use **Node 16** for the frontend toolchain.

---

## 3. Accounts and authentication

Auth is **client-side only**. The API has no users, sessions, or permissions.

| localStorage key | Purpose |
| --- | --- |
| `scheduler.users` | `{ id, name, email, role, passwordHash }[]` |
| `scheduler.session` | `{ id, name, email, role }` |
| `scheduler.myBookings` | `{ [email]: appointmentId[] }` — student’s own bookings |

Passwords are SHA-256 hashed in the browser (`fallback:${password}` if Web Crypto is missing).

### Demo accounts (seeded on first load)

| Role | Name | Email | Password |
| --- | --- | --- | --- |
| `coordinator` | Demo User | `demo@scheduler.app` | `demo1234` |
| `viewer` | Alex Viewer | `viewer@scheduler.app` | `viewer1234` |

### Register

- Name (required)
- Email
- Password (at least 8 characters) + confirm
- Role: **Check availability** (`viewer`, default) or **Manage bookings** (`coordinator`)

### Login / logout / refresh

- Sign in with email + password, or the two demo buttons.
- Log out (header) removes `scheduler.session` only. Accounts stay in the browser.
- Refresh restores the session and the same role/view.

A student books with **`user.name` from the session**. They do not type a student name.

---

## 4. Roles and permissions

| Action | Coordinator | Student (`viewer`) |
| --- | --- | --- |
| See student names on booked slots | Yes | No (except their own, implied as “Your interview”) |
| See interviewer on any booked slot | Yes | Only on **their** slots (name + photo) |
| Create a booking for any student | Yes (typed name) | No — only as themselves |
| Choose interviewer when booking | Yes (required) | No — first interviewer of that day is assigned |
| Edit any interview | Yes | No |
| Cancel any interview | Yes | Only slots marked **theirs** |
| Book more than one slot / day | Yes | Yes — other days stay booked |
| Switch days Mon–Fri | Yes | Yes |

Role is an honor-system flag in localStorage. The API does not enforce it.

---

## 5. Shared chrome

When logged in, `AppHeader` sits above the page:

- Left: Interview Scheduler logo (`images/logo.png`)
- Right: initials avatar, **name**, **email**, role label, **Log out**

Role labels:

- Coordinator → `Full schedule`
- Student → `Availability view`

The sidebar is **day navigation only** (Monday–Friday and remaining spots). Account controls are not in the sidebar.

---

## 6. Calendar model

- Days: **Monday–Friday**
- Hours: **12pm, 1pm, 2pm, 3pm, 4pm, 5pm** (six slots per day)
- Default day on load: Monday
- **Spots remaining** = appointments that day with `interview === null`
- Booking a new interview decrements that day’s spots; cancel increments; **edit does not** change spots

Seeded development data also includes a set of already-booked interviews (random students/interviewers). Resetting the API reseeds those; it does **not** clear browser accounts or `scheduler.myBookings`.

---

## 7. Appointment states

### Coordinator (`Appointment` visual modes)

| State | Meaning | UI |
| --- | --- | --- |
| Empty | No interview | Add |
| Show | Booked | Student name, interviewer name, Edit, Delete |
| Create / Edit | Form | Student text field + interviewer list |
| Saving / Deleting | In flight | Status message |
| Confirm | About to delete | Confirm / cancel |
| Error | Save or delete failed | Close and go back |

### Student

| State | Label | Visual / action |
| --- | --- | --- |
| Open | Open | Green **Book as {account name}**; tap to confirm |
| Selected | Selected | Confirm **Book as {name}** or Not this time |
| Booked (someone else) | Booked | Red **Booked**; not clickable; no names |
| Own | Your interview | Interviewer name + photo; red **Cancel** |
| Day tab with an own booking | — | `{n} open · yours` |

A slot is **own** if its id is in `scheduler.myBookings[email]` **or** `interview.student === user.name`.

---

## 8. Coordinator workflow

1. Sign in as coordinator.
2. Choose a day in the sidebar.
3. **Create:** empty slot → Add → enter any student name → pick an interviewer for that day → Save. `PUT /api/appointments/:id` with `{ interview: { student, interviewer } }`.
4. **Edit:** Edit → change name and/or interviewer → Save (`isEdit` so spots stay the same).
5. **Cancel:** Delete → confirm “Delete the appointment?” → `DELETE /api/appointments/:id`.

Coordinator bookings are **not** limited to registered account names.

---

## 9. Student booking workflow

1. Sign in as student. Header and copy use their account name.
2. Choose a day. Hours and open/booked counts appear **under that day**. On a phone, days are full-width; tapping another day opens its slots and closes the previous day. On desktop, the five days stay in a row and slots still sit under the week bar. The sidebar is hidden on small screens.
3. Tap an **open** slot. Confirm **Book as {user.name}**.
4. The app assigns **the first interviewer** returned for that day (`interviewers[0]`). The student does not pick.
5. The API stores `{ student: user.name, interviewer: <id> }`. The appointment id is appended to `scheduler.myBookings`.
6. They may book **another time on another day**. Existing bookings stay.
7. They may book **another open time on the same day**. Existing bookings stay.

They cannot book a slot that already has an interview.

---

## 10. Cancellation and releasing

**Student**

- Only on **own** slots.
- **Cancel** calls `DELETE /api/appointments/:id`, removes that id from `scheduler.myBookings`, and opens the hour again.
- Cancel does **not** remove their other days or times.

**Coordinator**

- Delete + confirm on any booked slot.
- The hour becomes empty for everyone.

---

## 11. Privacy and visibility

| Information | Coordinator | Other students | Owner (student) |
| --- | --- | --- | --- |
| That a slot is taken | Yes | Yes (“Booked”) | Yes (“Your interview”) |
| Other student names | Yes | **Never** | N/A |
| Interviewer on others’ slots | Yes | **Never** | N/A |
| Interviewer on own slot | Yes | N/A | Name + avatar |
| Account name used to book | Typed | Hidden from others | Used automatically |

Students never see who took someone else’s hour.

---

## 12. API communication

Companion API: [scheduler-api](https://github.com/lighthouse-labs/scheduler-api) (local copy used in development).

| Method | Path | Body / result |
| --- | --- | --- |
| GET | `/api/days` | `[{ id, name, appointments[], interviewers[], spots }]` |
| GET | `/api/appointments` | `{ [id]: { id, time, interview: null \| { student, interviewer } } }` |
| GET | `/api/interviewers` | `{ [id]: { id, name, avatar } }` |
| PUT | `/api/appointments/:id` | `{ interview: { student, interviewer } }` → 204 after ~1s |
| DELETE | `/api/appointments/:id` | Clears interview → 204 after ~1s |
| GET | `/api/debug/reset` | Recreate + seed (dev/test) |

`interview.interviewer` is an interviewer **id**. The client joins the full interviewer object with `getInterview`.

---

## 13. Product rules (do not break)

1. Two roles only: `coordinator` and `viewer`. Role chooses the UI.
2. Students book **as their signed-in name**. Do not ask them to type a student name.
3. Students do **not** see other students’ names or interviewers.
4. Students **do** see interviewer name and photo on **their** slots.
5. Students can cancel **only** their own interviews.
6. Students can hold **multiple** bookings across days (and more than one per day). Booking a new slot must **not** auto-cancel the others.
7. Hours include **5pm** as a real, bookable slot.
8. Logged-in chrome is logo + account (name, email, role, Log out) in the **top header**.
9. Open slots are indicated in **green**; booked / cancel in **red**.
10. Auth stays in the browser unless a later decision moves it to the API. Do not assume the API authenticates users.
11. Prefer asking before changing any of the above.

---

## 14. Known implementation notes (not silent fix targets)

These exist in the current code. Treat them as **observed**, not as accidental bugs to “clean up” unless a human asks.

1. **Coordinator 6pm row.** `Application.js` renders a final `<Appointment key="last" time="6pm" />` that is **not** in the API. It always looks empty and cannot persist.
2. **Student interviewer is auto-assigned** (`interviewers[0]`). Earlier product copy (README) said students pick an interviewer. The implemented rule is: book under the account name without an interviewer picker.
3. **README hours** still say 12pm–4pm. This guide and the API seed include **5pm**.
4. **`scheduler.myBookings` is local.** Clearing site data can drop “yours” highlighting until `interview.student === user.name` still matches.
5. **Name collision.** If a coordinator books a slot with the same student string as a signed-in student, that student sees it as theirs.
6. **Unused helpers:** `updateSpots`, `editSpots`, `selectUserByName` (the last expects `state.users`, which does not exist).
7. **Sidebar** still accepts `user` / `onLogout` but does not render them.
8. **WebSocket URL** is configured but unused on the client.
9. Confirm copy: `Confirm.js` hardcodes “Delete the appointment?” and ignores a `message` prop from `Appointment`.

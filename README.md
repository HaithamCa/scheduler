# Interview Scheduler

A React app for booking weekday interviews. One calendar, two doors into it.

**Coordinators** see the full board: who is coming, who is interviewing them, and the tools to add, edit, or cancel. **Students** see which hours are open or taken, pick a free slot, and only then learn who they will meet. Other people’s names stay hidden.

The client runs at [http://localhost:3000](http://localhost:3000). It talks to the [scheduler API](https://github.com/lighthouse-labs/scheduler-api) on port 8003.

## Two views

| | Coordinator | Student |
| --- | --- | --- |
| Purpose | Run the week | Claim an open hour |
| Booked slots | Student + interviewer | “Booked” only |
| Your own slot | Same as any booking | “Yours”, with interviewer name and photo |
| Actions | Create, edit, cancel any interview | Pick an open time, or release your own |
| Demo | `demo@scheduler.app` / `demo1234` | `viewer@scheduler.app` / `viewer1234` |

Create an account and choose **Manage bookings** or **Check availability**. The role is saved with the session, so refresh keeps you in the right view.

## How a booking works

1. Sign in. The role decides which UI you get.
2. Choose a day, Monday through Friday. Hours run from 12pm to 4pm.
3. **Coordinator:** tap an empty hour, enter a student, pick an interviewer, save. **Student:** tap an open hour, pick an interviewer, confirm under your account name.
4. Remaining spots on that day go down by one. The API stores the interview; the React app updates the board.
5. Cancel or release the hour to open it again.

Students never see who took someone else’s slot. They do see their own interviewer, because that meeting is theirs.

## Run locally

Use **Node 16**. This project’s toolchain does not install cleanly on newer Node.

You also need the API and Postgres. Clone [scheduler-api](https://github.com/lighthouse-labs/scheduler-api) beside this repo, create `scheduler_development`, then from that project:

```sh
npm install
npm start
```

Reset seed data anytime:

```sh
curl http://localhost:8003/api/debug/reset
```

In this repo:

```sh
nvm use 16
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Accounts are stored in this browser (not on the API). Passwords are hashed before they are saved.

## Scripts

```sh
npm start          # webpack dev server, port 3000
npm test           # Jest
npm run storybook  # component workshop, port 9009
npm run cypress    # end-to-end tests
```

## Stack

React 16, custom hooks, and a reducer for days, appointments, and interviewers. Axios talks to the API. Sass styles the two UIs. Auth is client-side with a coordinator or viewer role.

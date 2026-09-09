import React, { useEffect, useState } from "react";
import Sidebar from "components/Sidebar";
import DayList from "components/DayList";
import useApplicationData from "hooks/useApplicationData";
import { getAppointmentsForDay, getInterview, getInterviewersForDay } from "helpers/selectors";
import "./Availability.scss";

const MINE_KEY = "scheduler.myBookings";

function isBusy(appointment) {
  return Boolean(appointment && appointment.interview);
}

function readMine(email) {
  try {
    const all = JSON.parse(localStorage.getItem(MINE_KEY) || "{}");
    return all[email] || [];
  } catch (err) {
    return [];
  }
}

function writeMine(email, ids) {
  let all = {};
  try {
    all = JSON.parse(localStorage.getItem(MINE_KEY) || "{}");
  } catch (err) {
    all = {};
  }
  all[email] = ids;
  localStorage.setItem(MINE_KEY, JSON.stringify(all));
}

function slotClass(busy, mine, selected) {
  if (mine) {
    return "availability__slot availability__slot--mine";
  }
  if (busy) {
    return "availability__slot availability__slot--busy";
  }
  if (selected) {
    return "availability__slot availability__slot--open availability__slot--selected";
  }
  return "availability__slot availability__slot--open";
}

function timeValue(time) {
  const hour = parseInt(time, 10);
  if (Number.isNaN(hour)) {
    return 0;
  }
  return hour === 12 ? 12 : hour + 12;
}

export default function Availability({ user, onLogout }) {
  const { state, setDay, bookInterview, cancelInterview } = useApplicationData();
  const appointments = getAppointmentsForDay(state, state.day)
    .filter(Boolean)
    .slice()
    .sort((a, b) => timeValue(a.time) - timeValue(b.time));
  const interviewers = getInterviewersForDay(state, state.day).filter(Boolean);
  const booked = appointments.filter(isBusy).length;
  const open = appointments.length - booked;

  const [mine, setMine] = useState(() => readMine(user.email));
  const [selectedId, setSelectedId] = useState(null);
  const [busyAction, setBusyAction] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedId(null);
    setError("");
  }, [state.day]);

  const isMine = (appointment) => {
    if (!appointment || !appointment.interview) {
      return false;
    }
    return (
      mine.indexOf(appointment.id) !== -1 ||
      appointment.interview.student === user.name
    );
  };

  const pickSlot = (appointment) => {
    if (isBusy(appointment)) {
      return;
    }
    setSelectedId(appointment.id);
    setError("");
  };

  const confirmBooking = (appointment) => {
    const person = interviewers[0];
    if (!user || !user.name) {
      setError("Your account needs a name before you can book.");
      return;
    }
    if (!person) {
      setError("No interviewer is available for this day.");
      return;
    }
    setBusyAction(true);
    setError("");
    bookInterview(appointment.id, {
      student: user.name,
      interviewer: person.id,
    })
      .then(() => {
        const next =
          mine.indexOf(appointment.id) === -1
            ? mine.concat(appointment.id)
            : mine;
        setMine(next);
        writeMine(user.email, next);
        setSelectedId(null);
      })
      .catch(() => {
        setError("Could not book that time. Try another slot.");
      })
      .then(() => setBusyAction(false));
  };

  const cancelBooking = (appointment) => {
    setBusyAction(true);
    setError("");
    cancelInterview(appointment.id)
      .then(() => {
        const next = mine.filter((id) => id !== appointment.id);
        setMine(next);
        writeMine(user.email, next);
        setSelectedId(null);
      })
      .catch(() => {
        setError("Could not cancel that interview. Try again.");
      })
      .then(() => setBusyAction(false));
  };

  return (
    <main className="layout">
      <Sidebar user={user} onLogout={onLogout}>
        <DayList days={state.days} day={state.day} setDay={setDay} />
      </Sidebar>

      <section className="availability">
        <div className="availability__inner">
          <header className="availability__header">
            <p className="availability__eyebrow">Private schedule</p>
            <h1 className="availability__title">Choose a day</h1>
            <p className="availability__lede">
              Open times book under <strong>{user.name}</strong>. Other people’s names stay hidden.
            </p>
          </header>

          <div className="availability__board">
            <div className="availability__week" role="tablist" aria-label="Days this week">
              {state.days.map((day) => {
                const total = (day.appointments && day.appointments.length) || 0;
                const openSpots = day.spots;
                const taken = Math.max(total - openSpots, 0);
                const fill = total ? (taken / total) * 100 : 0;
                const selected = day.name === state.day;
                const hasMine = (day.appointments || []).some((id) =>
                  isMine(state.appointments[id])
                );

                return (
                  <button
                    key={day.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className={
                      selected
                        ? "availability__day availability__day--selected"
                        : "availability__day"
                    }
                    onClick={() => setDay(day.name)}
                  >
                    <span className="availability__day-name">{day.name.slice(0, 3)}</span>
                    <span className="availability__meter" aria-hidden="true">
                      <span style={{ width: `${fill}%` }} />
                    </span>
                    <span className="availability__day-meta">
                      {openSpots} open{hasMine ? " · yours" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="availability__hours" aria-live="polite">
              <div className="availability__hours-head">
                <h2 className="availability__hours-title">{state.day}</h2>
                <div className="availability__stats">
                  <span className="availability__stat availability__stat--open">
                    {open} open
                  </span>
                  <span className="availability__stat availability__stat--busy">
                    {booked} booked
                  </span>
                </div>
              </div>

              {error && (
                <p className="availability__error" role="alert">
                  {error}
                </p>
              )}

          <ol className="availability__slots">
            {appointments.map((appointment) => {
              const busy = isBusy(appointment);
              const mineSlot = isMine(appointment);
              const selected = selectedId === appointment.id;
              const interview = mineSlot
                ? getInterview(state, appointment.interview)
                : null;
              const withName =
                interview && interview.interviewer && interview.interviewer.name;
              const withAvatar =
                interview && interview.interviewer && interview.interviewer.avatar;
              const label = mineSlot
                ? "Your interview"
                : busy
                ? "Booked"
                : selected
                ? "Selected"
                : "Open";
              const detail = mineSlot
                ? withName
                  ? `You’ll meet with ${withName}. Cancel only this hour.`
                  : "This is your booking. Cancel only this hour."
                : busy
                ? "This slot is taken."
                : selected
                ? "Confirm this time below."
                : "Tap to pick this time.";

              return (
                <li
                  key={appointment.id}
                  className={slotClass(busy, mineSlot, selected)}
                >
                  <div className="availability__row">
                    <button
                      type="button"
                      className="availability__hit"
                      disabled={busy}
                      onClick={() => pickSlot(appointment)}
                    >
                      <time className="availability__time">{appointment.time}</time>
                      <div className="availability__copy">
                        <strong>{label}</strong>
                        <p>{detail}</p>
                      </div>
                    </button>
                    <span className="availability__slot-actions">
                      {mineSlot && withAvatar && (
                        <img
                          className="availability__with"
                          src={withAvatar}
                          alt={withName || "Your interviewer"}
                        />
                      )}
                      {mineSlot ? (
                        <button
                          type="button"
                          className="availability__status availability__status--booked"
                          disabled={busyAction}
                          onClick={() => cancelBooking(appointment)}
                        >
                          {busyAction ? "Canceling…" : "Cancel"}
                        </button>
                      ) : (
                        <span
                          className={
                            busy
                              ? "availability__status availability__status--booked"
                              : "availability__status availability__status--open"
                          }
                        >
                          {busy ? "Booked" : `Book as ${user.name}`}
                        </span>
                      )}
                    </span>
                  </div>

                  {selected && !busy && (
                    <div className="availability__picker">
                      <p className="availability__picker-title">
                        Book {appointment.time} as {user.name}
                      </p>
                      <p className="availability__picker-hint">
                        This hour will be saved under your account name. Your other days stay booked.
                      </p>
                      <div className="availability__picker-actions">
                        <button
                          type="button"
                          className="availability__confirm"
                          disabled={busyAction}
                          onClick={() => confirmBooking(appointment)}
                        >
                          {busyAction ? "Booking…" : `Book as ${user.name}`}
                        </button>
                        <button
                          type="button"
                          className="availability__cancel"
                          disabled={busyAction}
                          onClick={() => {
                            setSelectedId(null);
                            setError("");
                          }}
                        >
                          Not this time
                        </button>
                      </div>
                    </div>
                  )}

                </li>
              );
            })}
          </ol>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

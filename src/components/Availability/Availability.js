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

export default function Availability({ user, onLogout }) {
  const { state, setDay, bookInterview, cancelInterview } = useApplicationData();
  const appointments = getAppointmentsForDay(state, state.day).filter(Boolean);
  const interviewers = getInterviewersForDay(state, state.day).filter(Boolean);
  const booked = appointments.filter(isBusy).length;
  const open = appointments.length - booked;

  const [mine, setMine] = useState(() => readMine(user.email));
  const [selectedId, setSelectedId] = useState(null);
  const [interviewer, setInterviewer] = useState(null);
  const [busyAction, setBusyAction] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedId(null);
    setInterviewer(null);
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
    if (isBusy(appointment) && !isMine(appointment)) {
      return;
    }
    if (isMine(appointment)) {
      setSelectedId(appointment.id);
      setError("");
      return;
    }
    setSelectedId(appointment.id);
    setInterviewer(null);
    setError("");
  };

  const confirmBooking = (appointment) => {
    if (!interviewer) {
      setError("Pick an interviewer to continue.");
      return;
    }
    setBusyAction(true);
    setError("");
    bookInterview(appointment.id, {
      student: user.name,
      interviewer,
    })
      .then(() => {
        const next = mine.indexOf(appointment.id) === -1 ? mine.concat(appointment.id) : mine;
        setMine(next);
        writeMine(user.email, next);
        setSelectedId(null);
        setInterviewer(null);
      })
      .catch(() => {
        setError("Could not book that time. Try another slot.");
      })
      .then(() => setBusyAction(false));
  };

  const releaseSlot = (appointment) => {
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
        setError("Could not release that time. Try again.");
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
            <h1 className="availability__title">{state.day}</h1>
            <p className="availability__lede">
              Pick an open time. Other people’s names stay hidden.
            </p>
            <div className="availability__stats" aria-live="polite">
              <span className="availability__stat availability__stat--open">
                {open} open
              </span>
              <span className="availability__stat availability__stat--busy">
                {booked} booked
              </span>
            </div>
          </header>

          <div className="availability__week" role="tablist" aria-label="Days this week">
            {state.days.map((day) => {
              const total = (day.appointments && day.appointments.length) || 0;
              const openSpots = day.spots;
              const taken = Math.max(total - openSpots, 0);
              const fill = total ? (taken / total) * 100 : 0;
              const selected = day.name === state.day;

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
                  <span className="availability__day-meta">{openSpots} open</span>
                </button>
              );
            })}
          </div>

          <div className="availability__legend">
            <span>
              <i className="availability__dot availability__dot--open" /> Open — tap to pick
            </span>
            <span>
              <i className="availability__dot availability__dot--mine" /> Yours
            </span>
            <span>
              <i className="availability__dot availability__dot--busy" /> Booked
            </span>
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
                  ? `You’ll meet with ${withName}.`
                  : "This is your booking."
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
                  <button
                    type="button"
                    className="availability__hit"
                    disabled={busy && !mineSlot}
                    onClick={() => pickSlot(appointment)}
                  >
                    <time className="availability__time">{appointment.time}</time>
                    <div className="availability__copy">
                      <strong>{label}</strong>
                      <p>{detail}</p>
                    </div>
                    {mineSlot && withAvatar ? (
                      <img
                        className="availability__with"
                        src={withAvatar}
                        alt={withName || "Your interviewer"}
                      />
                    ) : (
                      <span className="availability__badge">
                        {mineSlot ? "Yours" : busy ? "Busy" : selected ? "Pick" : "Available"}
                      </span>
                    )}
                  </button>

                  {selected && !busy && (
                    <div className="availability__picker">
                      <p className="availability__picker-title">
                        Book {appointment.time} as {user.name}
                      </p>
                      <p className="availability__picker-hint">Choose an interviewer</p>
                      <ul className="availability__people">
                        {interviewers.map((person) => (
                          <li key={person.id}>
                            <button
                              type="button"
                              className={
                                interviewer === person.id
                                  ? "availability__person availability__person--selected"
                                  : "availability__person"
                              }
                              onClick={() => setInterviewer(person.id)}
                            >
                              <img src={person.avatar} alt="" />
                              <span>{person.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="availability__picker-actions">
                        <button
                          type="button"
                          className="availability__confirm"
                          disabled={busyAction}
                          onClick={() => confirmBooking(appointment)}
                        >
                          {busyAction ? "Booking…" : `Confirm ${appointment.time}`}
                        </button>
                        <button
                          type="button"
                          className="availability__cancel"
                          disabled={busyAction}
                          onClick={() => {
                            setSelectedId(null);
                            setInterviewer(null);
                            setError("");
                          }}
                        >
                          Not this time
                        </button>
                      </div>
                    </div>
                  )}

                  {selected && mineSlot && (
                    <div className="availability__picker">
                      <p className="availability__picker-title">
                        {withName
                          ? `${appointment.time} with ${withName}`
                          : `Your ${appointment.time} interview`}
                      </p>
                      <p className="availability__picker-hint">
                        Release this slot if you need a different time. Other people still won’t see your name.
                      </p>
                      <div className="availability__picker-actions">
                        <button
                          type="button"
                          className="availability__confirm availability__confirm--danger"
                          disabled={busyAction}
                          onClick={() => releaseSlot(appointment)}
                        >
                          {busyAction ? "Releasing…" : "Release slot"}
                        </button>
                        <button
                          type="button"
                          className="availability__cancel"
                          disabled={busyAction}
                          onClick={() => setSelectedId(null)}
                        >
                          Keep it
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
            <li className="availability__slot availability__slot--end">
              <time className="availability__time">5pm</time>
              <div className="availability__copy">
                <strong>Day ends</strong>
                <p>No more interview slots today.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}

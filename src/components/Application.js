import React from "react";
import "components/Application.scss";

import Sidebar from "./Sidebar";
import DayList from "./DayList";
import Appointment from "./Appointment";
import {
  getAppointmentsForDay,
  getInterview,
  getInterviewersForDay,
} from "helpers/selectors";
import useApplicationData from "hooks/useApplicationData";

export default function Application({ user, onLogout }) {
  const { state, setDay, bookInterview, cancelInterview, editSpots } =
    useApplicationData();
  const appointments = getAppointmentsForDay(state, state.day);
  const interviewers = getInterviewersForDay(state, state.day);

  const schedule = appointments.map((appointment) => {
    const interview = getInterview(state, appointment.interview);
    return (
      <Appointment
        key={appointment.id}
        {...appointment}
        interview={interview}
        interviewers={interviewers}
        bookInterview={bookInterview}
        cancelInterview={cancelInterview}
        editSpots={editSpots}
      />
    );
  });

  return (
    <main className="layout">
      <Sidebar user={user} onLogout={onLogout}>
        <DayList
          days={state.days}
          day={state.day}
          setDay={setDay}
          interviewers={state.interviewers}
        />
      </Sidebar>
      <section className="schedule">
        {schedule}
        <Appointment key="last" time="5pm" />
      </section>
    </main>
  );
}

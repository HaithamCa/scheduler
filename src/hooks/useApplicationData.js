import { useEffect, useState } from "react";
import axios from "axios";

const useApplicationData = () => {
  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
  });

  const setDay = (day) => setState({ ...state, day });

  const updateSpots = (state, appointments, isDelete, isEdit) => {
    const days = state.days.map((day) => {
      if (state.day === day.name) {
        if (!isDelete && !isEdit) {
          day.spots -= 1;
        } else if (isDelete) {
          day.spots += 1;
        }
      }
      return day;
    });
    return { ...state, appointments, days };
  };

  const bookInterview = (id, interview, isEdit = false) => {
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview },
    };
    const appointments = {
      ...state.appointments,
      [id]: appointment,
    };
    return axios.put(`/api/appointments/${id}`, { interview }).then(() =>
      setState((state) => {
        return { ...updateSpots(state, appointments, false, isEdit) };
      })
    );
  };

  const editSpots = state.days.map((day) => {
    return day.name === state.day ? { ...day, spots: day.spots + 1 } : day;
  });

  const cancelInterview = (id) => {
    const appointment = {
      ...state.appointments[id],
      interview: null,
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment,
    };

    return axios.delete(`/api/appointments/${id}`).then(() =>
      setState((state) => {
        const newDays = state.days.map((day) => {
          return day.name === state.day
            ? { ...day, spots: day.spots + 1 }
            : day;
        });
        return { ...state, appointments, days: newDays };
      })
    );
  };

  useEffect(() => {
    const promiseDays = axios.get("http://localhost:8001/api/days");
    const promiseAppointments = axios.get(
      "http://localhost:8001/api/appointments"
    );
    const promiseInterviewers = axios.get(
      "http://localhost:8001/api/interviewers"
    );

    Promise.all([promiseDays, promiseAppointments, promiseInterviewers]).then(
      (all) => {
        setState((prev) => ({
          ...prev,
          days: all[0].data,
          appointments: all[1].data,
          interviewers: all[2].data,
        }));
      }
    );
  }, []);

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview,
    editSpots,
  };
};

export default useApplicationData;

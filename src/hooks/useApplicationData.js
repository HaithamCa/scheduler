import { useEffect, useReducer, useRef } from "react";
import axios from "axios";

function dayHasAppointment(day, appointmentId) {
  return (day.appointments || []).some(
    (id) => Number(id) === Number(appointmentId)
  );
}

function adjustSpots(days, appointmentId, delta) {
  return days.map((day) => {
    if (!dayHasAppointment(day, appointmentId)) {
      return day;
    }
    return { ...day, spots: Math.max(0, day.spots + delta) };
  });
}

const useApplicationData = () => {
  // use REDUCER
  const SET_DAY = "SET_DAY";
  const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
  const SET_INTERVIEW = "SET_INTERVIEW";

  function reducer(state, action) {
    switch (action.type) {
      case SET_DAY:
        return { ...state, day: action.day };
      case SET_APPLICATION_DATA:
        return {
          ...state,
          days: action.days,
          appointments: action.appointments,
          interviewers: action.interviewers,
        };
      case SET_INTERVIEW:
        return {
          ...state,
          appointments: action.appointments,
          days: action.days || state.days,
        };
      default:
        throw new Error(
          `Tried to reduce with unsupported action type: ${action.type}`
        );
    }
  }

  // Data and state management
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  // Switch to a new day
  const setDay = (day) => dispatch({ type: SET_DAY, day });
  // Update interviews spots when editing and canceling
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
  // Add the new interview in the appointments state and make the PUT request
  const bookInterview = (id, interview, isEdit = false) => {
    const current = stateRef.current;
    const appointment = {
      ...current.appointments[id],
      interview: { ...interview },
    };
    const appointments = {
      ...current.appointments,
      [id]: appointment,
    };
    return axios
      .put(`/api/appointments/${id}`, { interview })
      .then(() => {
        const days = isEdit ? current.days : adjustSpots(current.days, id, -1);
        stateRef.current = { ...current, appointments, days };
        dispatch({ type: SET_INTERVIEW, appointments, days });
      });
  };

  const editSpots = state.days.map((day) => {
    return day.name === state.day ? { ...day, spots: day.spots + 1 } : day;
  });

  // Remove the interview from the appointments state and make a DELETE request
  const cancelInterview = (id) => {
    const current = stateRef.current;
    const appointment = {
      ...current.appointments[id],
      interview: null,
    };

    const appointments = {
      ...current.appointments,
      [id]: appointment,
    };

    return axios.delete(`/api/appointments/${id}`).then(() => {
      const days = adjustSpots(current.days, id, 1);
      stateRef.current = { ...current, appointments, days };
      dispatch({ type: SET_INTERVIEW, appointments, days });
    });
  };
  // Take all the data from the database to set up the initial state
  useEffect(() => {
    const api = process.env.REACT_APP_API_URL || "http://localhost:8003";
    const promiseDays = axios.get(`${api}/api/days`);
    const promiseAppointments = axios.get(`${api}/api/appointments`);
    const promiseInterviewers = axios.get(`${api}/api/interviewers`);

    Promise.all([promiseDays, promiseAppointments, promiseInterviewers]).then(
      (all) => {
        dispatch({
          type: SET_APPLICATION_DATA,
          days: all[0].data,
          appointments: all[1].data,
          interviewers: all[2].data,
        });
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

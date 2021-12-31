import { useEffect, useReducer, useState } from "react";
import axios from "axios";

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
      // Update the number of spots remaining for a specific day when booking, editing, and canceling
      case SET_INTERVIEW:
        return { ...state, appointments: action.appointments };
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
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview },
    };
    const appointments = {
      ...state.appointments,
      [id]: appointment,
    };
    return axios
      .put(`/api/appointments/${id}`, { interview })
      .then(() => dispatch({ type: SET_INTERVIEW, appointments }));
  };

  const editSpots = state.days.map((day) => {
    return day.name === state.day ? { ...day, spots: day.spots + 1 } : day;
  });

  // Remove the interview from the appointments state and make a DELETE request
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
      dispatch((state) => {
        const newDays = state.days.map((day) => {
          return day.name === state.day
            ? { ...day, spots: day.spots + 1 }
            : day;
        });
        return { ...state, appointments, days: newDays };
      })
    );
  };
  // Take all the data from the database to set up the initial state
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

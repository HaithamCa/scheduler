// Use the state to return the appointments for a specific day
export function selectUserByName(state, name) {
  const filteredNames = state.users.filter((user) => user.name === name);
  return filteredNames;
}

// Return the interviewers of a specific day
export function getAppointmentsForDay(state, day) {
  const result = [];
  const dayData = state.days.filter((dai) => dai.name === day);

  if (!dayData[0]) {
    return result;
  }
  for (const i of dayData[0].appointments) {
    result.push(state.appointments[i]);
  }

  return result;
}

// Add the info of the interviewer for an existing interview
export function getInterview(state, interview) {
  if (interview) {
    const interviewer = state.interviewers[interview.interviewer];
    return { ...interview, interviewer };
  }
  return null;
}

// Return the interviewers of a specific day
export function getInterviewersForDay(state, day) {
  const result = [];
  const dayData = state.days.filter((dai) => dai.name === day);

  if (!dayData[0]) return result;
  for (const b of dayData[0].interviewers) {
    result.push(state.interviewers[b]);
  }

  return result;
}

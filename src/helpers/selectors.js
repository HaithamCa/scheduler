export function selectUserByName(state, name) {
  const filteredNames = state.users.filter((user) => user.name === name);
  return filteredNames;
}

export function getAppointmentsForDay(state, day) {
  const result = [];
  const dayData = state.days.filter((dai) => dai.name === day);

  if (!dayData[0]) return result;
  for (const i of dayData[0].appointments) {
    result.push(state.appointments[i]);
  }

  return result;
}

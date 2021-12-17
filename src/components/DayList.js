import React from "react";
import DayListItem from "./DayListItem";

const DayList = (props) => {
  return props.days.map((day) => (
    <DayListItem
      key={day.id}
      name={day.name}
      spots={day.spots}
      selected={day.name === props.day}
      setDay={props.setDay}
    />
  ));
};

export default DayList;

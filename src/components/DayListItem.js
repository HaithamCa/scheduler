import React from "react";

const DayListItem = (props) => {
    console.log(props);
  return (
    <li onClick={() => props.setDay(props.name)}>
      <h2 className="text--regular">{props.name}</h2>
      <h3 className="text--light">{props.spots} spots remaining</h3>
    </li>
  );
};

export default DayListItem;

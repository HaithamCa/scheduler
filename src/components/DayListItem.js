import React from "react";
import classNames from "classnames";

import "components/DayListItem.scss";
const DayListItem = (props) => {
    
     const dayClass = classNames("day-list__item", {
        "day-list__item--selected": props.selected,
        "day-list__item--full": props.spots === 0
      })
      function formatSpots(spots) {
          if (spots === 0) {
              return "no spots remaining";
          } else if(spots === 1) {
              return `${spots} spot remaining`;
          } else {
              return `${spots} spots remaining`;
          }
      }
      return (
        <li data-testid="day-item" className={dayClass} onClick={() => props.setDay(props.name)} selected={props.selected}>
        <h2 className="text--regular">{props.name}</h2> 
          <h3 className="text--light">{formatSpots(props.spots)}</h3>
        </li>
      );
};

export default DayListItem;

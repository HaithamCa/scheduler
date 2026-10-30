import React from "react";
import asset from "helpers/asset";

const Status = (props) => {
  return (
    <main className="appointment__card appointment__card--status">
      <img
        className="appointment__status-image"
        src={asset("images/status.png")}
        alt="Loading"
      />
      <h1 className="text--semi-bold">{props.message}</h1>
    </main>
  );
};

export default Status;

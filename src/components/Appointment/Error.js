import React from "react";
import asset from "helpers/asset";

const Error = (props) => {
  return (
    <main className="appointment__card appointment__card--error">
      <section className="appointment__error-message">
        <h1 className="text--semi-bold">Error</h1>
        <h3 className="text--light">{props.message}</h3>
      </section>
      <img
        className="appointment__error-close"
        src={asset("images/close.png")}
        alt="Close"
        onClick={props.onClose}
      />
    </main>
  );
};

export default Error;

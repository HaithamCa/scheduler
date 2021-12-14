import React, { useState } from "react";
import "./styles.scss";
import Header from "./Header";
import Show from "./Show";
import Empty from "./Empty";
import useVisualMode from "hooks/useVisualMode";
import Form from "./Form";
import Status from "./Status";
import Confirm from "./Confirm";

const EMPTY = "EMPTY";
const SHOW = "SHOW";
const CREATE = "CREATE";
const SAVING = "SAVING";
const CONFIRM = "CONFIRM";
const DELETING = "DELETING";
const EDIT = "EDIT";

const Appointment = (props) => {
  console.log(props);
  const { mode, transition, back } = useVisualMode(
    props.interview ? SHOW : EMPTY
  );

  const save = (name, interviewer) => {
    const interview = {
      student: name,
      interviewer,
    };
    transition(SAVING);
    Promise.resolve(props.bookInterview(props.id, interview))
      .then(() => transition(SHOW))
      .catch((err) => console.log(err));
  };

  const deleteConfirm = () => {
    transition(CONFIRM);
  };

  const deleteAppointment = () => {
    transition(DELETING, true);
    Promise.resolve(props.cancelInterview(props.id))
      .then(transition(EMPTY))
      .catch((err) => console.log(err));
  };

  return (
    <article className="appointment">
      <Header time={props.time} />
      {mode === EMPTY && <Empty onAdd={() => transition(CREATE)} />}
      {mode === SHOW && (
        <Show
          id={props.id}
          student={props.interview.student}
          interviewer={props.interview.interviewer}
          onCancel={() => back()}
          onDelete={deleteConfirm}
        />
      )}
      {mode === CREATE && (
        <Form
          onSave={save}
          interviewers={props.interviewers}
          onCancel={() => back()}
        />
      )}
      {mode === SAVING && <Status message="Saving" />}
      {mode === DELETING && <Status message="Deleting" />}
      {mode === EDIT && (
        <Form
          name={props.interview.student}
          interviewer={props.interview.interviewer.id}
          interviewers={props.interviewers}
          onCancel={() => back()}
          onSave={save}
        />
      )}
      {mode === CONFIRM && (
        <Confirm
          message="Are you sure you want to delete?"
          onConfirm={deleteAppointment}
          onCancel={() => back()}
        />
      )}
    </article>
  );
};

export default Appointment;

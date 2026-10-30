import React from "react";
import asset from "helpers/asset";

const Empty = (props) => {
  return (
    <main className="appointment__add">
      <img 
      className="appointment__add-button" 
      src={asset("images/add.png")} 
      alt="Add"
      onClick={props.onAdd}
      />
    </main>
  );
};

export default Empty;

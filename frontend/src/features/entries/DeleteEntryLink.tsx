import React from "react";
import { Link } from "react-router-dom";

export const DeleteEntryLink = (props: { to: string }) => {
  const targetURL: string = props.to;

  console.log(
    `${new Date().toISOString()}` +
      ` - ${__filename}` +
      ` - React is rendering <DeleteEntryLink to=${targetURL}>`
  );

  const [shouldDisplayHint, setShouldshouldDisplayHint] = React.useState(false);

  const hint = (
    <span> (HINT: After clicking, you will be asked to confirm your choice.)</span>
  );

  return (
    <React.Fragment>
      <Link
        to={targetURL}
        onMouseEnter={() => setShouldshouldDisplayHint(true)}
        onMouseLeave={() => setShouldshouldDisplayHint(false)}
      >
        Delete
      </Link>
      {shouldDisplayHint && hint}
    </React.Fragment>
  );
};

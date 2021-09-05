import React from "react";
import moment from "moment";

type SingleJournalEntryProps = {
  timestampInUTC: string;
  content: string;
};

export const SingleJournalEntry = (props: SingleJournalEntryProps) => {
  return (
    <React.Fragment>
      {"<SingleJournalEntry>"}
      <h3>
        {moment.utc(props.timestampInUTC).format("YYYY-MM-DD HH:mm")} (UTC +00:00)
      </h3>
      <p>{props.content}</p>
    </React.Fragment>
  );
};

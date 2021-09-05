import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { v4 as uuidv4 } from "uuid";

import { IEntry, IState } from "../../types";
import { selectEntriesEntities, signOut } from "../../store";
import { ActionAlerts, alertsCreate } from "../alerts/alertsSlice";
import { ActionDeleteEntry, deleteEntry } from "./entriesSlice";
import { SingleJournalEntry } from "./SingleJournalEntry";

export const DeleteEntry = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <DeleteEntry>`
  );
  const params: { id: string } = useParams();
  console.log(
    `${new Date().toISOString()}` +
      ` - ${__filename}` +
      ` - inspecting the \`params\` passed in to <DeleteEntry>:`
  );
  console.log(params);
  const entryId: number = parseInt(params.id);
  console.log("    entryId:");
  console.log(`    ${entryId}`);

  const entry: IEntry = useSelector(selectEntriesEntities)[entryId];
  console.log("    entry:");
  console.log(`    ${JSON.stringify(entry)}`);

  const dispatch: ThunkDispatch<IState, unknown, ActionDeleteEntry | ActionAlerts> =
    useDispatch();

  const history = useHistory();

  const handleClickYes = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const id: string = uuidv4();
    try {
      console.log(
        "    <DeleteEntry> - handleClickYes - await dispatch(deleteEntry(entryId))"
      );
      await dispatch(deleteEntry(entryId));

      console.log(
        `    <DeleteEntry> - handleClickYes - dispatch(alertsCreate(id, "ENTRY DELETION SUCCESSFUL"));`
      );
      dispatch(alertsCreate(id, "ENTRY DELETION SUCCESSFUL"));

      console.log(
        `    <DeleteEntry> - handleClickYes - history.push("/journal-entries");`
      );
      history.push("/journal-entries");
    } catch (err) {
      if (err.response.status === 401) {
        dispatch(signOut("[FROM <DeleteEntry>'S handleClickYes] PLEASE SIGN BACK IN"));
      } else {
        const message: string =
          err.response.data.error ||
          "ERROR NOT FROM BACKEND BUT FROM FRONTEND COMPONENT";
        dispatch(alertsCreate(id, message));
      }
    }
  };

  const handleClickNo = (e: React.MouseEvent<HTMLButtonElement>) => {
    return history.push("/journal-entries");
  };

  let content;
  if (entry !== undefined) {
    content = (
      <React.Fragment>
        <h3>You are about to delete the following Entry:</h3>
        <hr />
        <SingleJournalEntry
          timestampInUTC={entry.timestampInUTC}
          content={entry.content}
        />
        <hr />
        <div>Do you want to delete the selected Entry?</div>
        <ul>
          <li>
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClickYes(e)}
            >
              Yes
            </button>
          </li>
          <li>
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClickNo(e)}
            >
              No
            </button>
          </li>
        </ul>
      </React.Fragment>
    );
  } else {
    content = <p>Loading...</p>;
  }

  return (
    <React.Fragment>
      {"<DeleteEntry>"}
      {content}
    </React.Fragment>
  );
};

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

import { IEntry, IState } from "../../types";
import { offsetsFromUtc } from "../../utilities";
import { selectEntriesEntities, signOut } from "../../store";
import { ActionAlerts, alertsCreate } from "../alerts/alertsSlice";
import { ActionEditEntry, editEntry } from "./entriesSlice";
import { SingleJournalEntry } from "./SingleJournalEntry";

export const EditEntry = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <EditEntry>`
  );

  const params: { id: string } = useParams();
  console.log(
    `${new Date().toISOString()}` +
      ` - ${__filename}` +
      ` - inspecting the \`params\` passed in to <EditEntry>:`
  );
  console.log(params);
  const entryId: number = parseInt(params.id);
  console.log("    entryId:");
  console.log(`    ${entryId}`);

  const entry: IEntry = useSelector(selectEntriesEntities)[entryId];
  console.log("    entry:");
  console.log(`    ${JSON.stringify(entry)}`);

  const dispatch: ThunkDispatch<IState, unknown, ActionEditEntry | ActionAlerts> =
    useDispatch();

  const [formData, setFormData] = React.useState({
    timezone: entry.utcZoneOfTimestamp,
    localTime: moment
      .utc(entry.timestampInUTC)
      .utcOffset(entry.utcZoneOfTimestamp)
      .format("YYYY-MM-DD HH:mm"),
    content: entry.content,
  });

  const history = useHistory();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const id: string = uuidv4();
    if (
      formData.timezone === "" ||
      formData.localTime === "" ||
      formData.content === ""
    ) {
      const message: string = "YOU MUST FILL OUT ALL FORM FIELDS";
      dispatch(alertsCreate(id, message));
    } else {
      try {
        await dispatch(
          editEntry(entryId, formData.localTime, formData.timezone, formData.content)
        );
        dispatch(alertsCreate(id, "ENTRY EDITING SUCCESSFUL"));
        history.push("/journal-entries");
      } catch (err) {
        if (err.response.status === 401) {
          dispatch(signOut("[FROM <EditEntry>'S handleSubmit] PLEASE SIGN BACK IN"));
        } else {
          const id: string = uuidv4();
          const message: string =
            err.response.data.error ||
            "ERROR NOT FROM BACKEND BUT FROM FRONTEND COMPONENT";
          dispatch(alertsCreate(id, message));
        }
      }
    }
  };

  const timezoneOptions = offsetsFromUtc().map((offset, ind) => (
    <option key={ind} value={offset}>
      {offset}
    </option>
  ));

  return (
    <React.Fragment>
      {"<EditEntry>"}
      <h3>You are about to edit the following Entry:</h3>
      <hr />
      <SingleJournalEntry
        timestampInUTC={entry.timestampInUTC}
        content={entry.content}
      />
      <hr />
      <form
        name="edit-entry-form"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}
      >
        <div>
          <label htmlFor="localTime-id">
            Edit the local time of the Entry's creation:
          </label>
        </div>
        <div>
          <input
            type="text"
            placeholder="YYYY-MM-DD HH:MM"
            name="localTime"
            value={formData.localTime}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
            id="localTime-id"
          />
        </div>
        <div>
          <label htmlFor="timezone-id">
            Edit the time zone, which you were in at the moment when you created the
            Entry:
          </label>
        </div>
        <div>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(e)}
            id="timezone-id"
          >
            <option value="" />
            {timezoneOptions}
          </select>
          UTC
        </div>
        <div>
          <label htmlFor="content-id">Edit the content of the Entry:</label>
        </div>
        <div>
          <textarea
            name="content"
            value={formData.content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e)}
            id="content-id"
          />
        </div>
        <hr />
        <div>
          <input type="submit" value="Edit entry" />
        </div>
      </form>
    </React.Fragment>
  );
};

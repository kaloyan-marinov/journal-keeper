import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { v4 as uuidv4 } from "uuid";

import { IState } from "../../types";
import { offsetsFromUtc } from "../../utilities";
import { signOut } from "../../store";
import { ActionAlerts, alertsCreate } from "../alerts/alertsSlice";
import { IActionClearAuthSlice } from "../auth/authSlice";
import { createEntry } from "./entriesSlice";

export const CreateEntry = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <CreateEntry>`
  );

  const dispatch: ThunkDispatch<IState, unknown, IActionClearAuthSlice | ActionAlerts> =
    useDispatch();

  const [formData, setFormData] = React.useState({
    timezone: "",
    localTime: "",
    content: "",
  });

  const history = useHistory();

  const handleChange = async (
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
          createEntry(formData.localTime, formData.timezone, formData.content)
        );
        dispatch(alertsCreate(id, "ENTRY CREATION SUCCESSFUL"));
        history.push("/journal-entries");
      } catch (err) {
        if (err.response.status === 401) {
          dispatch(signOut("[FROM <CreateEntry>'S handleSubmit] PLEASE SIGN BACK IN"));
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
      {"<CreateEntry>"}
      <h3>You are about to create a new Entry:</h3>
      <hr />
      <form
        name="create-entry-form"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}
      >
        <div>
          <label htmlFor="localTime-id">Specify your current local time:</label>
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
            Specify the time zone that you are currently in:
          </label>
        </div>
        <div>
          <select
            name="timezone"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(e)}
            id="timezone-id"
          >
            <option value="" />
            {timezoneOptions}
          </select>
          UTC
        </div>
        <div>
          <label htmlFor="content-id">Type up the content of your new Entry:</label>
        </div>
        <div>
          <textarea
            name="content"
            value={formData.content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e)}
            id="content-id"
            style={{ minWidth: "50%" }}
            rows={formData.content.split("\n").length}
          />
        </div>
        <hr />
        <div>
          <input type="submit" value="Create entry" />
        </div>
      </form>
    </React.Fragment>
  );
};

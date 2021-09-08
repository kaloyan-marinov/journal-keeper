import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { v4 as uuidv4 } from "uuid";

import { IState } from "../../types";
import { selectHasValidToken } from "../../store";
import {
  issueJWSToken,
  ActionIssueJWSToken,
  fetchProfile,
  ActionFetchProfile,
} from "./authSlice";
import { ActionAlerts, alertsCreate } from "../alerts/alertsSlice";

export const SignIn = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <SignIn>`
  );

  const hasValidToken: boolean | null = useSelector(selectHasValidToken);
  console.log("    hasValidToken:");
  console.log(`    ${hasValidToken}`);

  const dispatch: ThunkDispatch<
    IState,
    unknown,
    ActionIssueJWSToken | ActionAlerts | ActionFetchProfile
  > = useDispatch();

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  if (hasValidToken === true) {
    const nextURL: string = "/";
    console.log(`    hasValidToken=${hasValidToken} > redirecting to ${nextURL} ...`);
    return <Redirect to={nextURL} />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const id: string = uuidv4();
    if (formData.email === "" || formData.password === "") {
      const message: string = "YOU MUST FILL OUT ALL FORM FIELDS";
      dispatch(alertsCreate(id, message));
    } else {
      try {
        await dispatch(issueJWSToken(formData.email, formData.password));
        dispatch(alertsCreate(id, "SIGN-IN SUCCESSFUL"));
        await dispatch(fetchProfile());
      } catch (thunkActionError) {
        dispatch(alertsCreate(id, thunkActionError));
      }
    }
  };

  return (
    <React.Fragment>
      {"<SignIn>"}
      <div>Log in to your account!</div>
      <form
        name="sign-in-form"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}
      >
        <div>
          <input
            type="email"
            placeholder="Enter your email..."
            name="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Enter your password..."
            name="password"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
          />
        </div>
        <div>
          <input type="submit" value="Sign me in" />
        </div>
      </form>
    </React.Fragment>
  );
};

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { v4 as uuidv4 } from "uuid";

import { IState } from "../../types";
import { selectHasValidToken } from "../../store";
import { ActionAlerts, alertsCreate } from "../alerts/alertsSlice";
import { ActionCreateUser, createUser } from "./authSlice";

export const SignUp = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <SignUp>`
  );

  const hasValidToken: boolean | null = useSelector(selectHasValidToken);
  console.log("    hasValidToken:");
  console.log(`    ${hasValidToken}`);

  const dispatch: ThunkDispatch<IState, unknown, ActionCreateUser | ActionAlerts> =
    useDispatch();

  const [formData, setFormData] = React.useState({
    username: "",
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
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
    if (
      formData.username === "" ||
      formData.name === "" ||
      formData.email === "" ||
      formData.password === "" ||
      formData.repeatPassword === ""
    ) {
      const message: string = "YOU MUST FILL OUT ALL FORM FIELDS";
      dispatch(alertsCreate(id, message));
    } else if (formData.password !== formData.repeatPassword) {
      const message: string = "THE PROVIDED PASSWORDS DON'T MATCH!";
      dispatch(alertsCreate(id, message));
    } else {
      // Note to self:
      // doing anything beyond simple `console.log` calls in this `else` clause
      // should be postponed until
      // after the logic within the `if` clause has been _properly_ implemented.
      try {
        await dispatch(
          createUser(
            formData.username,
            formData.name,
            formData.email,
            formData.password
          )
        );

        dispatch(alertsCreate(id, "REGISTRATION SUCCESSFUL"));
      } catch (thunkActionError) {
        dispatch(alertsCreate(id, thunkActionError));
      }
    }
  };

  return (
    <React.Fragment>
      {"<SignUp>"}
      <div>Create a new account!</div>
      <form
        name="sign-up-form"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}
      >
        <div>
          <input
            type="text"
            placeholder="Choose a username..."
            name="username"
            value={formData.username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Enter your name..."
            name="name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Enter your email address..."
            name="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Choose a password..."
            name="password"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Repeat the chosen password..."
            name="repeatPassword"
            value={formData.repeatPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
          />
        </div>
        <input type="submit" value="Create an account for me" />
      </form>
    </React.Fragment>
  );
};

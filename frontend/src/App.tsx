import React from "react";
import { Switch, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import { IState } from "./types";
import { Alerts } from "./features/alerts/Alerts";
import { Home } from "./features/Home";
import { NavigationBar } from "./features/NavigationBar";
import { SignUp } from "./features/auth/SignUp";
import { SignIn } from "./features/auth/SignIn";

import { PrivateRoute } from "./features/auth/PrivateRoute";
import { JournalEntries } from "./features/entries/JournalEntries";
import { CreateEntry } from "./features/entries/CreateEntry";
import { EditEntry } from "./features/entries/EditEntry";
import { DeleteEntry } from "./features/entries/DeleteEntry";

import { IActionAlertsCreate } from "./features/alerts/alertsSlice";
import {
  ActionFetchProfile,
  fetchProfile,
  IActionClearAuthSlice,
} from "./features/auth/authSlice";
import { signOut } from "./store";

const App = () => {
  console.log(`${new Date().toISOString()} - ${__filename} - React is rendering <App>`);

  const dispatch: ThunkDispatch<
    IState,
    unknown,
    IActionClearAuthSlice | ActionFetchProfile | IActionAlertsCreate
  > = useDispatch();

  React.useEffect(() => {
    console.log(
      `${new Date().toISOString()}` +
        ` - ${__filename}` +
        ` - React is running <App>'s useEffect hook`
    );

    const effectFn = async () => {
      console.log("    <App>'s useEffect hook is dispatching fetchProfile()");

      try {
        await dispatch(fetchProfile());
      } catch (err) {
        dispatch(signOut("TO CONTINUE, PLEASE SIGN IN"));
      }
    };

    effectFn();
  }, [dispatch]);

  return (
    <React.Fragment>
      {"<App>"}
      <NavigationBar />
      <Alerts />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/sign-up">
          <SignUp />
        </Route>
        <Route exact path="/sign-in">
          <SignIn />
        </Route>
        <PrivateRoute exact path="/journal-entries">
          <JournalEntries />
        </PrivateRoute>
        <PrivateRoute exact path="/entries/create">
          <CreateEntry />
        </PrivateRoute>
        <PrivateRoute exact path="/entries/:id/edit">
          <EditEntry />
        </PrivateRoute>
        <PrivateRoute exact path="/entries/:id/delete">
          <DeleteEntry />
        </PrivateRoute>
      </Switch>
    </React.Fragment>
  );
};

export default App;

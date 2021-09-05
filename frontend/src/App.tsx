import React from "react";
import { Switch, Route, useHistory } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { ThunkDispatch } from "redux-thunk";

import { useParams } from "react-router-dom";

import { Redirect } from "react-router-dom";
import { IEntry, IState, RequestStatus } from "./types";

import {
  ActionAlerts,
  alertsCreate,
  IActionAlertsCreate,
} from "./features/alerts/alertsSlice";
import {
  ActionFetchProfile,
  fetchProfile,
  IActionClearAuthSlice,
} from "./features/auth/authSlice";
import { ActionDeleteEntry, deleteEntry } from "./features/entries/entriesSlice";
import {
  selectAuthRequestStatus,
  selectEntriesEntities,
  selectHasValidToken,
  signOut,
} from "./store";
import { Alerts } from "./features/alerts/Alerts";
import { Home } from "./features/Home";
import { NavigationBar } from "./features/NavigationBar";
import { SignUp } from "./features/auth/SignUp";
import { SignIn } from "./features/auth/SignIn";
import { SingleJournalEntry } from "./features/entries/SingleJournalEntry";
import { JournalEntries } from "./features/entries/JournalEntries";
import { CreateEntry } from "./features/entries/CreateEntry";
import { EditEntry } from "./features/entries/EditEntry";
import { DeleteEntry } from "./features/entries/DeleteEntry";

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

export const PrivateRoute = (props: any) => {
  console.log(
    `${new Date().toISOString()}` +
      ` - ${__filename}` +
      ` - React is rendering <PrivateRoute>`
  );

  console.log(`    its children are as follows:`);
  const childrenCount: number = React.Children.count(props.children);
  React.Children.forEach(props.children, (child, ind) => {
    console.log(
      `    child #${ind + 1} (out of ${childrenCount}): <${child.type.name}>`
    );
  });

  const { children, ...rest } = props;

  const authRequestStatus: RequestStatus = useSelector(selectAuthRequestStatus);
  console.log("    authRequestStatus:");
  console.log(`    ${authRequestStatus}`);

  const hasValidToken: boolean | null = useSelector(selectHasValidToken);
  console.log("    hasValidToken:");
  console.log(`    ${hasValidToken}`);

  if (authRequestStatus === RequestStatus.LOADING) {
    console.log(`    rendering <div>"<childComponentName> - Loading..."</div>`);
    return React.Children.map(props.children, (child) => (
      <div>{`<${child.type.name}>`} - Loading...</div>
    ));
  } else if (!hasValidToken) {
    const nextURL: string = "/sign-in";
    console.log(`    hasValidToken=${hasValidToken} > redirecting to ${nextURL} ...`);
    return <Redirect to={nextURL} />;
  } else {
    console.log(
      `    hasValidToken=${hasValidToken} > rendering the above-listed children`
    );
    return <Route {...rest}>{children}</Route>;
  }
};

export default App;

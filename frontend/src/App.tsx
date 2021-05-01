import React from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";

const App = () => {
  console.log(`${new Date().toISOString()} - ${__filename} - React is rendering <App>`);

  return (
    <React.Fragment>
      {"<App>"}
      <BrowserRouter>
        <div>
          <Link to="/">Home</Link> | <Link to="/sign-up">Sign Up</Link> |{" "}
          <Link to="/sign-in">Sign In</Link> |{" "}
          <Link to="/my-monthly-journal">MyMonthlyJournal</Link>
        </div>
        <Switch>
          <Route exact path="/">
            <div>Welcome to MyMonthlyJournal!</div>
          </Route>
          <Route exact path="/sign-up">
            <SignUp />
          </Route>
          <Route exact path="/sign-in">
            <SignIn />
          </Route>
          <Route exact path="/my-monthly-journal">
            <MyMonthlyJournal />
          </Route>
        </Switch>
      </BrowserRouter>
    </React.Fragment>
  );
};

export const SignUp = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <SignUp>`
  );

  return (
    <React.Fragment>
      {"<SignUp>"}
      <div>Create a new account!</div>
    </React.Fragment>
  );
};

export const SignIn = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <SignIn>`
  );

  return (
    <React.Fragment>
      {"<SignIn>"}
      <div>Log in to your account!</div>
    </React.Fragment>
  );
};

export const MyMonthlyJournal = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename}` +
      ` - React is rendering <MyMonthlyJournal>`
  );

  return (
    <React.Fragment>
      {"<MyMonthlyJournal>"}
      <div>Review the entries in MyMonthlyJournal!</div>
    </React.Fragment>
  );
};

export default App;

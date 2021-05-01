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
      <form name="sign-up-form">
        <div>
          <input type="text" placeholder="Choose a username..." name="username" />
        </div>
        <div>
          <input type="text" placeholder="Enter your name..." name="name" />
        </div>
        <div>
          <input type="email" placeholder="Enter your email address..." name="email" />
        </div>
        <div>
          <input type="password" placeholder="Choose a password..." name="password" />
        </div>
        <div>
          <input
            type="password"
            placeholder="Repeat the chosen password..."
            name="repeatPassword"
          />
        </div>
        <input type="submit" value="Create an account for me" />
      </form>
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
      <form name="sign-in-form">
        <div>
          <input type="text" placeholder="Enter your username..." name="username" />
        </div>
        <div>
          <input type="password" placeholder="Enter your password..." name="password" />
        </div>
        <div>
          <input type="submit" value="Sign me in" />
        </div>
      </form>
    </React.Fragment>
  );
};

interface IEntry {
  id: number;
  timestampInUTC: string;
  utcZoneOfTimestamp: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export const MyMonthlyJournal = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename}` +
      ` - React is rendering <MyMonthlyJournal>`
  );

  const entriesEntities: { [key: string]: IEntry } = {
    1: {
      id: 1,
      timestampInUTC: "2020-12-01T15:17:00.000Z",
      utcZoneOfTimestamp: "+02:00",
      content: "Then it dawned on me: there is no finish line!",
      createdAt: "2021-04-29T05:10:56.000Z",
      updatedAt: "2021-04-29T05:10:56.000Z",
      userId: 1,
    },
    2: {
      id: 2,
      timestampInUTC: "2019-08-20T13:17:00.000Z",
      utcZoneOfTimestamp: "+01:00",
      content: "Mallorca has beautiful sunny beaches!",
      createdAt: "2021-04-29T05:11:01.000Z",
      updatedAt: "2021-04-29T05:11:01.000Z",
      userId: 2,
    },
  };

  const entriesIds: number[] = [2, 1];

  const entries = entriesIds.map((entryId: number) => {
    const e: IEntry = entriesEntities[entryId];

    return (
      <div key={e.id}>
        <hr></hr>
        <h3>{e.timestampInUTC} UTC</h3>
        <p>{e.content}</p>
      </div>
    );
  });

  return (
    <React.Fragment>
      {"<MyMonthlyJournal>"}
      <div>Review the entries in MyMonthlyJournal!</div>
      {entries}
    </React.Fragment>
  );
};

export default App;

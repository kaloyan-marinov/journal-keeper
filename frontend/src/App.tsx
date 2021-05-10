import React from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { createStore } from "redux";
import { useDispatch, useSelector } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { v4 as uuidv4 } from "uuid";
import { Dispatch } from "redux";

import { applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import axios from "axios";

/* Specify an initial value for the Redux state. */
enum RequestStatus {
  IDLE = "idle",
  LOADING = "loading",
  FAILED = "failed",
  SUCCEEDED = "succeeded",
}

interface IAlert {
  id: string;
  message: string;
}

interface IStateAlerts {
  ids: string[];
  entities: {
    [alertId: string]: IAlert;
  };
}

interface IStateAuth {
  requestStatus: RequestStatus;
  requestError: string | null;
  token: string | null;
}

interface IState {
  alerts: IStateAlerts;
  auth: IStateAuth;
}

const JOURNAL_APP_TOKEN = "token-4-journal-app";

export const initialState: IState = {
  alerts: {
    ids: [],
    entities: {},
  },
  auth: {
    requestStatus: RequestStatus.IDLE,
    requestError: null,
    token: localStorage.getItem(JOURNAL_APP_TOKEN),
  },
};

/* "auth/createUser/" action creators */
enum ActionTypesCreateUser {
  PENDING = "auth/createUser/pending",
  REJECTED = "auth/createUser/rejected",
  FULFILLED = "auth/createUser/fulfilled",
}

interface IActionCreateUserPending {
  type: typeof ActionTypesCreateUser.PENDING;
}

interface IActionCreateUserRejected {
  type: typeof ActionTypesCreateUser.REJECTED;
  error: string;
}

interface IActionCreateUserFulfilled {
  type: typeof ActionTypesCreateUser.FULFILLED;
}

export const createUserPending = (): IActionCreateUserPending => ({
  type: ActionTypesCreateUser.PENDING,
});

export const createUserRejected = (error: string): IActionCreateUserRejected => ({
  type: ActionTypesCreateUser.REJECTED,
  error,
});

export const createUserFulfilled = (): IActionCreateUserFulfilled => ({
  type: ActionTypesCreateUser.FULFILLED,
});

type ActionCreateUser =
  | IActionCreateUserPending
  | IActionCreateUserRejected
  | IActionCreateUserFulfilled;

/* "auth/createUser" thunk-action creator */
export const createUser = (
  username: string,
  name: string,
  email: string,
  password: string
) => async (dispatch: Dispatch<ActionCreateUser>) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify({
    username,
    name,
    email,
    password,
  });

  dispatch(createUserPending());
  try {
    const response = await axios.post("/api/users", body, config);
    dispatch(createUserFulfilled());
    return Promise.resolve();
  } catch (err) {
    const responseBody = err.response.data;
    const responseBodyError = responseBody.error || "ERROR NOT FROM BACKEND";
    dispatch(createUserRejected(responseBodyError));
    return Promise.reject(responseBodyError);
  }
};

/* "alerts/" action creators */
enum ActionTypesAlerts {
  CREATE = "alerts/create",
  REMOVE = "alerts/remove",
}

interface IActionAlertsCreate {
  type: typeof ActionTypesAlerts.CREATE;
  payload: {
    id: string;
    message: string;
  };
}

interface IActionAlertsRemove {
  type: typeof ActionTypesAlerts.REMOVE;
  payload: {
    id: string;
  };
}

export const alertsCreate = (id: string, message: string): IActionAlertsCreate => ({
  type: ActionTypesAlerts.CREATE,
  payload: {
    id,
    message,
  },
});

export const alertsRemove = (id: string): IActionAlertsRemove => ({
  type: ActionTypesAlerts.REMOVE,
  payload: {
    id,
  },
});

type ActionAlerts = IActionAlertsCreate | IActionAlertsRemove;

/* "auth/issueJWSToken/" action creators */
enum ActionTypesIssueJWSToken {
  PENDING = "auth/issueJWSToken/pending",
  REJECTED = "auth/issueJWSToken/rejected",
  FULFILLED = "auth/issueJWSToken/fulfilled",
}

interface IActionIssueJWSTokenPending {
  type: typeof ActionTypesIssueJWSToken.PENDING;
}

interface IActionIssueJWSTokenRejected {
  type: typeof ActionTypesIssueJWSToken.REJECTED;
  error: string;
}

interface IActionIssueJWSTokenFulfilled {
  type: typeof ActionTypesIssueJWSToken.FULFILLED;
  payload: {
    token: string;
  };
}

export const issueJWSTokenPending = (): IActionIssueJWSTokenPending => ({
  type: ActionTypesIssueJWSToken.PENDING,
});

export const issueJWSTokenRejected = (error: string): IActionIssueJWSTokenRejected => ({
  type: ActionTypesIssueJWSToken.REJECTED,
  error,
});

export const issueJWSTokenFulfilled = (
  token: string
): IActionIssueJWSTokenFulfilled => ({
  type: ActionTypesIssueJWSToken.FULFILLED,
  payload: {
    token,
  },
});

type ActionIssueJWSToken =
  | IActionIssueJWSTokenPending
  | IActionIssueJWSTokenRejected
  | IActionIssueJWSTokenFulfilled;

/* "auth/issueJWSToken" thunk-action creator */
export const issueJWSToken = (email: string, password: string) => async (
  dispatch: Dispatch<ActionIssueJWSToken>
) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    auth: {
      username: email,
      password,
    },
  };

  const body = {};

  dispatch(issueJWSTokenPending());
  try {
    const response = await axios.post("/api/tokens", body, config);
    localStorage.setItem(JOURNAL_APP_TOKEN, response.data.token);
    dispatch(issueJWSTokenFulfilled(response.data.token));
    return Promise.resolve();
  } catch (err) {
    const responseBody = err.response.data;
    const responseBodyError = responseBody.error || "ERROR NOT FROM BACKEND";
    dispatch(issueJWSTokenRejected(responseBodyError));
    return Promise.reject(responseBodyError);
  }
};

/*
Define a root reducer function,
which serves to instantiate a single Redux store.

(In turn, that store will be tasked with keeping track of the React application's
global state.)
*/
export const rootReducer = (
  state: IState = initialState,
  action: ActionCreateUser | ActionAlerts | ActionIssueJWSToken
): IState => {
  switch (action.type) {
    case ActionTypesCreateUser.PENDING:
      return {
        ...state,
        auth: {
          ...state.auth,
          requestStatus: RequestStatus.LOADING,
        },
      };
    case ActionTypesCreateUser.REJECTED:
      return {
        ...state,
        auth: {
          ...state.auth,
          requestStatus: RequestStatus.FAILED,
          requestError: action.error,
        },
      };
    case ActionTypesCreateUser.FULFILLED:
      return {
        ...state,
        auth: {
          ...state.auth,
          requestStatus: RequestStatus.SUCCEEDED,
          requestError: null,
        },
      };
    case ActionTypesAlerts.CREATE:
      const id: string = action.payload.id;
      const message: string = action.payload.message;

      const newIds: string[] = [id, ...state.alerts.ids];

      const newEntities = { ...state.alerts.entities };
      newEntities[id] = {
        id,
        message,
      };

      return {
        ...state,
        alerts: {
          ids: newIds,
          entities: newEntities,
        },
      };
    case ActionTypesAlerts.REMOVE:
      const idOfDeletedAlert: string = action.payload.id;

      const remainingIds: string[] = state.alerts.ids.filter(
        (id) => id !== idOfDeletedAlert
      );

      const remainingEntities = { ...state.alerts.entities };
      delete remainingEntities[idOfDeletedAlert];

      return {
        ...state,
        alerts: {
          ids: remainingIds,
          entities: remainingEntities,
        },
      };
    case ActionTypesIssueJWSToken.PENDING:
      return {
        ...state,
        auth: {
          ...state.auth,
          requestStatus: RequestStatus.LOADING,
        },
      };
    case ActionTypesIssueJWSToken.REJECTED:
      return {
        ...state,
        auth: {
          ...state.auth,
          requestStatus: RequestStatus.FAILED,
          requestError: action.error,
        },
      };
    case ActionTypesIssueJWSToken.FULFILLED:
      return {
        ...state,
        auth: {
          ...state.auth,
          requestStatus: RequestStatus.SUCCEEDED,
          requestError: null,
          token: action.payload.token,
        },
      };
    default:
      return state;
  }
};

const composedEnhancer = composeWithDevTools(
  /* Add all middleware functions, which you actually want to use, here: */
  applyMiddleware(thunkMiddleware)
  /* Add other store enhancers if any */
);
export const store = createStore(rootReducer, composedEnhancer);

/* Create React components. */
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
        <Alerts />
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

export const Alerts = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <Alerts>`
  );

  const dispatch = useDispatch();

  const alerts: IStateAlerts = useSelector((state: IState) => state.alerts);

  const onClick = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    dispatch(alertsRemove(id));
  };

  return (
    <>
      {"<Alerts>"}
      <br />
      {alerts.ids.length === 0 ? (
        <br />
      ) : (
        alerts.ids.map((id: string) => (
          <div key={id} style={{ color: "red" }}>
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => onClick(id, e)}
            >
              X
            </button>
            {alerts.entities[id].message}
          </div>
        ))
      )}
    </>
  );
};

export const SignUp = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <SignUp>`
  );

  const dispatch: Dispatch<
    IActionAlertsCreate | IActionCreateUserPending | any
  > = useDispatch();

  const [formData, setFormData] = React.useState({
    username: "",
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const id: string = uuidv4();
    if (formData.password !== formData.repeatPassword) {
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
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => onSubmit(e)}
      >
        <div>
          <input
            type="text"
            placeholder="Choose a username..."
            name="username"
            value={formData.username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Enter your name..."
            name="name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Enter your email address..."
            name="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Choose a password..."
            name="password"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Repeat the chosen password..."
            name="repeatPassword"
            value={formData.repeatPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
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

  const dispatch = useDispatch();

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const id: string = uuidv4();
    if (formData.email === "" || formData.password === "") {
      const message: string = "YOU MUST FILL OUT ALL FORM FIELDS";
      dispatch(alertsCreate(id, message));
    } else {
      try {
        await dispatch(issueJWSToken(formData.email, formData.password));
        await dispatch(alertsCreate(id, "SIGN-IN SUCCESSFUL"));
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
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => onSubmit(e)}
      >
        <div>
          <input
            type="email"
            placeholder="Enter your email..."
            name="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Enter your password..."
            name="password"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
          />
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
        <Link to="#">Edit</Link>
      </div>
    );
  });

  return (
    <React.Fragment>
      {"<MyMonthlyJournal>"}
      <div>Review the entries in MyMonthlyJournal!</div>
      <Link to="#">Create a new entry</Link>
      {entries}
    </React.Fragment>
  );
};

export default App;

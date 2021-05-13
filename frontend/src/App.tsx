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

import { combineReducers } from "redux";

import { ThunkAction, ThunkDispatch } from "redux-thunk";

/*
Specify all slices of the Redux state,
along with an initial value for each slice.
*/
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

export const initialStateAlerts: IStateAlerts = {
  ids: [],
  entities: {},
};

enum RequestStatus {
  IDLE = "idle",
  LOADING = "loading",
  FAILED = "failed",
  SUCCEEDED = "succeeded",
}

interface IStateAuth {
  requestStatus: RequestStatus;
  requestError: string | null;
  token: string | null;
}

const JOURNAL_APP_TOKEN = "token-4-journal-app";

export const initialStateAuth: IStateAuth = {
  requestStatus: RequestStatus.IDLE,
  requestError: null,
  token: localStorage.getItem(JOURNAL_APP_TOKEN),
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

export interface IStateEntries {
  requestStatus: RequestStatus;
  requestError: string | null;
  ids: number[];
  entities: {
    [entryId: string]: IEntry;
  };
}

export const initialStateEntries: IStateEntries = {
  requestStatus: RequestStatus.IDLE,
  requestError: null,
  ids: [],
  entities: {},
};

export interface IState {
  alerts: IStateAlerts;
  auth: IStateAuth;
  entries: IStateEntries;
}

/* alertsSlice - "alerts/" action creators */
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

/* authSlice - "auth/createUser/" action creators */
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

/* authSlice - "auth/createUser" thunk-action creator */
export const createUser = (
  username: string,
  name: string,
  email: string,
  password: string
): ThunkAction<void, IState, unknown, ActionCreateUser> => {
  /*
  Create a thunk-action.
  When dispatched, it issues an HTTP request
  to the backend's endpoint for creating a new User resource.
  */

  return async (dispatch: Dispatch<ActionCreateUser>) => {
    /*
    TODO: find out whether the type annotation of `dispatch` in the function signature
          above (and in analogous cases) is OK, or if it had better be removed
          completely
    */
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
};

/* authSlice - "auth/issueJWSToken/" action creators */
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

/* authSlice - "auth/issueJWSToken" thunk-action creator */
export const issueJWSToken = (
  email: string,
  password: string
): ThunkAction<void, IState, unknown, ActionIssueJWSToken> => {
  /*
  Create a thunk-action.
  When dispatched, it issues an HTTP request
  to the backend's endpoint for issuing a JSON Web Signature token
  (via which the client can subsequently authenticate itself to the backend
  application).
  */

  return async (dispatch: Dispatch<ActionIssueJWSToken>) => {
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
};

/* entriesSlice - "entries/fetchEntries/" action creators */
enum ActionTypesFetchEntries {
  PENDING = "entries/fetchEntries/pending",
  REJECTED = "entries/fetchEntries/rejected",
  FULFILLED = "entries/fetchEntries/fulfilled",
}

interface IFetchEntriesPending {
  type: typeof ActionTypesFetchEntries.PENDING;
}

interface IFetchEntriesRejected {
  type: typeof ActionTypesFetchEntries.REJECTED;
  error: string;
}

interface IFetchEntriesFulfilled {
  type: typeof ActionTypesFetchEntries.FULFILLED;
  payload: {
    entries: IEntry[];
  };
}

export const fetchEntriesPending = (): IFetchEntriesPending => ({
  type: ActionTypesFetchEntries.PENDING,
});

export const fetchEntriesRejected = (error: string): IFetchEntriesRejected => ({
  type: ActionTypesFetchEntries.REJECTED,
  error,
});

export const fetchEntriesFulfilled = (entries: IEntry[]): IFetchEntriesFulfilled => ({
  type: ActionTypesFetchEntries.FULFILLED,
  payload: {
    entries,
  },
});

type ActionFetchEntries =
  | IFetchEntriesPending
  | IFetchEntriesRejected
  | IFetchEntriesFulfilled;

/* entriesSlice - "entries/fetchEntries" thunk-action creator */
export const fetchEntries = (): ThunkAction<
  void,
  IState,
  unknown,
  ActionFetchEntries
> => {
  /*
  Create a thunk-action.
  When dispatched, it issues an HTTP request
  to the backend's endpoint for fetching all Entry resources,
  which are associated with a specific User.
  That User is uniquely specified by a JSON Web Signature token
  (which was earlier saved in the User's web browser by the frontend).
  */

  return async (dispatch: Dispatch<ActionFetchEntries>) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(JOURNAL_APP_TOKEN),
      },
    };

    dispatch(fetchEntriesPending());
    try {
      const response = await axios.get("/api/entries", config);
      dispatch(fetchEntriesFulfilled(response.data.entries));
      return Promise.resolve();
    } catch (err) {
      const responseBody = err.response.data;
      const responseBodyError = responseBody.error || "ERROR NOT FROM BACKEND";
      dispatch(fetchEntriesRejected(responseBodyError));
      return Promise.reject(responseBodyError);
    }
  };
};

/* alertsSlice - reducer */
export const alertsReducer = (
  stateAlerts: IStateAlerts = initialStateAlerts,
  action: ActionAlerts
): IStateAlerts => {
  switch (action.type) {
    case ActionTypesAlerts.CREATE:
      const id: string = action.payload.id;
      const message: string = action.payload.message;

      const newIds: string[] = [id, ...stateAlerts.ids];

      const newEntities = { ...stateAlerts.entities };
      newEntities[id] = {
        id,
        message,
      };

      return {
        ids: newIds,
        entities: newEntities,
      };

    case ActionTypesAlerts.REMOVE:
      const idOfDeletedAlert: string = action.payload.id;

      const remainingIds: string[] = stateAlerts.ids.filter(
        (id) => id !== idOfDeletedAlert
      );

      const remainingEntities = { ...stateAlerts.entities };
      delete remainingEntities[idOfDeletedAlert];

      return {
        ids: remainingIds,
        entities: remainingEntities,
      };

    default:
      return stateAlerts;
  }
};

/* authSlice - reducer */
export const authReducer = (
  stateAuth: IStateAuth = initialStateAuth,
  action: ActionCreateUser | ActionIssueJWSToken
): IStateAuth => {
  switch (action.type) {
    case ActionTypesCreateUser.PENDING:
      return {
        ...stateAuth,
        requestStatus: RequestStatus.LOADING,
        requestError: null,
      };

    case ActionTypesCreateUser.REJECTED:
      return {
        ...stateAuth,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      };

    case ActionTypesCreateUser.FULFILLED:
      return {
        ...stateAuth,
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
      };

    case ActionTypesIssueJWSToken.PENDING:
      return {
        ...stateAuth,
        requestStatus: RequestStatus.LOADING,
        requestError: null,
      };

    case ActionTypesIssueJWSToken.REJECTED:
      return {
        ...stateAuth,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      };

    case ActionTypesIssueJWSToken.FULFILLED:
      return {
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        token: action.payload.token,
      };

    default:
      return stateAuth;
  }
};

/* entriesSlice - reducer */
export const entriesReducer = (
  stateEntries: IStateEntries = initialStateEntries,
  action: ActionFetchEntries
): IStateEntries => {
  switch (action.type) {
    case ActionTypesFetchEntries.PENDING:
      return {
        ...stateEntries,
        requestStatus: RequestStatus.LOADING,
        requestError: null,
      };

    case ActionTypesFetchEntries.REJECTED:
      return {
        ...stateEntries,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      };

    case ActionTypesFetchEntries.FULFILLED: {
      const entries: IEntry[] = action.payload.entries;

      const ids: number[] = entries.map((e: IEntry) => e.id);
      const entities: { [key: string]: IEntry } = entries.reduce(
        (entriesObj: { [key: string]: IEntry }, entry: IEntry) => {
          entriesObj[entry.id] = entry;
          return entriesObj;
        },
        {}
      );

      return {
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        ids,
        entities,
      };
    }

    default:
      return stateEntries;
  }
};

/*
Define a root reducer function,
which serves to instantiate a single Redux store.

(In turn, that store will be responsible for keeping track of the React application's
global state.)
*/
export const rootReducer = combineReducers({
  alerts: alertsReducer,
  auth: authReducer,
  entries: entriesReducer,
});

const composedEnhancer = composeWithDevTools(
  /* Add all middleware functions, which you actually want to use, here: */
  applyMiddleware(thunkMiddleware)
  /* Add other store enhancers if any */
);
export const store = createStore(rootReducer, composedEnhancer);

/* React components. */
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
          <Route exact path="/create-entry">
            <CreateEntry />
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

  const dispatch: ThunkDispatch<IState, unknown, ActionAlerts> = useDispatch();

  const [formData, setFormData] = React.useState({
    username: "",
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
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

export const SignIn = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <SignIn>`
  );

  const dispatch: ThunkDispatch<IState, unknown, ActionAlerts> = useDispatch();

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
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

export const MyMonthlyJournal = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename}` +
      ` - React is rendering <MyMonthlyJournal>`
  );

  const dispatch: ThunkDispatch<IState, unknown, ActionAlerts> = useDispatch();

  React.useEffect(() => {
    console.log(
      `${new Date().toISOString()}` +
        ` - ${__filename}` +
        ` - React is running <MyMonthlyJournal>'s useEffect hook`
    );

    const effectFn = async () => {
      try {
        await dispatch(fetchEntries());
      } catch (err) {
        const id = uuidv4();
        dispatch(alertsCreate(id, err));
      }
    };

    effectFn();
  }, [dispatch]);

  const entriesEntities: { [key: string]: IEntry } = useSelector(
    (state: IState) => state.entries.entities
  );
  const entriesIds: number[] = useSelector((state: IState) => state.entries.ids);

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
      <Link to="/create-entry">Create a new entry</Link>
      {entries}
    </React.Fragment>
  );
};

export const CreateEntry = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <CreateEntry>`
  );

  const [formData, setFormData] = React.useState({
    timezone: "",
    localTime: "",
    content: "",
  });

  const dispatch: Dispatch = useDispatch();

  /*
  Create a list of the UTC time offsets
  "from the westernmost (−12:00) to the easternmost (+14:00)"
  (as per https://en.wikipedia.org/wiki/List_of_UTC_time_offsets ).
  */
  const start = -12;
  const end = 14;

  const nonnegativeOffsetsFromUtc = Array.from({ length: end + 1 }).map((_, ind) => {
    return "+" + ind.toString().padStart(2, "0") + ":00";
  });
  const negativeOffsetsFromUtc = Array.from({ length: -start }).map((_, ind) => {
    return "-" + (ind + 1).toString().padStart(2, "0") + ":00";
  });
  const offsetsFromUtc = negativeOffsetsFromUtc
    .reverse()
    .concat(nonnegativeOffsetsFromUtc);

  const timezoneOptions = offsetsFromUtc.map((offset, ind) => (
    <option key={ind} value={offset}>
      {offset}
    </option>
  ));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
      console.log(formData);
    }
  };

  return (
    <React.Fragment>
      {"<CreateEntry>"}
      <h3>You are about to create a new Entry!</h3>
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
          />
        </div>
        <div>
          <input type="submit" value="Create entry" />
        </div>
      </form>
    </React.Fragment>
  );
};

export default App;

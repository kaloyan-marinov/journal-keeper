import React from "react";
import { Switch, Route, Link } from "react-router-dom";
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

import { useParams } from "react-router-dom";

import moment from "moment";

import { Redirect } from "react-router-dom";

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

export interface IProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface IStateAuth {
  requestStatus: RequestStatus;
  requestError: string | null;
  token: string | null;
  hasValidToken: boolean | null;
  signedInUserProfile: IProfile | null;
}

export const JOURNAL_APP_TOKEN = "token-4-journal-app";

export const initialStateAuth: IStateAuth = {
  requestStatus: RequestStatus.IDLE,
  requestError: null,
  token: localStorage.getItem(JOURNAL_APP_TOKEN),
  hasValidToken: null,
  signedInUserProfile: null,
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

/* authSlice - "auth/fetchProfile/" action creators */
enum ActionTypesFetchProfile {
  PENDING = "auth/fetchProfile/pending",
  REJECTED = "auth/fetchProfile/rejected",
  FULFILLED = "auth/fetchProfile/fulfilled",
}

interface IActionFetchProfilePending {
  type: typeof ActionTypesFetchProfile.PENDING;
}

interface IActionFetchProfileRejected {
  type: typeof ActionTypesFetchProfile.REJECTED;
  error: string;
}

interface IActionFetchProfileFulfilled {
  type: typeof ActionTypesFetchProfile.FULFILLED;
  payload: {
    profile: IProfile;
  };
}

export const fetchProfilePending = (): IActionFetchProfilePending => ({
  type: ActionTypesFetchProfile.PENDING,
});

export const fetchProfileRejected = (error: string): IActionFetchProfileRejected => ({
  type: ActionTypesFetchProfile.REJECTED,
  error,
});

export const fetchProfileFulfilled = (
  profile: IProfile
): IActionFetchProfileFulfilled => ({
  type: ActionTypesFetchProfile.FULFILLED,
  payload: {
    profile,
  },
});

type ActionFetchProfile =
  | IActionFetchProfilePending
  | IActionFetchProfileRejected
  | IActionFetchProfileFulfilled;

/* authSlice - "auth/fetchProfile" thunk-action creator */
export const fetchProfile = (): ThunkAction<
  void,
  IState,
  unknown,
  ActionFetchProfile
> => {
  /*
  Create a thunk-action.
  When dispatched, it makes the web browser issue an HTTP request
  to the backend's endpoint for fetching the Profile of a specific User.

  That User is uniquely specified by JSON Web Signature token,
  which is required to have been saved earlier (by the frontend)
  in the HTTP-request-issuing web browser.
  */

  return async (dispatch) => {
    const config = {
      headers: {
        Authorization: "Bearer " + localStorage.getItem(JOURNAL_APP_TOKEN),
      },
    };

    dispatch(fetchProfilePending());
    try {
      const response = await axios.get("/api/user-profile", config);
      dispatch(fetchProfileFulfilled(response.data));
      return Promise.resolve();
    } catch (err) {
      const responseBody = err.response.data;
      const responseBodyError = responseBody.error || "ERROR NOT FROM BACKEND";
      dispatch(fetchProfileRejected(responseBodyError));
      return Promise.reject(responseBodyError);
    }
  };
};

/* authSlice - "auth/removeJWSToken" action creator */
const ACTION_TYPE_REMOVE_JWS_TOKEN = "auth/removeJWSToken";

interface IActionRemoveJWSToken {
  type: typeof ACTION_TYPE_REMOVE_JWS_TOKEN;
}

export const removeJWSToken = (): IActionRemoveJWSToken => ({
  type: ACTION_TYPE_REMOVE_JWS_TOKEN,
});

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
  When dispatched, it makes the web browser issue an HTTP request
  to the backend's endpoint for fetching all Entry resources,
  which are associated with a specific User.

  That User is uniquely specified by a JSON Web Signature token,
  which is required to have been saved earlier (by the frontend)
  in the HTTP-request-issuing web browser.
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

/* entriesSlice - "entries/createEntry/" action creators */
enum ActionTypesCreateEntry {
  PENDING = "entries/createEntry/pending",
  REJECTED = "entries/createEntry/rejected",
  FULFILLED = "entries/createEntry/fulfilled",
}

interface ICreateEntryPending {
  type: typeof ActionTypesCreateEntry.PENDING;
}

interface ICreateEntryRejected {
  type: typeof ActionTypesCreateEntry.REJECTED;
  error: string;
}

interface ICreateEntryFulfilled {
  type: typeof ActionTypesCreateEntry.FULFILLED;
  payload: {
    entry: IEntry;
  };
}

export const createEntryPending = (): ICreateEntryPending => ({
  type: ActionTypesCreateEntry.PENDING,
});

export const createEntryRejected = (error: string): ICreateEntryRejected => ({
  type: ActionTypesCreateEntry.REJECTED,
  error,
});

export const createEntryFulfilled = (entry: IEntry): ICreateEntryFulfilled => ({
  type: ActionTypesCreateEntry.FULFILLED,
  payload: {
    entry,
  },
});

type ActionCreateEntry =
  | ICreateEntryPending
  | ICreateEntryRejected
  | ICreateEntryFulfilled;

/* entriesSlice - "entries/createEntry" thunk-action creator */
export const createEntry = (
  localTime: string,
  timezone: string,
  content: string
): ThunkAction<void, IState, unknown, ActionCreateEntry> => {
  /*
  Create a thunk-action.
  When dispatched, it makes the web browser issue an HTTP request
  to the backend's endpoint for creating a new Entry resource.
  
  Like all Entry resources, the new one will be associated with a specific User.
  That User is uniquely specified by a JSON Web Signature token,
  which is required to have been saved earlier (by the frontend)
  in the HTTP-request-issuing web browser.
  */

  return async (dispatch) => {
    const body = JSON.stringify({
      localTime,
      timezone,
      content,
    });
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(JOURNAL_APP_TOKEN),
      },
    };

    dispatch(createEntryPending());
    try {
      const response = await axios.post("/api/entries", body, config);
      dispatch(createEntryFulfilled(response.data));
      return Promise.resolve();
    } catch (err) {
      const responseBody = err.response.data;
      const responseBodyError = responseBody.error || "ERROR NOT FROM BACKEND";
      dispatch(createEntryRejected(responseBodyError));
      return Promise.reject(responseBodyError);
    }
  };
};

/* entriesSlice - "entries/editEntry/" action creators */
enum ActionTypesEditEntry {
  PENDING = "entries/editEntry/pending",
  REJECTED = "entries/editEntry/rejected",
  FULFILLED = "entries/editEntry/fulfilled",
}

interface IEditEntryPending {
  type: typeof ActionTypesEditEntry.PENDING;
}

interface IEditEntryRejected {
  type: typeof ActionTypesEditEntry.REJECTED;
  error: string;
}

interface IEditEntryFulfilled {
  type: typeof ActionTypesEditEntry.FULFILLED;
  payload: {
    entry: IEntry;
  };
}

export const editEntryPending = (): IEditEntryPending => ({
  type: ActionTypesEditEntry.PENDING,
});

export const editEntryRejected = (error: string): IEditEntryRejected => ({
  type: ActionTypesEditEntry.REJECTED,
  error,
});

export const editEntryFulfilled = (entry: IEntry): IEditEntryFulfilled => ({
  type: ActionTypesEditEntry.FULFILLED,
  payload: {
    entry,
  },
});

type ActionEditEntry = IEditEntryPending | IEditEntryRejected | IEditEntryFulfilled;

/* entriesSlice - "entries/editEntry" thunk-action creator */
export const editEntry = (
  entryId: number,
  localTime: string,
  timezone: string,
  content: string
): ThunkAction<void, IState, unknown, ActionEditEntry> => {
  /*
  Create a thunk-action.
  When dispatched, it makes the web browser issue an HTTP request
  to the backend's endpoint for editing a specific Entry resource.

  Like all Entry resources, the targeted one must be associated with a specific User.
  That User is uniquely specified by a JSON Web Signature token,
  which is required to have been saved earlier (by the frontend)
  in the HTTP-request-issuing web browser.
  */

  return async (dispatch) => {
    const body = JSON.stringify({
      localTime,
      timezone,
      content,
    });
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(JOURNAL_APP_TOKEN),
      },
    };

    dispatch(editEntryPending());
    try {
      const response = await axios.put(`/api/entries/${entryId}`, body, config);
      console.debug("response.data");
      console.debug(response.data);
      dispatch(editEntryFulfilled(response.data));
      return Promise.resolve();
    } catch (err) {
      const responseBody = err.response.data;
      const responseBodyError = responseBody.error || "ERROR NOT FROM BACKEND";
      dispatch(editEntryRejected(responseBodyError));
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

      const newEntities: { [alertId: string]: IAlert } = { ...stateAlerts.entities };
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
  action:
    | ActionCreateUser
    | ActionIssueJWSToken
    | ActionFetchProfile
    | IActionRemoveJWSToken
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
        hasValidToken: false,
      };

    case ActionTypesIssueJWSToken.FULFILLED:
      return {
        ...stateAuth,
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        token: action.payload.token,
        hasValidToken: true,
      };

    case ActionTypesFetchProfile.PENDING:
      return {
        ...stateAuth,
        requestStatus: RequestStatus.LOADING,
        requestError: null,
      };

    case ActionTypesFetchProfile.REJECTED:
      return {
        ...stateAuth,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
        hasValidToken: false,
      };

    case ActionTypesFetchProfile.FULFILLED: {
      const profile: IProfile = action.payload.profile;

      return {
        ...stateAuth,
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        hasValidToken: true,
        signedInUserProfile: profile,
      };
    }

    case ACTION_TYPE_REMOVE_JWS_TOKEN:
      return {
        ...stateAuth,
        token: null,
        hasValidToken: false,
        signedInUserProfile: null,
      };

    default:
      return stateAuth;
  }
};

/* entriesSlice - reducer */
export const entriesReducer = (
  stateEntries: IStateEntries = initialStateEntries,
  action: ActionFetchEntries | ActionCreateEntry | ActionEditEntry
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

    case ActionTypesCreateEntry.PENDING:
      return {
        ...stateEntries,
        requestStatus: RequestStatus.LOADING,
        requestError: null,
      };

    case ActionTypesCreateEntry.REJECTED:
      return {
        ...stateEntries,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      };

    case ActionTypesCreateEntry.FULFILLED: {
      const entry: IEntry = action.payload.entry;

      const newIds: number[] = [...stateEntries.ids, entry.id];

      const newEntities: { [entryId: string]: IEntry } = { ...stateEntries.entities };
      newEntities[entry.id] = entry;

      return {
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        ids: newIds,
        entities: newEntities,
      };
    }

    case ActionTypesEditEntry.PENDING:
      return {
        ...stateEntries,
        requestStatus: RequestStatus.LOADING,
        requestError: null,
      };

    case ActionTypesEditEntry.REJECTED:
      return {
        ...stateEntries,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      };

    case ActionTypesEditEntry.FULFILLED: {
      const entry: IEntry = action.payload.entry;

      const newEntities: { [entryId: string]: IEntry } = { ...stateEntries.entities };
      newEntities[entry.id] = entry;

      return {
        ...stateEntries,
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        entities: newEntities,
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

/* Define selector functions. */
const selectAlertsIds = (state: IState) => state.alerts.ids;
const selectAlertsEntities = (state: IState) => state.alerts.entities;

const selectAuthRequestStatus = (state: IState) => state.auth.requestStatus;
const selectHasValidToken = (state: IState) => state.auth.hasValidToken;
const selectSignedInUserProfile = (state: IState) => state.auth.signedInUserProfile;

const selectEntriesIds = (state: IState) => state.entries.ids;
const selectEntriesEntities = (state: IState) => state.entries.entities;

/* React components. */
const App = () => {
  console.log(`${new Date().toISOString()} - ${__filename} - React is rendering <App>`);

  const dispatch: ThunkDispatch<
    IState,
    unknown,
    IActionRemoveJWSToken | ActionFetchProfile | IActionAlertsCreate
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
        localStorage.removeItem(JOURNAL_APP_TOKEN);
        dispatch(removeJWSToken());

        const id: string = uuidv4();
        dispatch(alertsCreate(id, "TO CONTINUE, PLEASE SIGN IN"));
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
        <PrivateRoute exact path="/my-monthly-journal">
          <MyMonthlyJournal />
        </PrivateRoute>
        <PrivateRoute exact path="/entries/create">
          <CreateEntry />
        </PrivateRoute>
        <PrivateRoute exact path="/entries/:id/edit">
          <EditEntry />
        </PrivateRoute>
      </Switch>
    </React.Fragment>
  );
};

export const Alerts = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <Alerts>`
  );

  const alertsIds: string[] = useSelector(selectAlertsIds);
  console.log("    alertsIds:");
  console.log(`    ${JSON.stringify(alertsIds)}`);

  const alertsEntities: { [alertId: string]: IAlert } =
    useSelector(selectAlertsEntities);
  console.log("    alertsEntities:");
  console.log(`    ${JSON.stringify(alertsEntities)}`);

  const dispatch = useDispatch();

  const handleClickX = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    dispatch(alertsRemove(id));
  };

  return (
    <>
      {"<Alerts>"}
      <br />
      {alertsIds.length === 0 ? (
        <br />
      ) : (
        alertsIds.map((id: string) => (
          <div key={id} style={{ color: "red" }}>
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClickX(id, e)}
            >
              X
            </button>
            {alertsEntities[id].message}
          </div>
        ))
      )}
    </>
  );
};

export const Home = () => {
  console.log(
    `${new Date().toISOString()}` + ` - ${__filename}` + ` - React is rendering <Home>`
  );

  const hasValidToken: boolean | null = useSelector(selectHasValidToken);
  console.log("    hasValidToken:");
  console.log(`    ${hasValidToken}`);

  const signedInUserProfile: IProfile | null = useSelector(selectSignedInUserProfile);
  console.log("    signedInUserProfile:");
  console.log(`    ${JSON.stringify(signedInUserProfile)}`);

  const dispatch = useDispatch();

  React.useEffect(() => {
    console.log(
      `${new Date().toISOString()}` +
        ` - ${__filename}` +
        ` - React is running <Home>'s useEffect hook`
    );

    const effectFn = async () => {
      if (hasValidToken === true && signedInUserProfile === null) {
        console.log("    <Home>'s useEffect hook is dispatching fetchProfile()");

        try {
          await dispatch(fetchProfile());
        } catch (err) {
          localStorage.removeItem(JOURNAL_APP_TOKEN);
          dispatch(removeJWSToken());

          const id: string = uuidv4();
          dispatch(alertsCreate(id, "TO CONTINUE, PLEASE SIGN IN"));
        }
      }
    };

    effectFn();
  }, [dispatch]);

  const greeting =
    signedInUserProfile !== null
      ? `Hello, ${signedInUserProfile.name}!`
      : "Welcome to MyMonthlyJournal!";

  return (
    <React.Fragment>
      {"<Home>"}
      <div>{greeting}</div>
    </React.Fragment>
  );
};

export const NavigationBar = () => {
  console.log(
    `${new Date().toISOString()}` +
      ` - ${__filename}` +
      ` - React is rendering <NavigationBar>`
  );

  const hasValidToken: boolean | null = useSelector(selectHasValidToken);
  console.log("    hasValidToken:");
  console.log(`    ${hasValidToken}`);

  const dispatch = useDispatch();

  const signOut = () => {
    localStorage.removeItem(JOURNAL_APP_TOKEN);
    dispatch(removeJWSToken());

    const id: string = uuidv4();
    dispatch(alertsCreate(id, "SIGN-OUT SUCCESSFUL"));
  };

  const navigationLinks = !hasValidToken ? (
    <React.Fragment>
      <Link to="/">Home</Link> | <Link to="/sign-in">Sign In</Link> |{" "}
      <Link to="/sign-up">Sign Up</Link>
    </React.Fragment>
  ) : (
    <React.Fragment>
      <Link to="/">Home</Link> | <Link to="/my-monthly-journal">MyMonthlyJournal</Link>{" "}
      |{" "}
      <a href="#!" onClick={() => signOut()}>
        Sign Out
      </a>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <div>{"<NavigationBar>"}</div>
      <div>{navigationLinks}</div>
    </React.Fragment>
  );
};

export const SignUp = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <SignUp>`
  );

  const hasValidToken: boolean | null = useSelector(selectHasValidToken);
  console.log("    hasValidToken:");
  console.log(`    ${hasValidToken}`);

  const dispatch: ThunkDispatch<IState, unknown, ActionAlerts> = useDispatch();

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

export const SignIn = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <SignIn>`
  );

  const hasValidToken: boolean | null = useSelector(selectHasValidToken);
  console.log("    hasValidToken:");
  console.log(`    ${hasValidToken}`);

  const dispatch: ThunkDispatch<IState, unknown, ActionAlerts> = useDispatch();

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
    console.log(`    authRequestStatus="${RequestStatus.LOADING}"`);
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

export const MyMonthlyJournal = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename}` +
      ` - React is rendering <MyMonthlyJournal>`
  );

  const entriesIds: number[] = useSelector(selectEntriesIds);
  console.log("    entriesIds:");
  console.log(`    ${JSON.stringify(entriesIds)}`);

  const entriesEntities: { [entryId: string]: IEntry } =
    useSelector(selectEntriesEntities);
  console.log("    entriesEntities:");
  console.log(`    ${JSON.stringify(entriesEntities)}`);

  const dispatch: ThunkDispatch<IState, unknown, ActionAlerts> = useDispatch();

  React.useEffect(() => {
    console.log(
      `${new Date().toISOString()}` +
        ` - ${__filename}` +
        ` - React is running <MyMonthlyJournal>'s useEffect hook`
    );

    const effectFn = async () => {
      console.log(
        "    <MyMonthlyJournal>'s useEffect hook is dispatching fetchEntries()"
      );

      try {
        await dispatch(fetchEntries());
      } catch (err) {
        const id = uuidv4();
        dispatch(alertsCreate(id, err));
      }
    };

    effectFn();
  }, [dispatch]);

  const entries = entriesIds.map((entryId: number) => {
    const e: IEntry = entriesEntities[entryId];

    return (
      <div key={e.id}>
        <hr />
        <SingleEntry timestampInUTC={e.timestampInUTC} content={e.content} />
        <Link to={`/entries/${e.id}/edit`}>Edit</Link>
      </div>
    );
  });

  return (
    <React.Fragment>
      {"<MyMonthlyJournal>"}
      <div>Review the entries in MyMonthlyJournal!</div>
      <Link to="/entries/create">Create a new entry</Link>
      {entries}
    </React.Fragment>
  );
};

type SingleEntryProps = {
  timestampInUTC: string;
  content: string;
};

const SingleEntry = (props: SingleEntryProps) => {
  return (
    <React.Fragment>
      {"<SingleEntry>"}
      <h3>
        {moment.utc(props.timestampInUTC).format("YYYY-MM-DD HH:mm")} (UTC +00:00)
      </h3>
      <p>{props.content}</p>
    </React.Fragment>
  );
};

const offsetsFromUtc = () => {
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
  return offsetsFromUtc;
};

export const CreateEntry = () => {
  console.log(
    `${new Date().toISOString()} - ${__filename} - React is rendering <CreateEntry>`
  );

  const dispatch: ThunkDispatch<IState, unknown, ActionAlerts> = useDispatch();

  const [formData, setFormData] = React.useState({
    timezone: "",
    localTime: "",
    content: "",
  });
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
      } catch (thunkActionError) {
        dispatch(alertsCreate(id, thunkActionError));
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

  const entry: IEntry = useSelector(selectEntriesEntities)[entryId];
  console.log("    entry:");
  console.log(`    ${JSON.stringify(entry)}`);

  const dispatch = useDispatch();

  const [formData, setFormData] = React.useState({
    timezone: entry.utcZoneOfTimestamp,
    localTime: moment
      .utc(entry.timestampInUTC)
      .utcOffset(entry.utcZoneOfTimestamp)
      .format("YYYY-MM-DD HH:mm"),
    content: entry.content,
  });
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
      } catch (thunkActionError) {
        dispatch(alertsCreate(id, thunkActionError));
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
      <SingleEntry timestampInUTC={entry.timestampInUTC} content={entry.content} />
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

export default App;

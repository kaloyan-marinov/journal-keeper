import { combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { createStore } from "redux";

import axios from "axios";
import { ThunkAction } from "redux-thunk";
import { Dispatch } from "redux";
import { v4 as uuidv4 } from "uuid";

import {
  IStateAlerts,
  IStateAuth,
  IStateEntries,
  IState,
  IAlert,
  RequestStatus,
  IProfile,
  IPaginationMeta,
  IPaginationLinks,
  IEntry,
} from "./types";
import {
  initialStateAlerts,
  initialStateAuth,
  initialStateEntries,
  JOURNAL_APP_TOKEN,
} from "./constants";

/* alertsSlice - "alerts/" action creators */
enum ActionTypesAlerts {
  CREATE = "alerts/create",
  REMOVE = "alerts/remove",
}

export interface IActionAlertsCreate {
  type: typeof ActionTypesAlerts.CREATE;
  payload: {
    id: string;
    message: string;
  };
}

export interface IActionAlertsRemove {
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

export type ActionAlerts = IActionAlertsCreate | IActionAlertsRemove;

/* authSlice - "auth/createUser/" action creators */
enum ActionTypesCreateUser {
  PENDING = "auth/createUser/pending",
  REJECTED = "auth/createUser/rejected",
  FULFILLED = "auth/createUser/fulfilled",
}

export interface IActionCreateUserPending {
  type: typeof ActionTypesCreateUser.PENDING;
}

export interface IActionCreateUserRejected {
  type: typeof ActionTypesCreateUser.REJECTED;
  error: string;
}

export interface IActionCreateUserFulfilled {
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

export type ActionCreateUser =
  | IActionCreateUserPending
  | IActionCreateUserRejected
  | IActionCreateUserFulfilled;

/* authSlice - "auth/createUser" thunk-action creator */
export const createUser = (
  username: string,
  name: string,
  email: string,
  password: string
): ThunkAction<Promise<any>, IState, unknown, ActionCreateUser> => {
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
      const responseBodyError =
        responseBody.error || "ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION";
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

export interface IActionIssueJWSTokenPending {
  type: typeof ActionTypesIssueJWSToken.PENDING;
}

export interface IActionIssueJWSTokenRejected {
  type: typeof ActionTypesIssueJWSToken.REJECTED;
  error: string;
}

export interface IActionIssueJWSTokenFulfilled {
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

export type ActionIssueJWSToken =
  | IActionIssueJWSTokenPending
  | IActionIssueJWSTokenRejected
  | IActionIssueJWSTokenFulfilled;

/* authSlice - "auth/issueJWSToken" thunk-action creator */
export const issueJWSToken = (
  email: string,
  password: string
): ThunkAction<Promise<any>, IState, unknown, ActionIssueJWSToken> => {
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
      const responseBodyError =
        responseBody.error || "ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION";
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

export interface IActionFetchProfilePending {
  type: typeof ActionTypesFetchProfile.PENDING;
}

export interface IActionFetchProfileRejected {
  type: typeof ActionTypesFetchProfile.REJECTED;
  error: string;
}

export interface IActionFetchProfileFulfilled {
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

export type ActionFetchProfile =
  | IActionFetchProfilePending
  | IActionFetchProfileRejected
  | IActionFetchProfileFulfilled;

/* authSlice - "auth/fetchProfile" thunk-action creator */
export const fetchProfile = (): ThunkAction<
  Promise<any>,
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
      const responseBodyError =
        responseBody.error || "ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION";
      dispatch(fetchProfileRejected(responseBodyError));
      return Promise.reject(responseBodyError);
    }
  };
};

/* authSlice - "auth/clearAuthSlice" action creator */
const ACTION_TYPE_CLEAR_AUTH_SLICE = "auth/clearAuthSlice";

export interface IActionClearAuthSlice {
  type: typeof ACTION_TYPE_CLEAR_AUTH_SLICE;
}

export const clearAuthSlice = (): IActionClearAuthSlice => ({
  type: ACTION_TYPE_CLEAR_AUTH_SLICE,
});

/* entriesSlice - "entries/fetchEntries/" action creators */
enum ActionTypesFetchEntries {
  PENDING = "entries/fetchEntries/pending",
  REJECTED = "entries/fetchEntries/rejected",
  FULFILLED = "entries/fetchEntries/fulfilled",
}

export interface IFetchEntriesPending {
  type: typeof ActionTypesFetchEntries.PENDING;
}

export interface IFetchEntriesRejected {
  type: typeof ActionTypesFetchEntries.REJECTED;
  error: string;
}

export interface IFetchEntriesFulfilled {
  type: typeof ActionTypesFetchEntries.FULFILLED;
  payload: {
    _meta: IPaginationMeta;
    _links: IPaginationLinks;
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

export const fetchEntriesFulfilled = (
  _meta: IPaginationMeta,
  _links: IPaginationLinks,
  items: IEntry[]
): IFetchEntriesFulfilled => ({
  type: ActionTypesFetchEntries.FULFILLED,
  payload: {
    _meta,
    _links,
    entries: items,
  },
});

export type ActionFetchEntries =
  | IFetchEntriesPending
  | IFetchEntriesRejected
  | IFetchEntriesFulfilled;

/* entriesSlice - "entries/fetchEntries" thunk-action creator */
export const fetchEntries = (
  urlForOnePageOfEntries: string
): ThunkAction<Promise<any>, IState, unknown, ActionFetchEntries> => {
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
      const response = await axios.get(urlForOnePageOfEntries, config);
      dispatch(
        fetchEntriesFulfilled(
          response.data._meta,
          response.data._links,
          response.data.items
        )
      );
      return Promise.resolve();
    } catch (err) {
      const responseBodyError =
        err.response.data.error ||
        "ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION";
      dispatch(fetchEntriesRejected(responseBodyError));
      return Promise.reject(err);
    }
  };
};

/* entriesSlice - "entries/createEntry/" action creators */
enum ActionTypesCreateEntry {
  PENDING = "entries/createEntry/pending",
  REJECTED = "entries/createEntry/rejected",
  FULFILLED = "entries/createEntry/fulfilled",
}

export interface ICreateEntryPending {
  type: typeof ActionTypesCreateEntry.PENDING;
}

export interface ICreateEntryRejected {
  type: typeof ActionTypesCreateEntry.REJECTED;
  error: string;
}

export interface ICreateEntryFulfilled {
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

export type ActionCreateEntry =
  | ICreateEntryPending
  | ICreateEntryRejected
  | ICreateEntryFulfilled;

/* entriesSlice - "entries/createEntry" thunk-action creator */
export const createEntry = (
  localTime: string,
  timezone: string,
  content: string
): ThunkAction<Promise<any>, IState, unknown, ActionCreateEntry> => {
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
      const responseBodyError =
        err.response.data.error ||
        "ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION";
      dispatch(createEntryRejected(responseBodyError));
      return Promise.reject(err);
    }
  };
};

/* entriesSlice - "entries/editEntry/" action creators */
enum ActionTypesEditEntry {
  PENDING = "entries/editEntry/pending",
  REJECTED = "entries/editEntry/rejected",
  FULFILLED = "entries/editEntry/fulfilled",
}

export interface IEditEntryPending {
  type: typeof ActionTypesEditEntry.PENDING;
}

export interface IEditEntryRejected {
  type: typeof ActionTypesEditEntry.REJECTED;
  error: string;
}

export interface IEditEntryFulfilled {
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

export type ActionEditEntry =
  | IEditEntryPending
  | IEditEntryRejected
  | IEditEntryFulfilled;

/* entriesSlice - "entries/editEntry" thunk-action creator */
export const editEntry = (
  entryId: number,
  localTime: string,
  timezone: string,
  content: string
): ThunkAction<Promise<any>, IState, unknown, ActionEditEntry> => {
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
      dispatch(editEntryFulfilled(response.data));
      return Promise.resolve();
    } catch (err) {
      const responseBodyError =
        err.response.data.error ||
        "ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION";
      dispatch(editEntryRejected(responseBodyError));
      return Promise.reject(err);
    }
  };
};

/* deleteEntry - "entries/deleteEntry/" action creators */
enum ActionTypesDeleteEntry {
  PENDING = "entries/deleteEntry/pending",
  REJECTED = "entries/deleteEntry/rejected",
  FULFILLED = "entries/deleteEntry/fulfilled",
}

export interface IDeleteEntryPending {
  type: typeof ActionTypesDeleteEntry.PENDING;
}

export interface IDeleteEntryRejected {
  type: typeof ActionTypesDeleteEntry.REJECTED;
  error: string;
}

export interface IDeleteEntryFulfilled {
  type: typeof ActionTypesDeleteEntry.FULFILLED;
  payload: {
    entryId: number;
  };
}

export const deleteEntryPending = (): IDeleteEntryPending => ({
  type: ActionTypesDeleteEntry.PENDING,
});

export const deleteEntryRejected = (error: string): IDeleteEntryRejected => ({
  type: ActionTypesDeleteEntry.REJECTED,
  error,
});

export const deleteEntryFulfilled = (entryId: number): IDeleteEntryFulfilled => ({
  type: ActionTypesDeleteEntry.FULFILLED,
  payload: {
    entryId,
  },
});

export type ActionDeleteEntry =
  | IDeleteEntryPending
  | IDeleteEntryRejected
  | IDeleteEntryFulfilled;

/* deleteEntry - "entry/deleteEntry" thunk-action creator */
export const deleteEntry = (
  entryId: number
): ThunkAction<Promise<any>, IState, unknown, ActionDeleteEntry> => {
  /*
  Create a thunk-action.
  When dispatched, it makes the web browser issue an HTTP request
  to the backend's endpoint for deleting a specific Entry resource.

  Like all Entry resources, the targeted one must be associated with a specific User.
  That User is uniquely specified by a JSON Web Signature token,
  which is required to have been saved earlier (by the frontend)
  in the HTTP-request-issuing web browser.
  */

  return async (dispatch) => {
    const config = {
      headers: {
        Authorization: "Bearer " + localStorage.getItem(JOURNAL_APP_TOKEN),
      },
    };

    dispatch(deleteEntryPending());
    try {
      const response = await axios.delete(`/api/entries/${entryId}`, config);
      dispatch(deleteEntryFulfilled(entryId));
      return Promise.resolve();
    } catch (err) {
      const responseBodyError =
        err.response.data.error ||
        "ERROR NOT FROM BACKEND BUT FROM FRONTEND THUNK-ACTION";
      dispatch(deleteEntryRejected(responseBodyError));
      return Promise.reject(err);
    }
  };
};

/* entriesSlice - "entries/clearEntriesSlice" action creator */
const ACTION_TYPE_CLEAR_ENTRIES_SLICE = "entries/clearEntriesSlice";

export interface IActionClearEntriesSlice {
  type: typeof ACTION_TYPE_CLEAR_ENTRIES_SLICE;
}

export const clearEntriesSlice = (): IActionClearEntriesSlice => ({
  type: ACTION_TYPE_CLEAR_ENTRIES_SLICE,
});

/* authSlice + entriesSlice - "authSlice + entriesSlice" thunk-action creator */
export const signOut = (message: string) => {
  /*
  Create a thunk-action.
  When dispatched, it signs the user out
  and creates an alert.
  */
  return (
    dispatch: Dispatch<
      IActionClearAuthSlice | IActionClearEntriesSlice | IActionAlertsCreate
    >
  ) => {
    localStorage.removeItem(JOURNAL_APP_TOKEN);
    dispatch(clearAuthSlice());

    dispatch(clearEntriesSlice());

    const id: string = uuidv4();
    dispatch(alertsCreate(id, message));
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
    | IActionClearAuthSlice
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

    case ACTION_TYPE_CLEAR_AUTH_SLICE:
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
  action:
    | ActionFetchEntries
    | ActionCreateEntry
    | ActionEditEntry
    | ActionDeleteEntry
    | IActionClearEntriesSlice
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
      const _meta: IPaginationMeta = action.payload._meta;
      const _links: IPaginationLinks = action.payload._links;
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
        _meta,
        _links,
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
      const newMeta: IPaginationMeta = {
        ...initialStateEntries._meta,
        totalItems:
          stateEntries._meta.totalItems !== null
            ? stateEntries._meta.totalItems + 1
            : null,
      };

      const newLinks: IPaginationLinks = {
        ...initialStateEntries._links,
      };

      const entry: IEntry = action.payload.entry;
      const newIds: number[] = [...stateEntries.ids, entry.id];
      const newEntities: { [entryId: string]: IEntry } = { ...stateEntries.entities };
      newEntities[entry.id] = entry;

      return {
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        _meta: newMeta,
        _links: newLinks,
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

    case ActionTypesDeleteEntry.PENDING:
      return {
        ...stateEntries,
        requestStatus: RequestStatus.LOADING,
        requestError: null,
      };

    case ActionTypesDeleteEntry.REJECTED:
      return {
        ...stateEntries,
        requestStatus: RequestStatus.FAILED,
        requestError: action.error,
      };

    case ActionTypesDeleteEntry.FULFILLED: {
      const idOfDeletedEntry: number = action.payload.entryId;

      const newIds: number[] = [...stateEntries.ids].filter(
        (eId: number) => eId !== idOfDeletedEntry
      );

      const newEntities: { [entryId: string]: IEntry } = { ...stateEntries.entities };
      delete newEntities[idOfDeletedEntry];

      return {
        ...stateEntries,
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        ids: newIds,
        entities: newEntities,
      };
    }

    case ACTION_TYPE_CLEAR_ENTRIES_SLICE:
      return {
        ...stateEntries,
        ids: [],
        entities: {},
      };

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
export const selectAlertsIds = (state: IState) => state.alerts.ids;
export const selectAlertsEntities = (state: IState) => state.alerts.entities;

export const selectAuthRequestStatus = (state: IState) => state.auth.requestStatus;
export const selectHasValidToken = (state: IState) => state.auth.hasValidToken;
export const selectSignedInUserProfile = (state: IState) =>
  state.auth.signedInUserProfile;

export const selectEntriesMeta = (state: IState) => state.entries._meta;
export const selectEntriesLinks = (state: IState) => state.entries._links;
export const selectEntriesIds = (state: IState) => state.entries.ids;
export const selectEntriesEntities = (state: IState) => state.entries.entities;

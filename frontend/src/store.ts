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
  IStateEntries,
  IState,
  RequestStatus,
  IPaginationMeta,
  IPaginationLinks,
  IEntry,
} from "./types";
import { initialStateEntries, JOURNAL_APP_TOKEN } from "./constants";
import {
  alertsCreate,
  alertsReducer,
  IActionAlertsCreate,
} from "./features/alerts/alertsSlice";
import {
  authReducer,
  clearAuthSlice,
  IActionClearAuthSlice,
} from "./features/auth/authSlice";

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

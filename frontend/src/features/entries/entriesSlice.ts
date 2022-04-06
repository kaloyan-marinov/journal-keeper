import {
  IEntry,
  IPaginationLinks,
  IPaginationMeta,
  IState,
  IStateEntries,
  RequestStatus,
} from "../../types";
import { INITIAL_STATE_ENTRIES, JOURNAL_APP_TOKEN } from "../../constants";

import { ThunkAction } from "redux-thunk";
import { Dispatch } from "redux";
import axios from "axios";

/* Action creators - "entries/fetchEntries/" */
export enum ActionTypesFetchEntries {
  PENDING = "entries/fetchEntries/pending",
  REJECTED = "entries/fetchEntries/rejected",
  FULFILLED = "entries/fetchEntries/fulfilled",
}

export interface IActionFetchEntriesPending {
  type: typeof ActionTypesFetchEntries.PENDING;
}

export interface IActionFetchEntriesRejected {
  type: typeof ActionTypesFetchEntries.REJECTED;
  error: string;
}

export interface IActionFetchEntriesFulfilled {
  type: typeof ActionTypesFetchEntries.FULFILLED;
  payload: {
    _meta: IPaginationMeta;
    _links: IPaginationLinks;
    entries: IEntry[];
  };
}

export const fetchEntriesPending = (): IActionFetchEntriesPending => ({
  type: ActionTypesFetchEntries.PENDING,
});

export const fetchEntriesRejected = (error: string): IActionFetchEntriesRejected => ({
  type: ActionTypesFetchEntries.REJECTED,
  error,
});

export const fetchEntriesFulfilled = (
  _meta: IPaginationMeta,
  _links: IPaginationLinks,
  items: IEntry[]
): IActionFetchEntriesFulfilled => ({
  type: ActionTypesFetchEntries.FULFILLED,
  payload: {
    _meta,
    _links,
    entries: items,
  },
});

export type ActionFetchEntries =
  | IActionFetchEntriesPending
  | IActionFetchEntriesRejected
  | IActionFetchEntriesFulfilled;

/* Action creators - "entries/createEntry/" */
export enum ActionTypesCreateEntry {
  PENDING = "entries/createEntry/pending",
  REJECTED = "entries/createEntry/rejected",
  FULFILLED = "entries/createEntry/fulfilled",
}

export interface IActionCreateEntryPending {
  type: typeof ActionTypesCreateEntry.PENDING;
}

export interface IActionCreateEntryRejected {
  type: typeof ActionTypesCreateEntry.REJECTED;
  error: string;
}

export interface IActionCreateEntryFulfilled {
  type: typeof ActionTypesCreateEntry.FULFILLED;
  payload: {
    entry: IEntry;
  };
}

export const createEntryPending = (): IActionCreateEntryPending => ({
  type: ActionTypesCreateEntry.PENDING,
});

export const createEntryRejected = (error: string): IActionCreateEntryRejected => ({
  type: ActionTypesCreateEntry.REJECTED,
  error,
});

export const createEntryFulfilled = (entry: IEntry): IActionCreateEntryFulfilled => ({
  type: ActionTypesCreateEntry.FULFILLED,
  payload: {
    entry,
  },
});

export type ActionCreateEntry =
  | IActionCreateEntryPending
  | IActionCreateEntryRejected
  | IActionCreateEntryFulfilled;

/* Action creators - "entries/editEntry/" */
export enum ActionTypesEditEntry {
  PENDING = "entries/editEntry/pending",
  REJECTED = "entries/editEntry/rejected",
  FULFILLED = "entries/editEntry/fulfilled",
}

export interface IActionEditEntryPending {
  type: typeof ActionTypesEditEntry.PENDING;
}

export interface IActionEditEntryRejected {
  type: typeof ActionTypesEditEntry.REJECTED;
  error: string;
}

export interface IActionEditEntryFulfilled {
  type: typeof ActionTypesEditEntry.FULFILLED;
  payload: {
    entry: IEntry;
  };
}

export const editEntryPending = (): IActionEditEntryPending => ({
  type: ActionTypesEditEntry.PENDING,
});

export const editEntryRejected = (error: string): IActionEditEntryRejected => ({
  type: ActionTypesEditEntry.REJECTED,
  error,
});

export const editEntryFulfilled = (entry: IEntry): IActionEditEntryFulfilled => ({
  type: ActionTypesEditEntry.FULFILLED,
  payload: {
    entry,
  },
});

export type ActionEditEntry =
  | IActionEditEntryPending
  | IActionEditEntryRejected
  | IActionEditEntryFulfilled;

/* Action creators - "entries/deleteEntry/" */
export enum ActionTypesDeleteEntry {
  PENDING = "entries/deleteEntry/pending",
  REJECTED = "entries/deleteEntry/rejected",
  FULFILLED = "entries/deleteEntry/fulfilled",
}

export interface IActionDeleteEntryPending {
  type: typeof ActionTypesDeleteEntry.PENDING;
}

export interface IActionDeleteEntryRejected {
  type: typeof ActionTypesDeleteEntry.REJECTED;
  error: string;
}

export interface IActionDeleteEntryFulfilled {
  type: typeof ActionTypesDeleteEntry.FULFILLED;
  payload: {
    entryId: number;
  };
}

export const deleteEntryPending = (): IActionDeleteEntryPending => ({
  type: ActionTypesDeleteEntry.PENDING,
});

export const deleteEntryRejected = (error: string): IActionDeleteEntryRejected => ({
  type: ActionTypesDeleteEntry.REJECTED,
  error,
});

export const deleteEntryFulfilled = (entryId: number): IActionDeleteEntryFulfilled => ({
  type: ActionTypesDeleteEntry.FULFILLED,
  payload: {
    entryId,
  },
});

export type ActionDeleteEntry =
  | IActionDeleteEntryPending
  | IActionDeleteEntryRejected
  | IActionDeleteEntryFulfilled;

/* Action creators - "entries/clearEntriesSlice" */
export const ACTION_TYPE_CLEAR_ENTRIES_SLICE = "entries/clearEntriesSlice";

export interface IActionClearEntriesSlice {
  type: typeof ACTION_TYPE_CLEAR_ENTRIES_SLICE;
}

export const clearEntriesSlice = (): IActionClearEntriesSlice => ({
  type: ACTION_TYPE_CLEAR_ENTRIES_SLICE,
});

/* Reducer. */
export const entriesReducer = (
  stateEntries: IStateEntries = INITIAL_STATE_ENTRIES,
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
      /*
      You might wonder why this case computes the new state
      by mixing `stateEntries` with `INITIAL_STATE_ENTRIES`.
      Strictly speaking, doing that alone isn't a reasonable way of updating the state.

      However, due to the pagination of Entry resources,
      a reasonable way of updating the state (i.e. of computing the new state using only
      `stateEntries`) would require a rather intricate implementation.

      Instead, it's possible to make do with this simple-but-unreasonable
      implementation - as long as we ensure that,
      after every time when the frontend dispatches this action,
      it will also dispatch the `fetchEntries` thunk-action.
      */
      const newMeta: IPaginationMeta = {
        ...INITIAL_STATE_ENTRIES._meta,
        totalItems:
          stateEntries._meta.totalItems !== null
            ? stateEntries._meta.totalItems + 1
            : null,
      };

      const newLinks: IPaginationLinks = {
        ...INITIAL_STATE_ENTRIES._links,
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

/* Thunk-action creators. */
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

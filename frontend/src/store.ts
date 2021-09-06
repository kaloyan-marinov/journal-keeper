import { combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { createStore } from "redux";

import { Dispatch } from "redux";
import { v4 as uuidv4 } from "uuid";

import { IState } from "./types";
import { JOURNAL_APP_TOKEN } from "./constants";
import {
  alertsCreate,
  IActionAlertsCreate,
  alertsReducer,
} from "./features/alerts/alertsSlice";
import {
  clearAuthSlice,
  IActionClearAuthSlice,
  authReducer,
} from "./features/auth/authSlice";
import {
  clearEntriesSlice,
  IActionClearEntriesSlice,
  entriesReducer,
} from "./features/entries/entriesSlice";

/* "authSlice + entriesSlice + alertsSlice" thunk-action creator */
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

export const initialState: IState = store.getState();

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

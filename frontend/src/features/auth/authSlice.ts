import { IProfile, IState, IStateAuth, RequestStatus } from "../../types";
import { initialStateAuth, JOURNAL_APP_TOKEN } from "../../constants";

import { ThunkAction } from "redux-thunk";
import { Dispatch } from "redux";
import axios from "axios";

/* Action creators - "auth/createUser/" */
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

/* Action creators - "auth/issueJWSToken/" */
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

/* Action creators - "auth/fetchProfile/" */
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

/* Action creators - "auth/clearAuthSlice" */
const ACTION_TYPE_CLEAR_AUTH_SLICE = "auth/clearAuthSlice";

export interface IActionClearAuthSlice {
  type: typeof ACTION_TYPE_CLEAR_AUTH_SLICE;
}

export const clearAuthSlice = (): IActionClearAuthSlice => ({
  type: ACTION_TYPE_CLEAR_AUTH_SLICE,
});

/* Reducer. */
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

/* Thunk-action creators. */
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

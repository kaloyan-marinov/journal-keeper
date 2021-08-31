import { IStateAlerts, IStateAuth, IStateEntries, RequestStatus } from "./types";

export const initialStateAlerts: IStateAlerts = {
  ids: [],
  entities: {},
};

export const JOURNAL_APP_TOKEN = "token-4-journal-app";

export const initialStateAuth: IStateAuth = {
  requestStatus: RequestStatus.IDLE,
  requestError: null,
  token: localStorage.getItem(JOURNAL_APP_TOKEN),
  hasValidToken: null,
  signedInUserProfile: null,
};

export const initialStateEntries: IStateEntries = {
  requestStatus: RequestStatus.IDLE,
  requestError: null,
  _meta: {
    totalItems: null,
    perPage: null,
    totalPages: null,
    page: null,
  },
  _links: {
    self: null,
    next: null,
    prev: null,
    first: null,
    last: null,
  },
  ids: [],
  entities: {},
};

export const URL_FOR_FIRST_PAGE_OF_EXAMPLES = "/api/entries";

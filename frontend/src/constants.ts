import { IStateAlerts, IStateAuth, IStateEntries, RequestStatus } from "./types";

export const INITIAL_STATE_ALERTS: IStateAlerts = {
  ids: [],
  entities: {},
};

export const JOURNAL_APP_TOKEN = "token-4-journal-app";

export const INITIAL_STATE_AUTH: IStateAuth = {
  requestStatus: RequestStatus.IDLE,
  requestError: null,
  token: localStorage.getItem(JOURNAL_APP_TOKEN),
  hasValidToken: null,
  signedInUserProfile: null,
};

export const INITIAL_STATE_ENTRIES: IStateEntries = {
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

export const PER_PAGE_DEFAULT: number = 10;

export const PAGE_DEFAULT: number = 1;

export const URL_FOR_FIRST_PAGE_OF_ENTRIES = "/api/entries";

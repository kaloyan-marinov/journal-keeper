export interface IAlert {
  id: string;
  message: string;
}

export interface IStateAlerts {
  ids: string[];
  entities: {
    [alertId: string]: IAlert;
  };
}

export enum RequestStatus {
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

export interface IStateAuth {
  requestStatus: RequestStatus;
  requestError: string | null;
  token: string | null;
  hasValidToken: boolean | null;
  signedInUserProfile: IProfile | null;
}

export interface IEntry {
  id: number;
  timestampInUTC: string;
  utcZoneOfTimestamp: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface IPaginationMeta {
  totalItems: number | null;
  perPage: number | null;
  totalPages: number | null;
  page: number | null;
}

export interface IPaginationLinks {
  self: string | null;
  next: string | null;
  prev: string | null;
  first: string | null;
  last: string | null;
}

export interface IEntriesEntities {
  [entryId: string]: IEntry;
}

export interface IStateEntries {
  requestStatus: RequestStatus;
  requestError: string | null;
  _meta: IPaginationMeta;
  _links: IPaginationLinks;
  ids: number[];
  entities: IEntriesEntities;
}

/*
Specify all slices of the Redux state.
*/
export interface IState {
  alerts: IStateAlerts;
  auth: IStateAuth;
  entries: IStateEntries;
}

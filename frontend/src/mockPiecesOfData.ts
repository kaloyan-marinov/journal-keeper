import moment from "moment";

import {
  IAlert,
  IEntry,
  IEntriesEntities,
  IPaginationLinks,
  IPaginationMeta,
} from "./types";

import { extractEntities, extractIds } from "./utilities";
import { PER_PAGE_DEFAULT } from "./constants";

export const MOCK_ALERT_17: IAlert = {
  id: "id-17",
  message: "the-undertaken-action-is-illegitimate",
};

export const MOCK_ALERT_34: IAlert = {
  id: "id-34",
  message: "once-again-the-undertaken-action-is-illegitimate",
};

export const MOCK_ALERTS_IDS: string[] = [MOCK_ALERT_17.id, MOCK_ALERT_34.id];

export const MOCK_ALERTS_ENTITIES: { [alertId: string]: IAlert } = {
  [MOCK_ALERT_17.id]: MOCK_ALERT_17,
  [MOCK_ALERT_34.id]: MOCK_ALERT_34,
};

export const MOCK_USER_1 = {
  id: 1,
  username: "mocked-jd",
};

export const MOCK_PROFILE_1 = {
  id: MOCK_USER_1.id,
  username: MOCK_USER_1.username,
  name: "mocked-John Doe",
  email: "mocked-john.doe@protonmail.com",
  createdAt: "mocked-2021-05-23T11:10:17.000Z",
  updatedAt: "mocked-2021-05-23T11:10:34.000Z",
};

export const MOCK_ENTRIES: IEntry[] = Array.from({ length: 50 }).map((_, index) => {
  const minute = (index + 1).toString().padStart(2, "0");

  return {
    id: 10 * (index + 1),
    timestampInUTC: `2021-09-01T06:${minute}:00.000Z`,
    utcZoneOfTimestamp: "+02:00",
    content: `mocked-content-of-entry-${minute}`,
    createdAt: `2021-09-01T07:00:00.000Z`,
    updatedAt: `2021-09-01T07:00:00.000Z`,
    userId: 1,
  };
});

export const MOCK_ENTRIES_IDS: number[] = extractIds(MOCK_ENTRIES);

export const MOCK_ENTRIES_ENTITIES: IEntriesEntities = extractEntities(MOCK_ENTRIES);

export const MOCK_ID_FOR_NEW_ENTRY: number = 666;

export const MOCK_ENTRY_10: IEntry = MOCK_ENTRIES_ENTITIES[10];

export const MOCK_ENTRY_20: IEntry = MOCK_ENTRIES_ENTITIES[20];

export const MOCK_ENTRY_10_LOCAL_TIME = moment
  .utc(MOCK_ENTRY_10.timestampInUTC)
  .utcOffset(MOCK_ENTRY_10.utcZoneOfTimestamp)
  .format("YYYY-MM-DD HH:mm");

export const MOCK_ENTRY_20_LOCAL_TIME = moment
  .utc(MOCK_ENTRY_20.timestampInUTC)
  .utcOffset(MOCK_ENTRY_20.utcZoneOfTimestamp)
  .format("YYYY-MM-DD HH:mm");

export const MOCK_META: IPaginationMeta = {
  totalItems: MOCK_ENTRIES.length,
  perPage: PER_PAGE_DEFAULT,
  totalPages: Math.ceil(MOCK_ENTRIES.length / PER_PAGE_DEFAULT),
  page: 1,
};

export const MOCK_LINKS: IPaginationLinks = {
  self: "/api/entries?perPage=10&page=1",
  next: "/api/entries?perPage=10&page=2",
  prev: null,
  first: "/api/entries?perPage=10&page=1",
  last: `/api/entries?perPage=10&page=${MOCK_META.totalPages}`,
};

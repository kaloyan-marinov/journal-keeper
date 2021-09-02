import moment from "moment";
import { rest } from "msw";

import { IEntry, IPaginationLinks, IPaginationMeta } from "./types";
import { PER_PAGE_DEFAULT } from "./constants";

export const profileMock = {
  id: 17,
  username: "[mocked] jd",
  name: "[mocked] John Doe",
  email: "[mocked] john.doe@protonmail.com",
  createdAt: "[mocked] 2021-05-23T11:10:17.000Z",
  updatedAt: "[mocked] 2021-05-23T11:10:34.000Z",
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

export const MOCK_ENTRIES_IDS: number[] = MOCK_ENTRIES.map((e: IEntry) => e.id);

export const MOCK_ENTRIES_ENTITIES: { [entryId: string]: IEntry } = MOCK_ENTRIES.reduce(
  (entriesObj: { [entryId: string]: IEntry }, entry: IEntry) => {
    entriesObj[entry.id] = entry;
    return entriesObj;
  },
  {}
);

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

export const mockMultpleFailures = (req, res, ctx) => {
  return res(
    ctx.status(401),
    ctx.json({
      error: "[mocked] authentication required",
    })
  );
};

export const mockFetchEntries = (req, res, ctx) => {
  const totalItems: number = MOCK_ENTRIES.length;
  const perPage: number = PER_PAGE_DEFAULT;
  const totalPages: number = Math.ceil(totalItems / perPage);
  const page: number = parseInt(req.url.searchParams.get("page") || 1);

  const _meta: IPaginationMeta = {
    totalItems,
    perPage,
    totalPages,
    page,
  };

  const _links: IPaginationLinks = {
    self: `/api/entries?perPage=${perPage}&page=${page}`,
    next:
      page >= totalPages ? null : `/api/entries?perPage=${perPage}&page=${page + 1}`,
    prev: page <= 1 ? null : `/api/entries?perPage=${perPage}&page=${page - 1}`,
    first: `/api/entries?perPage=${perPage}&page=1`,
    last: `/api/entries?perPage=${perPage}&page=${totalPages}`,
  };

  const start: number = (page - 1) * perPage;
  const end: number = start + perPage;
  const items: IEntry[] = MOCK_ENTRIES.slice(start, end);

  return res.once(
    ctx.status(200),
    ctx.json({
      _meta,
      _links,
      items,
    })
  );
};

/* Describe what requests should be mocked. */
export const requestHandlersToMock = [
  rest.post("/api/users", (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 17,
        username: "mocked-request-jd",
      })
    );
  }),

  rest.post("/api/tokens", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: "mocked-json-web-signature-token",
      })
    );
  }),

  rest.get("/api/user-profile", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(profileMock));
  }),

  rest.get("/api/entries", mockMultpleFailures),

  rest.post("/api/entries", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(MOCK_ENTRY_10));
  }),

  rest.put("/api/entries/:id", (req, res, ctx) => {
    const { id: entryIdStr } = req.params;
    const entryId: number = parseInt(entryIdStr);

    const editedEntry = entryId !== MOCK_ENTRY_10.id ? MOCK_ENTRY_10 : MOCK_ENTRY_20;

    return res(
      ctx.status(200),
      ctx.json({
        ...editedEntry,
        id: entryId,
      })
    );
  }),

  rest.delete("/api/entries/:id", (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

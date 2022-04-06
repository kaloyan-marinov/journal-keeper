import moment from "moment";
import {
  DefaultRequestBody,
  RequestParams,
  ResponseComposition,
  RestContext,
  RestRequest,
} from "msw";

import { IAlert, IEntry, IPaginationLinks, IPaginationMeta } from "./types";
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

export let MOCK_ENTRIES: IEntry[] = Array.from({ length: 50 }).map((_, index) => {
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

/* Mock handlers for HTTP requests. */
const mockMultipleFailures = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition<any>,
  ctx: RestContext
) => {
  return res(
    ctx.status(401),
    ctx.json({
      error: "mocked-authentication required",
    })
  );
};

const mockCreateUser = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition<any>,
  ctx: RestContext
) => {
  return res.once(ctx.status(201), ctx.json(MOCK_USER_1));
};

const mockIssueJWSToken = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition<any>,
  ctx: RestContext
) => {
  return res.once(
    ctx.status(200),
    ctx.json({
      token: "mocked-json-web-signature-token",
    })
  );
};

const mockFetchUserProfile = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition<any>,
  ctx: RestContext
) => {
  return res.once(ctx.status(200), ctx.json(MOCK_PROFILE_1));
};

const mockFetchEntries = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition<any>,
  ctx: RestContext
) => {
  const totalItems: number = MOCK_ENTRIES.length;
  const perPage: number = PER_PAGE_DEFAULT;
  const totalPages: number = Math.ceil(totalItems / perPage);
  const page: number = parseInt(req.url.searchParams.get("page") || "1");

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

const mockCreateEntry = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition<any>,
  ctx: RestContext
) => {
  /*
  Let C denote the commit introducing this line and editing the next code-block.

  Immediately prior to C,
  it was possible to serve the frontend application without errors.

  Then I terminated all processes related to this project,
  restarted my computed,
  and started all processes related to this project afresh;
  it was no longer possible to serve the frontend,
  because TypeScript crashed with errors related to
  what the next code-block used to look like immediately prior to C.

  The changes to the next code-block, which are introduced in C,
  make it possible to to serve the frontend application without errors.

  TODO: determine what type annotations need to be added to `req`
        so as to make it possible to remove
        the explicit(-and-perhaps-mysterious-looking) type conversions
        from the following statements
  */
  const localTime = (req!.body as Record<string, any>).localTime; // ex: "2021-05-13 00:18"
  const timezone = (req!.body as Record<string, any>).timezone; // ex: "-08:00"
  const content = (req!.body as Record<string, any>).content; // ex: "some insightful content"

  // const createdAt: string = new Date().toISOString();
  const createdAt: string = MOCK_ENTRY_10.createdAt;

  const updatedAt: string = MOCK_ENTRY_10.updatedAt;

  // const timestampInUTC = new Date(localTime + "Z" + timezone).toISOString();
  const timestampInUTC = MOCK_ENTRY_10.timestampInUTC;

  const newEntry: IEntry = {
    id: MOCK_ID_FOR_NEW_ENTRY,
    timestampInUTC,
    utcZoneOfTimestamp: timezone,
    content: content,
    createdAt,
    updatedAt,
    userId: 1,
  };

  MOCK_ENTRIES = [...MOCK_ENTRIES, newEntry];

  return res.once(ctx.status(201), ctx.json(newEntry));
};

const mockEditEntry = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition<any>,
  ctx: RestContext
) => {
  const { id: entryIdStr } = req.params;
  const entryId: number = parseInt(entryIdStr);

  // const editedEntry = entryId !== MOCK_ENTRY_10.id ? MOCK_ENTRY_10 : MOCK_ENTRY_20;

  // return res.once(
  //   ctx.status(200),
  //   ctx.json({
  //     ...editedEntry,
  //     id: entryId,
  //   })
  // );

  const editedLocalTime = (req!.body as Record<string, any>).localTime; // ex: "2021-05-13 00:18"
  const editedTimezone = (req!.body as Record<string, any>).timezone; // ex: "-08:00"
  const editedContent = (req!.body as Record<string, any>).content; // ex: "an edited version of some insightful content"

  // Emulate the backend's route-handling function for
  // PUT requests to /api/entries/:id .
  if (
    (editedTimezone !== undefined && editedLocalTime === undefined) ||
    (editedTimezone === undefined && editedLocalTime !== undefined)
  ) {
    return res.once(
      ctx.status(400),
      ctx.json({
        error:
          "Your request body must include" +
          " either both of 'timezone' and 'localTime', or neither one of them",
      })
    );
  } else if (editedTimezone !== undefined && editedLocalTime !== undefined) {
    // Defer implementing any logic in this case,
    // for as long as it is possible to do so.
  }

  if (editedContent !== undefined) {
    MOCK_ENTRIES = MOCK_ENTRIES.map((entry: IEntry) => {
      if (entry.id !== entryId) {
        return entry;
      }

      const editedEntry: IEntry = {
        ...entry,
      };

      editedEntry.content = editedContent;

      return editedEntry;
    });
  }

  const editedEntry = MOCK_ENTRIES.filter((entry: IEntry) => entry.id === entryId)[0];

  return res.once(ctx.status(200), ctx.json(editedEntry));
};

// const mockDeleteEntry = (
//   req: RestRequest<DefaultRequestBody, RequestParams>,
//   res: ResponseComposition<any>,
//   ctx: RestContext
// ) => {
//   const entryId: number = parseInt(req.params.id);

//   MOCK_ENTRIES = MOCK_ENTRIES.filter((entry: IEntry) => entry.id !== entryId);

//   return res.once(ctx.status(204));
// };

export class RequestHandlerBundle {
  mockEntries: IEntry[];

  constructor() {
    const MOCK_ENTRIES_TEMP: IEntry[] = Array.from({ length: 50 }).map((_, index) => {
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

    this.mockEntries = {
      ...MOCK_ENTRIES_TEMP,
    };
  }

  mockDeleteEntry(
    req: RestRequest<DefaultRequestBody, RequestParams>,
    res: ResponseComposition<any>,
    ctx: RestContext
  ) {
    const entryId: number = parseInt(req.params.id);

    MOCK_ENTRIES = MOCK_ENTRIES.filter((entry: IEntry) => entry.id !== entryId);

    return res.once(ctx.status(204));
  }
}

export const requestHandlers = {
  mockMultipleFailures,

  mockCreateUser,
  mockIssueJWSToken,
  mockFetchUserProfile,

  mockCreateEntry,
  mockFetchEntries,
  mockEditEntry,
  // mockDeleteEntry,
};

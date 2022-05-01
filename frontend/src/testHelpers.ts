import moment from "moment";

import {
  DefaultRequestBody,
  RequestParams,
  ResponseComposition,
  RestContext,
  RestRequest,
} from "msw";

import { IEntry, IPaginationLinks, IPaginationMeta } from "./types";
import { PER_PAGE_DEFAULT } from "./constants";
import {
  MOCK_ENTRIES,
  MOCK_ENTRY_10,
  MOCK_ID_FOR_NEW_ENTRY,
  MOCK_PROFILE_1,
  MOCK_USER_1,
} from "./mockPiecesOfData";

/*
Mock handlers for HTTP requests.
Each of these mock handlers is "lone-standing",
i.e. independent of the other ones.
*/
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

export const requestHandlers = {
  mockMultipleFailures,

  mockCreateUser,
  mockIssueJWSToken,
  mockFetchUserProfile,
};

export class RequestHandlingFacilitator {
  /*
  An instance of this class makes it possible
  to create mock handlers for HTTP requests.

  The mock handlers, which are created by a common instance of this class,
  are not "lone-standing";
  rather, such mock handlers depend on one another
  via the (common) state stored within the (class) instance.
  */

  mockEntries: IEntry[];

  constructor() {
    this.mockEntries = [...MOCK_ENTRIES];
  }

  createMockFetchEntries() {
    const mockFetchEntries = (
      req: RestRequest<DefaultRequestBody, RequestParams>,
      res: ResponseComposition<any>,
      ctx: RestContext
    ) => {
      const totalItems: number = this.mockEntries.length;
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
          page >= totalPages
            ? null
            : `/api/entries?perPage=${perPage}&page=${page + 1}`,
        prev: page <= 1 ? null : `/api/entries?perPage=${perPage}&page=${page - 1}`,
        first: `/api/entries?perPage=${perPage}&page=1`,
        last: `/api/entries?perPage=${perPage}&page=${totalPages}`,
      };

      const start: number = (page - 1) * perPage;
      const end: number = start + perPage;
      const items: IEntry[] = this.mockEntries.slice(start, end);

      return res.once(
        ctx.status(200),
        ctx.json({
          _meta,
          _links,
          items,
        })
      );
    };

    return mockFetchEntries;
  }

  createMockCreateEntry() {
    const mockCreateEntry = (
      req: RestRequest<DefaultRequestBody, RequestParams>,
      res: ResponseComposition<any>,
      ctx: RestContext
    ) => {
      const localTime = (req!.body as Record<string, any>).localTime;
      const timezone = (req!.body as Record<string, any>).timezone;
      const content = (req!.body as Record<string, any>).content;

      const createdAt: string = MOCK_ENTRY_10.createdAt;
      const updatedAt: string = MOCK_ENTRY_10.updatedAt;
      const timestampInUTC =
        moment(localTime + " " + timezone)
          .utc()
          .format("YYYY-MM-DD" + "T" + "HH:mm:ss.SSS") + "Z";

      const newEntry: IEntry = {
        id: MOCK_ID_FOR_NEW_ENTRY,
        timestampInUTC,
        utcZoneOfTimestamp: timezone,
        content: content,
        createdAt,
        updatedAt,
        userId: 1,
      };

      this.mockEntries = [...this.mockEntries, newEntry];

      return res.once(ctx.status(201), ctx.json(newEntry));
    };

    return mockCreateEntry;
  }

  createMockEditEntry() {
    const mockEditEntry = (
      req: RestRequest<DefaultRequestBody, RequestParams>,
      res: ResponseComposition<any>,
      ctx: RestContext
    ) => {
      const { id: entryIdStr } = req.params;
      const entryId: number = parseInt(entryIdStr);

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
        this.mockEntries = this.mockEntries.map((entry: IEntry) => {
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

      const editedEntry = this.mockEntries.filter(
        (entry: IEntry) => entry.id === entryId
      )[0];

      return res.once(ctx.status(200), ctx.json(editedEntry));
    };

    return mockEditEntry;
  }

  createMockDeleteEntry() {
    const mockDeleteEntry = (
      req: RestRequest<DefaultRequestBody, RequestParams>,
      res: ResponseComposition<any>,
      ctx: RestContext
    ) => {
      const entryId: number = parseInt(req.params.id);

      this.mockEntries = this.mockEntries.filter(
        (entry: IEntry) => entry.id !== entryId
      );

      return res.once(ctx.status(204));
    };

    return mockDeleteEntry;
  }
}

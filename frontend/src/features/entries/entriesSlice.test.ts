import {
  IEntry,
  IPaginationLinks,
  IPaginationMeta,
  IStateEntries,
  RequestStatus,
} from "../../types";
import { INITIAL_STATE_ENTRIES } from "../../constants";
import {
  MOCK_ENTRIES_ENTITIES,
  MOCK_ENTRIES_IDS,
  MOCK_ENTRY_10,
  MOCK_ENTRY_20,
  MOCK_ID_FOR_NEW_ENTRY,
} from "../../mockPiecesOfData";
import {
  ActionTypesCreateEntry,
  ActionTypesDeleteEntry,
  ActionTypesEditEntry,
  ActionTypesFetchEntries,
  ACTION_TYPE_CLEAR_ENTRIES_SLICE,
  clearEntriesSlice,
  createEntryFulfilled,
  createEntryPending,
  createEntryRejected,
  deleteEntryFulfilled,
  deleteEntryPending,
  deleteEntryRejected,
  editEntryFulfilled,
  editEntryPending,
  editEntryRejected,
  entriesReducer,
  fetchEntriesFulfilled,
  fetchEntriesPending,
  fetchEntriesRejected,
  IActionClearEntriesSlice,
  IActionCreateEntryFulfilled,
  IActionCreateEntryPending,
  IActionCreateEntryRejected,
  IActionDeleteEntryFulfilled,
  IActionDeleteEntryPending,
  IActionDeleteEntryRejected,
  IActionEditEntryFulfilled,
  IActionEditEntryPending,
  IActionEditEntryRejected,
  IActionFetchEntriesFulfilled,
  IActionFetchEntriesPending,
  IActionFetchEntriesRejected,
} from "./entriesSlice";

import { setupServer, SetupServerApi } from "msw/node";
import { MockStoreEnhanced } from "redux-mock-store";
import configureMockStore from "redux-mock-store";
import thunkMiddleware from "redux-thunk";
import { DefaultRequestBody, MockedRequest, rest, RestHandler } from "msw";
import { IState } from "../../types";
import { URL_FOR_FIRST_PAGE_OF_ENTRIES, PER_PAGE_DEFAULT } from "../../constants";
import { RequestHandlingFacilitator, requestHandlers } from "../../testHelpers";
import {
  MOCK_META,
  MOCK_LINKS,
  MOCK_ENTRIES,
  MOCK_ENTRY_20_LOCAL_TIME,
} from "../../mockPiecesOfData";
import { INITIAL_STATE } from "../../store";
import { createEntry, editEntry, deleteEntry, fetchEntries } from "./entriesSlice";

describe("action creators", () => {
  test("fetchEntriesPending", () => {
    const action = fetchEntriesPending();

    expect(action).toEqual({
      type: "entries/fetchEntries/pending",
    });
  });

  test("fetchEntriesRejected", () => {
    const action = fetchEntriesRejected("entries-fetchEntries-rejected");

    expect(action).toEqual({
      type: "entries/fetchEntries/rejected",
      error: "entries-fetchEntries-rejected",
    });
  });

  test("fetchEntriesFulfilled", () => {
    const _meta: IPaginationMeta = {
      totalItems: 2,
      perPage: 10,
      totalPages: 1,
      page: 1,
    };
    const _links: IPaginationLinks = {
      self: "localhost:5000/api/entries?perPage=10&page=1",
      next: null,
      prev: null,
      first: "localhost:5000/api/entries?perPage=10&page=1",
      last: "localhost:5000/api/entries?perPage=10&page=1",
    };
    const items: IEntry[] = [
      {
        id: 1,
        timestampInUTC: "2020-12-01T15:17:00.000Z",
        utcZoneOfTimestamp: "+02:00",
        content:
          "[hard-coded-into-test] Then it dawned on me: there is no finish line!",
        createdAt: "2021-04-29T05:10:56.000Z",
        updatedAt: "2021-04-29T05:10:56.000Z",
        userId: 1,
      },
      {
        id: 2,
        timestampInUTC: "2019-08-20T13:17:00.000Z",
        utcZoneOfTimestamp: "+01:00",
        content: "[hard-coded-into-test] Mallorca has beautiful sunny beaches!",
        createdAt: "2021-04-29T05:11:01.000Z",
        updatedAt: "2021-04-29T05:11:01.000Z",
        userId: 1,
      },
    ];

    const action = fetchEntriesFulfilled(_meta, _links, items);

    expect(action).toEqual({
      type: "entries/fetchEntries/fulfilled",
      payload: {
        _meta,
        _links,
        entries: items,
      },
    });
  });

  test("createEntryPending", () => {
    const action = createEntryPending();

    expect(action).toEqual({
      type: "entries/createEntry/pending",
    });
  });

  test("createEntryRejected", () => {
    const action = createEntryRejected("entries-createEntry-rejected");

    expect(action).toEqual({
      type: "entries/createEntry/rejected",
      error: "entries-createEntry-rejected",
    });
  });

  test("createEntryFulfilled", () => {
    const entry = {
      id: 1,
      timestampInUTC: "2020-12-01T15:17:00.000Z",
      utcZoneOfTimestamp: "+02:00",
      content: "[hard-coded-into-test] Then it dawned on me: there is no finish line!",
      createdAt: "2021-04-29T05:10:56.000Z",
      updatedAt: "2021-04-29T05:10:56.000Z",
      userId: 1,
    };

    const action = createEntryFulfilled(entry);

    expect(action).toEqual({
      type: "entries/createEntry/fulfilled",
      payload: {
        entry,
      },
    });
  });

  test("editEntryPending", () => {
    const action = editEntryPending();

    expect(action).toEqual({
      type: "entries/editEntry/pending",
    });
  });

  test("editEntryRejected", () => {
    const action = editEntryRejected("entries-editEntry-rejected");

    expect(action).toEqual({
      type: "entries/editEntry/rejected",
      error: "entries-editEntry-rejected",
    });
  });

  test("editEntryFulfilled", () => {
    const entry = {
      id: 1,
      timestampInUTC: "2020-12-01T15:17:00.000Z",
      utcZoneOfTimestamp: "+02:00",
      content: "[hard-coded-into-test] Then it dawned on me: there is no finish line!",
      createdAt: "2021-04-29T05:10:56.000Z",
      updatedAt: "2021-04-29T05:10:56.000Z",
      userId: 1,
    };

    const action = editEntryFulfilled(entry);

    expect(action).toEqual({
      type: "entries/editEntry/fulfilled",
      payload: {
        entry,
      },
    });
  });

  test("deleteEntryPending", () => {
    const action = deleteEntryPending();

    expect(action).toEqual({
      type: "entries/deleteEntry/pending",
    });
  });

  test("deleteEntryRejected", () => {
    const action = deleteEntryRejected("entries-deleteEntry-rejected");

    expect(action).toEqual({
      type: "entries/deleteEntry/rejected",
      error: "entries-deleteEntry-rejected",
    });
  });

  test("deleteEntryFulfilled", () => {
    const action = deleteEntryFulfilled(17);

    expect(action).toEqual({
      type: "entries/deleteEntry/fulfilled",
      payload: {
        entryId: 17,
      },
    });
  });

  test("clearEntriesSlice", () => {
    const action = clearEntriesSlice();

    expect(action).toEqual({
      type: "entries/clearEntriesSlice",
    });
  });
});

describe("reducer", () => {
  let initStateEntries: IStateEntries;

  beforeEach(() => {
    initStateEntries = { ...INITIAL_STATE_ENTRIES };
  });

  test("entries/fetchEntries/pending", () => {
    const action: IActionFetchEntriesPending = {
      type: ActionTypesFetchEntries.PENDING,
    };

    const newStateEntries = entriesReducer(initStateEntries, action);

    expect(newStateEntries).toEqual({
      requestStatus: "loading",
      requestError: null,
      _meta: { ...INITIAL_STATE_ENTRIES._meta },
      _links: { ...INITIAL_STATE_ENTRIES._links },
      ids: [],
      entities: {},
    });
  });

  test("entries/fetchEntries/rejected", () => {
    const action: IActionFetchEntriesRejected = {
      type: ActionTypesFetchEntries.REJECTED,
      error: "entries-fetchEntries-rejected",
    };

    const newStateEntries = entriesReducer(initStateEntries, action);

    expect(newStateEntries).toEqual({
      requestStatus: "failed",
      requestError: "entries-fetchEntries-rejected",
      _meta: { ...INITIAL_STATE_ENTRIES._meta },
      _links: { ...INITIAL_STATE_ENTRIES._links },
      ids: [],
      entities: {},
    });
  });

  test("entries/fetchEntries/fulfilled", () => {
    const entries: IEntry[] = [MOCK_ENTRY_10, MOCK_ENTRY_20];
    const _meta: IPaginationMeta = {
      totalItems: entries.length,
      perPage: PER_PAGE_DEFAULT,
      totalPages: Math.ceil(entries.length / PER_PAGE_DEFAULT),
      page: 1,
    };
    const _links: IPaginationLinks = {
      self: "/api/entries?perPage=10&page=1",
      next: null,
      prev: null,
      first: "/api/entries?perPage=10&page=1",
      last: `/api/entries?perPage=10&page=1`,
    };
    const action: IActionFetchEntriesFulfilled = {
      type: ActionTypesFetchEntries.FULFILLED,
      payload: {
        _meta,
        _links,
        entries,
      },
    };

    const newStateEntries = entriesReducer(initStateEntries, action);

    expect(newStateEntries).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      _meta,
      _links,
      ids: [MOCK_ENTRY_10.id, MOCK_ENTRY_20.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
        [MOCK_ENTRY_20.id]: MOCK_ENTRY_20,
      },
    });
  });

  test("entries/createEntry/pending", () => {
    const action: IActionCreateEntryPending = {
      type: ActionTypesCreateEntry.PENDING,
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "loading",
      requestError: null,
      _meta: { ...INITIAL_STATE_ENTRIES._meta },
      _links: { ...INITIAL_STATE_ENTRIES._links },
      ids: [],
      entities: {},
    });
  });

  test("entries/createEntry/rejected", () => {
    initStateEntries = {
      ...INITIAL_STATE_ENTRIES,
      requestStatus: RequestStatus.LOADING,
    };
    const action: IActionCreateEntryRejected = {
      type: ActionTypesCreateEntry.REJECTED,
      error: "entries-createEntry-rejected",
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "failed",
      requestError: "entries-createEntry-rejected",
      _meta: { ...INITIAL_STATE_ENTRIES._meta },
      _links: { ...INITIAL_STATE_ENTRIES._links },
      ids: [],
      entities: {},
    });
  });

  test("entries/createEntry/fulfilled", () => {
    initStateEntries = {
      ...INITIAL_STATE_ENTRIES,
      requestStatus: RequestStatus.LOADING,
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    };
    const action: IActionCreateEntryFulfilled = {
      type: ActionTypesCreateEntry.FULFILLED,
      payload: {
        entry: MOCK_ENTRY_20,
      },
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      _meta: { ...INITIAL_STATE_ENTRIES._meta },
      _links: { ...INITIAL_STATE_ENTRIES._links },
      ids: [MOCK_ENTRY_10.id, MOCK_ENTRY_20.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
        [MOCK_ENTRY_20.id]: MOCK_ENTRY_20,
      },
    });
  });

  test("entries/editEntry/pending", () => {
    const action: IActionEditEntryPending = {
      type: ActionTypesEditEntry.PENDING,
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "loading",
      requestError: null,
      _meta: { ...INITIAL_STATE_ENTRIES._meta },
      _links: { ...INITIAL_STATE_ENTRIES._links },
      ids: [],
      entities: {},
    });
  });

  test("entries/editEntry/rejected", () => {
    const action: IActionEditEntryRejected = {
      type: ActionTypesEditEntry.REJECTED,
      error: "entries-editEntry-rejected",
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "failed",
      requestError: "entries-editEntry-rejected",
      _meta: { ...INITIAL_STATE_ENTRIES._meta },
      _links: { ...INITIAL_STATE_ENTRIES._links },
      ids: [],
      entities: {},
    });
  });

  test("entries/editEntry/fulfilled", () => {
    initStateEntries = {
      ...INITIAL_STATE_ENTRIES,
      requestStatus: RequestStatus.LOADING,
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    };
    const action: IActionEditEntryFulfilled = {
      type: ActionTypesEditEntry.FULFILLED,
      payload: {
        entry: {
          ...MOCK_ENTRY_20,
          id: MOCK_ENTRY_10.id,
        },
      },
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      _meta: { ...INITIAL_STATE_ENTRIES._meta },
      _links: { ...INITIAL_STATE_ENTRIES._links },
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: {
          ...MOCK_ENTRY_20,
          id: MOCK_ENTRY_10.id,
        },
      },
    });
  });

  test("entries/deleteEntry/pending", () => {
    initStateEntries = {
      ...INITIAL_STATE_ENTRIES,
      requestStatus: RequestStatus.SUCCEEDED,
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    };
    const action: IActionDeleteEntryPending = {
      type: ActionTypesDeleteEntry.PENDING,
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "loading",
      requestError: null,
      _meta: { ...INITIAL_STATE_ENTRIES._meta },
      _links: { ...INITIAL_STATE_ENTRIES._links },
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    });
  });

  test("entries/deleteEntry/rejected", () => {
    initStateEntries = {
      ...INITIAL_STATE_ENTRIES,
      requestStatus: RequestStatus.SUCCEEDED,
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    };
    const action: IActionDeleteEntryRejected = {
      type: ActionTypesDeleteEntry.REJECTED,
      error: "entries-deleteEntry-rejected",
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "failed",
      requestError: "entries-deleteEntry-rejected",
      _meta: { ...INITIAL_STATE_ENTRIES._meta },
      _links: { ...INITIAL_STATE_ENTRIES._links },
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    });
  });

  test("entries/deleteEntry/fulfilled", () => {
    initStateEntries = {
      ...INITIAL_STATE_ENTRIES,
      requestStatus: RequestStatus.LOADING,
      ids: [MOCK_ENTRY_10.id, MOCK_ENTRY_20.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
        [MOCK_ENTRY_20.id]: MOCK_ENTRY_20,
      },
    };
    const action: IActionDeleteEntryFulfilled = {
      type: ActionTypesDeleteEntry.FULFILLED,
      payload: {
        entryId: MOCK_ENTRY_20.id,
      },
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      _meta: { ...INITIAL_STATE_ENTRIES._meta },
      _links: { ...INITIAL_STATE_ENTRIES._links },
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    });
  });

  test("entries/clearEntriesSlice", () => {
    initStateEntries = {
      ...INITIAL_STATE_ENTRIES,
      requestStatus: RequestStatus.SUCCEEDED,
      ids: MOCK_ENTRIES_IDS,
      entities: MOCK_ENTRIES_ENTITIES,
    };
    const action: IActionClearEntriesSlice = {
      type: ACTION_TYPE_CLEAR_ENTRIES_SLICE,
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      _meta: { ...INITIAL_STATE_ENTRIES._meta },
      _links: { ...INITIAL_STATE_ENTRIES._links },
      ids: [],
      entities: {},
    });
  });

  test(
    "an action, which this reducer doesn't specifically handle," +
      " should not modify its associated state (slice)",
    () => {
      const entries: IEntry[] = [MOCK_ENTRY_10, MOCK_ENTRY_20];
      const _meta: IPaginationMeta = {
        totalItems: entries.length,
        perPage: PER_PAGE_DEFAULT,
        totalPages: Math.ceil(entries.length / PER_PAGE_DEFAULT),
        page: 1,
      };
      const _links: IPaginationLinks = {
        self: "/api/entries?perPage=10&page=1",
        next: null,
        prev: null,
        first: "/api/entries?perPage=10&page=1",
        last: `/api/entries?perPage=10&page=1`,
      };
      const initStEntries = {
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        _meta,
        _links,
        ids: [MOCK_ENTRY_10.id, MOCK_ENTRY_20.id],
        entities: {
          [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
          [MOCK_ENTRY_20.id]: MOCK_ENTRY_20,
        },
      };
      const action: any = {
        type: "an action, which this reducer doesn't specifically handle",
      };

      const newStEntries = entriesReducer(initStEntries, action);

      expect(newStEntries).toEqual(initStEntries);
    }
  );
});

/* Create an MSW "request-interception layer". */
const restHandlers: RestHandler<MockedRequest<DefaultRequestBody>>[] = [
  rest.get("/api/entries", requestHandlers.mockMultipleFailures),
  rest.post("/api/entries", requestHandlers.mockMultipleFailures),
  rest.put("/api/entries/:id", requestHandlers.mockMultipleFailures),
  rest.delete("/api/entries/:id", requestHandlers.mockMultipleFailures),
];

const requestInterceptionLayer: SetupServerApi = setupServer(...restHandlers);

const createStoreMock = configureMockStore([thunkMiddleware]);

describe(
  "dispatching of async thunk-actions," +
    " with each test case focusing on the action-related logic only" +
    " (and thus completely disregarding the reducer-related logic) ",
  () => {
    let initSt: IState;
    let storeMock: MockStoreEnhanced<unknown, {}>;

    beforeAll(() => {
      // Establish the created request-interception layer
      // (= Enable API mocking).
      requestInterceptionLayer.listen();
    });

    beforeEach(() => {
      initSt = {
        ...INITIAL_STATE,
      };
      storeMock = createStoreMock(initSt);
    });

    afterEach(() => {
      // Remove any request handlers that may have been added at runtime
      // (by individual tests after the initial `setupServer` call).
      requestInterceptionLayer.resetHandlers();
    });

    afterAll(() => {
      // Prevent the established request-interception layer
      // from affecting irrelevant tests
      // by tearing down that layer
      // (= by stopping request interception)
      // (= disabling API mocking).
      requestInterceptionLayer.close();
    });

    test(
      "fetchEntries()" +
        " + the HTTP request issued by that thunk-action is mocked to fail",
      async () => {
        // Act.
        const fetchEntriesPromise = storeMock.dispatch(
          fetchEntries(URL_FOR_FIRST_PAGE_OF_ENTRIES)
        );

        // Assert.
        await expect(fetchEntriesPromise).rejects.toEqual(
          new Error("Request failed with status code 401")
        );
        expect(storeMock.getActions()).toEqual([
          {
            type: "entries/fetchEntries/pending",
          },
          {
            type: "entries/fetchEntries/rejected",
            error: "mocked-authentication required",
          },
        ]);
      }
    );

    test(
      "fetchEntries()" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        // Arrange.
        const rhf: RequestHandlingFacilitator = new RequestHandlingFacilitator();
        requestInterceptionLayer.use(
          rest.get("/api/entries", rhf.createMockFetchEntries())
        );

        // Act.
        const fetchEntriesPromise = storeMock.dispatch(
          fetchEntries(URL_FOR_FIRST_PAGE_OF_ENTRIES)
        );

        // Assert.
        await expect(fetchEntriesPromise).resolves.toEqual(undefined);
        expect(storeMock.getActions()).toEqual([
          {
            type: "entries/fetchEntries/pending",
          },
          {
            type: "entries/fetchEntries/fulfilled",
            payload: {
              _meta: MOCK_META,
              _links: MOCK_LINKS,
              entries: MOCK_ENTRIES.slice(0, PER_PAGE_DEFAULT),
            },
          },
        ]);
      }
    );

    test(
      "createEntry(localTime, ...)" +
        " + the HTTP request issued by that thunk-action is mocked to fail",
      async () => {
        // Arrange.
        requestInterceptionLayer.use(
          rest.post("/api/entries", (req, res, ctx) => {
            return res.once(
              ctx.status(400),
              ctx.json({
                error: "mocked-Failed to create a new Entry resource",
              })
            );
          })
        );

        // Act.
        const createEntryPromise = storeMock.dispatch(
          createEntry("bad-localTime", MOCK_ENTRY_10.timezone, MOCK_ENTRY_10.content)
        );

        // Assert.
        await expect(createEntryPromise).rejects.toEqual(
          new Error("Request failed with status code 400")
        );
        expect(storeMock.getActions()).toEqual([
          {
            type: "entries/createEntry/pending",
          },
          {
            type: "entries/createEntry/rejected",
            error: "mocked-Failed to create a new Entry resource",
          },
        ]);
      }
    );

    test(
      "createEntry(localTime, ...)" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        // Arrange.
        const rhf: RequestHandlingFacilitator = new RequestHandlingFacilitator();
        requestInterceptionLayer.use(
          rest.post("/api/entries", rhf.createMockCreateEntry())
        );

        const localTime = "2021-09-01 04:01";
        const utcZoneOfTimestamp = "+03:00";
        const content = "Explicit is better than implicit.";

        // Act.
        const createEntryPromise = storeMock.dispatch(
          createEntry(localTime, utcZoneOfTimestamp, content)
        );

        // Assert.
        await expect(createEntryPromise).resolves.toEqual(undefined);
        expect(storeMock.getActions()).toEqual([
          {
            type: "entries/createEntry/pending",
          },
          {
            type: "entries/createEntry/fulfilled",
            payload: {
              entry: {
                id: MOCK_ID_FOR_NEW_ENTRY,
                timestampInUTC: "2021-09-01T01:01:00.000Z",
                utcZoneOfTimestamp,
                content,
                createdAt: MOCK_ENTRY_10.createdAt,
                updatedAt: MOCK_ENTRY_10.updatedAt,
                userId: 1,
              },
            },
          },
        ]);
      }
    );

    test(
      "editEntry(entryId, ...)" +
        " + the HTTP request issued by that thunk-action is mocked to fail",
      async () => {
        // Arrange.
        requestInterceptionLayer.use(
          rest.put("/api/entries/:id", (req, res, ctx) => {
            return res.once(
              ctx.status(400),
              ctx.json({
                error: "[mocked response] Failed to edit the targeted Entry resource",
              })
            );
          })
        );

        const targetedEntryId: number = 1;

        // Act.
        const editEntryPromise = storeMock.dispatch(
          editEntry(
            targetedEntryId,
            MOCK_ENTRY_20_LOCAL_TIME,
            MOCK_ENTRY_20.utcZoneOfTimestamp,
            MOCK_ENTRY_20.content
          )
        );

        // Assert.
        await expect(editEntryPromise).rejects.toEqual(
          new Error("Request failed with status code 400")
        );

        expect(storeMock.getActions()).toEqual([
          {
            type: "entries/editEntry/pending",
          },
          {
            type: "entries/editEntry/rejected",
            error: "[mocked response] Failed to edit the targeted Entry resource",
          },
        ]);
      }
    );

    test(
      "editEntry(entryId, ...)" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        // Arrange.
        const rhf: RequestHandlingFacilitator = new RequestHandlingFacilitator();
        requestInterceptionLayer.use(
          rest.put("/api/entries/:id", rhf.createMockEditEntry())
        );

        const targetedEntryId: number = MOCK_ENTRY_10.id;

        const newContent: string =
          "this content was edited at the following time: 2022-04-03, 21:27";

        // Act.
        const editEntryPromise = storeMock.dispatch(
          editEntry(targetedEntryId, undefined, undefined, newContent)
        );

        // Assert.
        await expect(editEntryPromise).resolves.toEqual(undefined);

        expect(storeMock.getActions()).toEqual([
          {
            type: "entries/editEntry/pending",
          },
          {
            type: "entries/editEntry/fulfilled",
            payload: {
              entry: {
                ...MOCK_ENTRY_10,
                content: newContent,
              },
            },
          },
        ]);
      }
    );

    test(
      "deleteEntry(entryId)" +
        " + the HTTP request issued by that thunk-action is mocked to fail",
      async () => {
        // Arrange.
        const targetedEntryId: number = MOCK_ENTRY_10.id;

        // Act.
        const deleteEntryPromise = storeMock.dispatch(deleteEntry(targetedEntryId));

        // Assert.
        await expect(deleteEntryPromise).rejects.toEqual(
          new Error("Request failed with status code 401")
        );

        expect(storeMock.getActions()).toEqual([
          {
            type: "entries/deleteEntry/pending",
          },
          {
            type: "entries/deleteEntry/rejected",
            error: "mocked-authentication required",
          },
        ]);
      }
    );

    test(
      "deleteEntry(entryId)" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        // Arrange.
        const rhf: RequestHandlingFacilitator = new RequestHandlingFacilitator();
        requestInterceptionLayer.use(
          rest.delete("/api/entries/:id", rhf.createMockDeleteEntry())
        );

        const targetedEntryId: number = MOCK_ENTRY_10.id;

        // Act.
        const deleteEntryPromise = storeMock.dispatch(deleteEntry(targetedEntryId));

        // Assert.
        await expect(deleteEntryPromise).resolves.toEqual(undefined);

        expect(storeMock.getActions()).toEqual([
          {
            type: "entries/deleteEntry/pending",
          },
          {
            type: "entries/deleteEntry/fulfilled",
            payload: {
              entryId: targetedEntryId,
            },
          },
        ]);
      }
    );
  }
);

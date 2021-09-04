import {
  IEntry,
  IPaginationLinks,
  IPaginationMeta,
  IStateEntries,
  RequestStatus,
} from "../../types";
import { initialStateEntries } from "../../constants";
import {
  MOCK_ENTRIES_ENTITIES,
  MOCK_ENTRIES_IDS,
  MOCK_ENTRY_10,
  MOCK_ENTRY_20,
} from "../../testHelpers";
import {
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
} from "./entriesSlice";

import { setupServer } from "msw/node";
import { MockStoreEnhanced } from "redux-mock-store";
import configureMockStore from "redux-mock-store";
import thunkMiddleware from "redux-thunk";
import { rest } from "msw";
import { IState } from "../../types";
import {
  requestHandlers,
  MOCK_META,
  MOCK_LINKS,
  MOCK_ENTRIES,
  MOCK_ENTRY_20_LOCAL_TIME,
} from "../../testHelpers";
import { store } from "../../store";
import { URL_FOR_FIRST_PAGE_OF_EXAMPLES, PER_PAGE_DEFAULT } from "../../constants";
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

describe("entriesReducer", () => {
  let initStateEntries: IStateEntries;

  beforeEach(() => {
    initStateEntries = { ...initialStateEntries };
  });

  test("entries/fetchEntries/pending", () => {
    const action = {
      type: "entries/fetchEntries/pending",
    };

    const newStateEntries = entriesReducer(initStateEntries, action);

    expect(newStateEntries).toEqual({
      requestStatus: "loading",
      requestError: null,
      _meta: { ...initialStateEntries._meta },
      _links: { ...initialStateEntries._links },
      ids: [],
      entities: {},
    });
  });

  test("entries/fetchEntries/rejected", () => {
    const action = {
      type: "entries/fetchEntries/rejected",
      error: "entries-fetchEntries-rejected",
    };

    const newStateEntries = entriesReducer(initStateEntries, action);

    expect(newStateEntries).toEqual({
      requestStatus: "failed",
      requestError: "entries-fetchEntries-rejected",
      _meta: { ...initialStateEntries._meta },
      _links: { ...initialStateEntries._links },
      ids: [],
      entities: {},
    });
  });

  test("entries/fetchEntries/fulfilled", () => {
    const action = {
      type: "entries/fetchEntries/fulfilled",
      payload: {
        entries: [
          {
            id: 1,
            timestampInUTC: "2020-12-01T15:17:00.000Z",
            utcZoneOfTimestamp: "+02:00",
            content: "[hard-coded] Then it dawned on me: there is no finish line!",
            createdAt: "2021-04-29T05:10:56.000Z",
            updatedAt: "2021-04-29T05:10:56.000Z",
            userId: 1,
          },
          {
            id: 2,
            timestampInUTC: "2019-08-20T13:17:00.000Z",
            utcZoneOfTimestamp: "+01:00",
            content: "[hard-coded] Mallorca has beautiful sunny beaches!",
            createdAt: "2021-04-29T05:11:01.000Z",
            updatedAt: "2021-04-29T05:11:01.000Z",
            userId: 1,
          },
        ],
      },
    };

    const newStateEntries = entriesReducer(initStateEntries, action);

    expect(newStateEntries).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      ids: [1, 2],
      entities: {
        1: {
          id: 1,
          timestampInUTC: "2020-12-01T15:17:00.000Z",
          utcZoneOfTimestamp: "+02:00",
          content: "[hard-coded] Then it dawned on me: there is no finish line!",
          createdAt: "2021-04-29T05:10:56.000Z",
          updatedAt: "2021-04-29T05:10:56.000Z",
          userId: 1,
        },
        2: {
          id: 2,
          timestampInUTC: "2019-08-20T13:17:00.000Z",
          utcZoneOfTimestamp: "+01:00",
          content: "[hard-coded] Mallorca has beautiful sunny beaches!",
          createdAt: "2021-04-29T05:11:01.000Z",
          updatedAt: "2021-04-29T05:11:01.000Z",
          userId: 1,
        },
      },
    });
  });

  test("entries/createEntry/pending", () => {
    const action = {
      type: "entries/createEntry/pending",
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "loading",
      requestError: null,
      _meta: { ...initialStateEntries._meta },
      _links: { ...initialStateEntries._links },
      ids: [],
      entities: {},
    });
  });

  test("entries/createEntry/rejected", () => {
    initStateEntries = {
      ...initialStateEntries,
      requestStatus: RequestStatus.LOADING,
    };
    const action = {
      type: "entries/createEntry/rejected",
      error: "entries-createEntry-rejected",
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "failed",
      requestError: "entries-createEntry-rejected",
      _meta: { ...initialStateEntries._meta },
      _links: { ...initialStateEntries._links },
      ids: [],
      entities: {},
    });
  });

  test("entries/createEntry/fulfilled", () => {
    initStateEntries = {
      ...initialStateEntries,
      requestStatus: RequestStatus.LOADING,
      ids: [1],
      entities: {
        1: {
          id: 1,
          timestampInUTC: "2020-12-01T15:17:00.000Z",
          utcZoneOfTimestamp: "+02:00",
          content: "[hard-coded] Then it dawned on me: there is no finish line!",
          createdAt: "2021-04-29T05:10:56.000Z",
          updatedAt: "2021-04-29T05:10:56.000Z",
          userId: 1,
        },
      },
    };
    const action = {
      type: "entries/createEntry/fulfilled",
      payload: {
        entry: {
          id: 17,
          timestampInUTC: "2019-08-20T13:17:00.000Z",
          utcZoneOfTimestamp: "+01:00",
          content: "[hard-coded] Mallorca has beautiful sunny beaches!",
          createdAt: "2021-04-29T05:11:01.000Z",
          updatedAt: "2021-04-29T05:11:01.000Z",
          userId: 1,
        },
      },
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      _meta: { ...initialStateEntries._meta },
      _links: { ...initialStateEntries._links },
      ids: [1, 17],
      entities: {
        1: {
          id: 1,
          timestampInUTC: "2020-12-01T15:17:00.000Z",
          utcZoneOfTimestamp: "+02:00",
          content: "[hard-coded] Then it dawned on me: there is no finish line!",
          createdAt: "2021-04-29T05:10:56.000Z",
          updatedAt: "2021-04-29T05:10:56.000Z",
          userId: 1,
        },
        17: {
          id: 17,
          timestampInUTC: "2019-08-20T13:17:00.000Z",
          utcZoneOfTimestamp: "+01:00",
          content: "[hard-coded] Mallorca has beautiful sunny beaches!",
          createdAt: "2021-04-29T05:11:01.000Z",
          updatedAt: "2021-04-29T05:11:01.000Z",
          userId: 1,
        },
      },
    });
  });

  test("entries/editEntry/pending", () => {
    const action = editEntryPending();

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "loading",
      requestError: null,
      _meta: { ...initialStateEntries._meta },
      _links: { ...initialStateEntries._links },
      ids: [],
      entities: {},
    });
  });

  test("entries/editEntry/rejected", () => {
    const action = editEntryRejected("entries-editEntry-rejected");

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "failed",
      requestError: "entries-editEntry-rejected",
      _meta: { ...initialStateEntries._meta },
      _links: { ...initialStateEntries._links },
      ids: [],
      entities: {},
    });
  });

  test("entries/editEntry/fulfilled", () => {
    initStateEntries = {
      ...initialStateEntries,
      requestStatus: RequestStatus.LOADING,
      ids: [1],
      entities: {
        1: {
          id: 1,
          timestampInUTC: "2020-12-01T15:17:00.000Z",
          utcZoneOfTimestamp: "+02:00",
          content: "[hard-coded] Then it dawned on me: there is no finish line!",
          createdAt: "2021-04-29T05:10:56.000Z",
          updatedAt: "2021-04-29T05:10:56.000Z",
          userId: 1,
        },
      },
    };
    const action = {
      type: "entries/editEntry/fulfilled",
      payload: {
        entry: {
          id: 1,
          timestampInUTC: "2019-08-20T13:17:00.000Z",
          utcZoneOfTimestamp: "+01:00",
          content: "[hard-coded] Mallorca has beautiful sunny beaches!",
          createdAt: "2021-04-29T05:11:01.000Z",
          updatedAt: "2021-04-29T05:11:01.000Z",
          userId: 1,
        },
      },
    };

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      _meta: { ...initialStateEntries._meta },
      _links: { ...initialStateEntries._links },
      ids: [1],
      entities: {
        1: {
          id: 1,
          timestampInUTC: "2019-08-20T13:17:00.000Z",
          utcZoneOfTimestamp: "+01:00",
          content: "[hard-coded] Mallorca has beautiful sunny beaches!",
          createdAt: "2021-04-29T05:11:01.000Z",
          updatedAt: "2021-04-29T05:11:01.000Z",
          userId: 1,
        },
      },
    });
  });

  test("entries/deleteEntry/pending", () => {
    initStateEntries = {
      ...initialStateEntries,
      requestStatus: RequestStatus.SUCCEEDED,
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    };
    const action = deleteEntryPending();

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "loading",
      requestError: null,
      _meta: { ...initialStateEntries._meta },
      _links: { ...initialStateEntries._links },
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    });
  });

  test("entries/deleteEntry/rejected", () => {
    initStateEntries = {
      ...initialStateEntries,
      requestStatus: RequestStatus.SUCCEEDED,
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    };
    const action = deleteEntryRejected("entries-deleteEntry-rejected");

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "failed",
      requestError: "entries-deleteEntry-rejected",
      _meta: { ...initialStateEntries._meta },
      _links: { ...initialStateEntries._links },
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    });
  });

  test("entries/deleteEntry/fulfilled", () => {
    initStateEntries = {
      ...initialStateEntries,
      requestStatus: RequestStatus.LOADING,
      ids: [MOCK_ENTRY_10.id, MOCK_ENTRY_20.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
        [MOCK_ENTRY_20.id]: MOCK_ENTRY_20,
      },
    };
    const action = deleteEntryFulfilled(MOCK_ENTRY_20.id);

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      _meta: { ...initialStateEntries._meta },
      _links: { ...initialStateEntries._links },
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    });
  });

  test("entries/clearEntriesSlice", () => {
    initStateEntries = {
      ...initialStateEntries,
      requestStatus: RequestStatus.SUCCEEDED,
      ids: MOCK_ENTRIES_IDS,
      entities: MOCK_ENTRIES_ENTITIES,
    };
    const action = clearEntriesSlice();

    const newState = entriesReducer(initStateEntries, action);

    expect(newState).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      _meta: { ...initialStateEntries._meta },
      _links: { ...initialStateEntries._links },
      ids: [],
      entities: {},
    });
  });

  test(
    "an action, which this reducer doesn't specifically handle," +
      " should not modify (the corresponding slice of) the state",
    () => {
      const initStEntries = {
        requestStatus: "fulfilled",
        requestError: null,
        ids: [17],
        entities: {
          17: {
            id: 17,
            timestampInUTC: "2020-12-01T15:17:00.000Z",
            utcZoneOfTimestamp: "+02:00",
            content: "[hard-coded] Then it dawned on me: there is no finish line!",
            createdAt: "2021-04-29T05:10:56.000Z",
            updatedAt: "2021-04-29T05:10:56.000Z",
            userId: 1,
          },
        },
      };
      const action = {
        type: "an action, which this reducer doesn't specifically handle",
      };

      const newStEntries = entriesReducer(initStEntries, action);

      expect(newStEntries).toEqual(initStEntries);
    }
  );
});

/* Create an MSW "request-interception layer". */
const requestInterceptionLayer = [
  rest.get("/api/entries", requestHandlers.mockMultipleFailures),
  rest.post("/api/entries", requestHandlers.mockMultipleFailures),
  rest.put("/api/entries/:id", requestHandlers.mockMultipleFailures),
  rest.delete("/api/entries/:id", requestHandlers.mockMultipleFailures),
];

const quasiServer = setupServer(...requestInterceptionLayer);

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
      quasiServer.listen();
    });

    beforeEach(() => {
      initSt = {
        ...store.getState(),
      };
      storeMock = createStoreMock(initSt);
    });

    afterEach(() => {
      // Remove any request handlers that may have been added at runtime
      // (by individual tests after the initial `setupServer` call).
      quasiServer.resetHandlers();
    });

    afterAll(() => {
      // Prevent the established request-interception layer
      // from affecting irrelevant tests
      // by tearing down that layer
      // (= by stopping request interception)
      // (= disabling API mocking).
      quasiServer.close();
    });

    test(
      "fetchEntries()" +
        " + the HTTP request issued by that thunk-action is mocked to fail",
      async () => {
        // Act.
        const fetchEntriesPromise = storeMock.dispatch(
          fetchEntries(URL_FOR_FIRST_PAGE_OF_EXAMPLES)
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
        quasiServer.use(rest.get("/api/entries", requestHandlers.mockFetchEntries));

        // Act.
        const fetchEntriesPromise = storeMock.dispatch(
          fetchEntries(URL_FOR_FIRST_PAGE_OF_EXAMPLES)
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
        quasiServer.use(
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
        quasiServer.use(rest.post("/api/entries", requestHandlers.mockCreateEntry));

        // Act.
        const createEntryPromise = storeMock.dispatch(
          createEntry(
            MOCK_ENTRY_10.localTime,
            MOCK_ENTRY_10.timezone,
            MOCK_ENTRY_10.content
          )
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
              entry: MOCK_ENTRY_10,
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
        quasiServer.use(
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
        quasiServer.use(rest.put("/api/entries/:id", requestHandlers.mockEditEntry));

        const targetedEntryId: number = MOCK_ENTRY_10.id;

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
        await expect(editEntryPromise).resolves.toEqual(undefined);

        expect(storeMock.getActions()).toEqual([
          {
            type: "entries/editEntry/pending",
          },
          {
            type: "entries/editEntry/fulfilled",
            payload: {
              entry: {
                ...MOCK_ENTRY_20,
                id: targetedEntryId,
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
        quasiServer.use(
          rest.delete("/api/entries/:id", requestHandlers.mockDeleteEntry)
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

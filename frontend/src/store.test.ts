import { setupServer } from "msw/node";
import { MockStoreEnhanced } from "redux-mock-store";
import configureMockStore from "redux-mock-store";
import thunkMiddleware from "redux-thunk";

import { rest } from "msw";

import {
  IEntry,
  IPaginationLinks,
  IPaginationMeta,
  IState,
  IStateEntries,
  RequestStatus,
} from "./types";
import {
  initialStateAlerts,
  initialStateAuth,
  initialStateEntries,
  PER_PAGE_DEFAULT,
  URL_FOR_FIRST_PAGE_OF_EXAMPLES,
} from "./constants";

import {
  mockFetchEntries,
  MOCK_ENTRIES,
  MOCK_ENTRIES_ENTITIES,
  MOCK_ENTRIES_IDS,
  MOCK_ENTRY_10,
  MOCK_ENTRY_20,
  MOCK_ENTRY_20_LOCAL_TIME,
  MOCK_LINKS,
  MOCK_META,
  profileMock,
  requestHandlersToMock,
} from "./testHelpers";
import {
  createUserPending,
  createUserRejected,
  createUserFulfilled,
  rootReducer,
  store,
  alertsCreate,
  alertsRemove,
  createUser,
  issueJWSTokenPending,
  issueJWSTokenRejected,
  issueJWSTokenFulfilled,
  issueJWSToken,
  fetchProfilePending,
  fetchProfileRejected,
  fetchProfileFulfilled,
  fetchProfile,
  clearAuthSlice,
  fetchEntriesPending,
  fetchEntriesRejected,
  fetchEntriesFulfilled,
  entriesReducer,
  fetchEntries,
  createEntryPending,
  createEntryRejected,
  createEntryFulfilled,
  createEntry,
  editEntryPending,
  editEntryRejected,
  editEntryFulfilled,
  editEntry,
  deleteEntryPending,
  deleteEntryRejected,
  deleteEntryFulfilled,
  deleteEntry,
  clearEntriesSlice,
  signOut,
} from "./store";

describe("action creators", () => {
  test("createUserPending", () => {
    const action = createUserPending();

    expect(action).toEqual({
      type: "auth/createUser/pending",
    });
  });

  test("createUserRejected", () => {
    const action = createUserRejected("auth-createUser-rejected");

    expect(action).toEqual({
      type: "auth/createUser/rejected",
      error: "auth-createUser-rejected",
    });
  });

  test("createUserFulfilled", () => {
    const action = createUserFulfilled();

    expect(action).toEqual({
      type: "auth/createUser/fulfilled",
    });
  });

  test("alertsCreate", () => {
    const action = alertsCreate("id-17", "the-undertaken-action-is-illegitimate");

    expect(action).toEqual({
      type: "alerts/create",
      payload: {
        id: "id-17",
        message: "the-undertaken-action-is-illegitimate",
      },
    });
  });

  test("alertsRemove", () => {
    const action = alertsRemove("id-17");

    expect(action).toEqual({
      type: "alerts/remove",
      payload: {
        id: "id-17",
      },
    });
  });

  test("issueJWSTokenPending", () => {
    const action = issueJWSTokenPending();

    expect(action).toEqual({
      type: "auth/issueJWSToken/pending",
    });
  });

  test("issueJWSTokenRejected", () => {
    const action = issueJWSTokenRejected("auth-issueJWSToken-rejected");

    expect(action).toEqual({
      type: "auth/issueJWSToken/rejected",
      error: "auth-issueJWSToken-rejected",
    });
  });

  test("issueJWSTokenFulfilled", () => {
    const action = issueJWSTokenFulfilled("a-jws-token-issued-by-the-backend");

    expect(action).toEqual({
      type: "auth/issueJWSToken/fulfilled",
      payload: {
        token: "a-jws-token-issued-by-the-backend",
      },
    });
  });

  test("fetchProfilePending", () => {
    const action = fetchProfilePending();

    expect(action).toEqual({
      type: "auth/fetchProfile/pending",
    });
  });

  test("fetchProfileRejected", () => {
    const action = fetchProfileRejected("auth-fetchProfile-rejected");

    expect(action).toEqual({
      type: "auth/fetchProfile/rejected",
      error: "auth-fetchProfile-rejected",
    });
  });

  test("fetchProfileFulfilled", () => {
    const profile = {
      id: 17,
      username: "jd",
      name: "John Doe",
      email: "john.doe@protonmail.com",
      createdAt: "2021-05-23T11:10:17.000Z",
      updatedAt: "2021-05-23T11:10:34.000Z",
    };
    const action = fetchProfileFulfilled(profile);

    expect(action).toEqual({
      type: "auth/fetchProfile/fulfilled",
      payload: {
        profile,
      },
    });
  });

  test("clearAuthSlice", () => {
    const action = clearAuthSlice();

    expect(action).toEqual({
      type: "auth/clearAuthSlice",
    });
  });

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

describe("reducers", () => {
  let initState: IState;

  beforeEach(() => {
    initState = {
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        ...initialStateAuth,
      },
      entries: {
        ...initialStateEntries,
      },
    };
  });

  test("alerts/create", () => {
    initState.alerts = {
      ids: ["id-17"],
      entities: {
        "id-17": {
          id: "id-17",
          message: "the-undertaken-action-is-illegitimate",
        },
      },
    };
    const action = {
      type: "alerts/create",
      payload: {
        id: "id-34",
        message: "once-again-the-undertaken-action-is-illegitimate",
      },
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        ids: ["id-34", "id-17"],
        entities: {
          "id-34": {
            id: "id-34",
            message: "once-again-the-undertaken-action-is-illegitimate",
          },
          "id-17": {
            id: "id-17",
            message: "the-undertaken-action-is-illegitimate",
          },
        },
      },
      auth: {
        ...initialStateAuth,
      },
      entries: {
        ...initialStateEntries,
      },
    });
  });

  test("alerts/remove", () => {
    initState.alerts = {
      ids: ["id-17", "id-34"],
      entities: {
        "id-17": {
          id: "id-17",
          message: "the-undertaken-action-is-illegitimate",
        },
        "id-34": {
          id: "id-34",
          message: "once-again-the-undertaken-action-is-illegitimate",
        },
      },
    };
    const action = {
      type: "alerts/remove",
      payload: {
        id: "id-34",
      },
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        ids: ["id-17"],
        entities: {
          "id-17": {
            id: "id-17",
            message: "the-undertaken-action-is-illegitimate",
          },
        },
      },
      auth: {
        ...initialStateAuth,
      },
      entries: {
        ...initialStateEntries,
      },
    });
  });

  test("auth/createUser/pending", () => {
    initState = {
      ...store.getState(),
      auth: {
        ...store.getState().auth,
        requestStatus: RequestStatus.FAILED,
        requestError: "The previous attempt to create a User resource didn't succeed",
      },
    };
    const action = {
      type: "auth/createUser/pending",
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: "loading",
        requestError: null,
        token: null,
        hasValidToken: null,
        signedInUserProfile: null,
      },
      entries: {
        ...initialStateEntries,
      },
    });
  });

  test("auth/createUser/rejected", () => {
    initState = {
      ...store.getState(),
      auth: {
        ...store.getState().auth,
        requestStatus: RequestStatus.LOADING,
      },
    };
    const action = {
      type: "auth/createUser/rejected",
      error: "auth-createUser-rejected",
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: "failed",
        requestError: "auth-createUser-rejected",
        token: null,
        hasValidToken: null,
        signedInUserProfile: null,
      },
      entries: {
        ...initialStateEntries,
      },
    });
  });

  test("auth/createUser/fulfilled", () => {
    initState = {
      ...store.getState(),
      auth: {
        ...store.getState().auth,
        requestStatus: RequestStatus.LOADING,
      },
    };
    const action = {
      type: "auth/createUser/fulfilled",
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: "succeeded",
        requestError: null,
        token: null,
        hasValidToken: null,
        signedInUserProfile: null,
      },
      entries: {
        ...initialStateEntries,
      },
    });
  });

  test("auth/issueJWSToken/pending", () => {
    initState = {
      ...store.getState(),
      auth: {
        ...store.getState().auth,
        requestStatus: RequestStatus.FAILED,
        requestError: "The previous attempt to issue a JWS token didn't succeed",
      },
    };
    const action = {
      type: "auth/issueJWSToken/pending",
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: "loading",
        requestError: null,
        token: null,
        hasValidToken: null,
        signedInUserProfile: null,
      },
      entries: {
        ...initialStateEntries,
      },
    });
  });

  test("auth/issueJWSToken/rejected", () => {
    initState = {
      ...store.getState(),
      auth: {
        ...store.getState().auth,
        requestStatus: RequestStatus.LOADING,
      },
    };
    const action = {
      type: "auth/issueJWSToken/rejected",
      error: "auth-issueJWSToken-rejected",
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: "failed",
        requestError: "auth-issueJWSToken-rejected",
        token: null,
        hasValidToken: false,
        signedInUserProfile: null,
      },
      entries: {
        ...initialStateEntries,
      },
    });
  });

  test("auth/issueJWSToken/fulfilled", () => {
    initState = {
      ...store.getState(),
      auth: {
        ...store.getState().auth,
        requestStatus: RequestStatus.LOADING,
      },
    };
    const action = {
      type: "auth/issueJWSToken/fulfilled",
      payload: {
        token: "a-jws-token-issued-by-the-backend",
      },
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: "succeeded",
        requestError: null,
        token: "a-jws-token-issued-by-the-backend",
        hasValidToken: true,
        signedInUserProfile: null,
      },
      entries: {
        ...initialStateEntries,
      },
    });
  });

  test("auth/fetchProfile/pending", () => {
    const action = {
      type: "auth/fetchProfile/pending",
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: "loading",
        requestError: null,
        token: null,
        hasValidToken: null,
        signedInUserProfile: null,
      },
      entries: {
        ...initialStateEntries,
      },
    });
  });

  test("auth/fetchProfile/rejected", () => {
    const action = {
      type: "auth/fetchProfile/rejected",
      error: "auth-fetchProfile-rejected",
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: "failed",
        requestError: "auth-fetchProfile-rejected",
        token: null,
        hasValidToken: false,
        signedInUserProfile: null,
      },
      entries: {
        ...initialStateEntries,
      },
    });
  });

  test("auth/fetchProfile/fulfilled", () => {
    initState = {
      ...store.getState(),
      auth: {
        ...store.getState().auth,
        requestStatus: RequestStatus.LOADING,
        requestError: null,
        token: "a-jws-token-issued-by-the-backend",
      },
    };
    const action = {
      type: "auth/fetchProfile/fulfilled",
      payload: {
        profile: {
          id: 17,
          username: "[mocked] ms",
          name: "[mocked] Mary Smith",
          email: "[mocked] mary.smith@protonmail.com",
          createdAt: "[mocked] 2021-05-23T11:10:17.000Z",
          updatedAt: "[mocked] 2021-05-23T11:10:34.000Z",
        },
      },
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: "succeeded",
        requestError: null,
        token: "a-jws-token-issued-by-the-backend",
        hasValidToken: true,
        signedInUserProfile: {
          id: 17,
          username: "[mocked] ms",
          name: "[mocked] Mary Smith",
          email: "[mocked] mary.smith@protonmail.com",
          createdAt: "[mocked] 2021-05-23T11:10:17.000Z",
          updatedAt: "[mocked] 2021-05-23T11:10:34.000Z",
        },
      },
      entries: {
        ...initialStateEntries,
      },
    });
  });

  test("auth/clearAuthSlice", () => {
    initState.auth.token = "a-jws-token-issued-by-the-backend";
    initState.auth.hasValidToken = true;
    const action = {
      type: "auth/clearAuthSlice",
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: "idle",
        requestError: null,
        token: null,
        hasValidToken: false,
        signedInUserProfile: null,
      },
      entries: {
        ...initialStateEntries,
      },
    });
  });

  test(
    "an action, which the rootReducer doesn't specifically handle," +
      " should not modify the state",
    () => {
      const initState: IState = {
        alerts: {
          ids: ["id-17"],
          entities: {
            "id-17": {
              id: "id-17",
              message: "the-undertaken-action-is-illegitimate",
            },
          },
        },
        auth: {
          ...initialStateAuth,
          requestStatus: RequestStatus.FAILED,
          requestError: "original-error",
          token: null,
        },
        entries: {
          ...initialStateEntries,
        },
      };
      const action = {
        type: "an action, which the rootReducer doesn't specifically handle",
      };

      const newState = rootReducer(initState, action);

      expect(newState).toEqual(initState);
    }
  );

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
});

/* Create an MSW "request-interception layer". */
const quasiServer = setupServer(...requestHandlersToMock);

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
        alerts: {
          ...initialStateAlerts,
        },
        auth: {
          ...initialStateAuth,
        },
        entries: {
          ...initialStateEntries,
        },
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
      "createUser(username, ...)" +
        " + the HTTP request issued by that thunk-action is mocked to fail",
      async () => {
        // Arrange.
        // (Prepend a request handler to the request-interception layer.)
        quasiServer.use(
          rest.post("/api/users", (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({
                error: "[mocked-response] Failed to create a new User resource",
              })
            );
          })
        );

        // Act.
        const createUserPromise = storeMock.dispatch(
          createUser(
            "mocked-request-username",
            "mocked-request-name",
            "mocked-request-email@protonmail.com",
            "mocked-request-password"
          )
        );

        // Assert.
        await expect(createUserPromise).rejects.toEqual(
          "[mocked-response] Failed to create a new User resource"
        );
        expect(storeMock.getActions()).toEqual([
          {
            type: "auth/createUser/pending",
          },
          {
            type: "auth/createUser/rejected",
            error: "[mocked-response] Failed to create a new User resource",
          },
        ]);
      }
    );

    test(
      "createUser(username, ...)" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        const createUserPromise = storeMock.dispatch(
          createUser(
            "mocked-request-username",
            "mocked-request-name",
            "mocked-request-email@protonmail.com",
            "mocked-request-password"
          )
        );

        await expect(createUserPromise).resolves.toEqual(undefined);
        expect(storeMock.getActions()).toEqual([
          { type: "auth/createUser/pending" },
          { type: "auth/createUser/fulfilled" },
        ]);
      }
    );

    test(
      "issueJWSToken(email, password)" +
        " + the HTTP request issued by that thunk-action is mocked to fail",
      async () => {
        // Arrange.
        quasiServer.use(
          rest.post("/api/tokens", (req, res, ctx) => {
            return res(
              ctx.status(401),
              ctx.json({
                error: "[mocked-response] Failed to issue a JWS token",
              })
            );
          })
        );

        // Act.
        const issueJWSTokenPromise = storeMock.dispatch(
          issueJWSToken("mocked-request-email", "mocked-request-password")
        );

        // Assert.
        await expect(issueJWSTokenPromise).rejects.toEqual(
          "[mocked-response] Failed to issue a JWS token"
        );
        expect(storeMock.getActions()).toEqual([
          {
            type: "auth/issueJWSToken/pending",
          },
          {
            type: "auth/issueJWSToken/rejected",
            error: "[mocked-response] Failed to issue a JWS token",
          },
        ]);
      }
    );

    test(
      "issueJWSToken(email, password)" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        const issueJWSTokenPromise = storeMock.dispatch(
          issueJWSToken("mocked-request-email", "mocked-request-password")
        );

        await expect(issueJWSTokenPromise).resolves.toEqual(undefined);
        expect(storeMock.getActions()).toEqual([
          {
            type: "auth/issueJWSToken/pending",
          },
          {
            type: "auth/issueJWSToken/fulfilled",
            payload: {
              token: "mocked-json-web-signature-token",
            },
          },
        ]);
      }
    );

    test("signOut()", () => {
      storeMock.dispatch(signOut("We have signed you out of your account."));

      const dispatchedActions = storeMock.getActions();

      expect(dispatchedActions.length).toEqual(3);

      expect(dispatchedActions[0]).toEqual({
        type: "auth/clearAuthSlice",
      });

      expect(dispatchedActions[1]).toEqual({
        type: "entries/clearEntriesSlice",
      });

      expect({
        type: dispatchedActions[2].type,
        payload: {
          message: dispatchedActions[2].payload.message,
        },
      }).toEqual({
        type: "alerts/create",
        payload: {
          message: "We have signed you out of your account.",
        },
      });
    });

    test(
      "fetchProfile()" +
        " + the HTTP request issued by that thunk-action is mocked to fail",
      async () => {
        // Arrange.
        quasiServer.use(
          rest.get("/api/user-profile", (req, res, ctx) => {
            return res(
              ctx.status(401),
              ctx.json({
                error:
                  "[mocked-response] Failed to authenticated you as an HTTP client",
              })
            );
          })
        );

        // Act.
        const fetchProfilePromise = storeMock.dispatch(fetchProfile());

        // Assert.
        await expect(fetchProfilePromise).rejects.toEqual(
          "[mocked-response] Failed to authenticated you as an HTTP client"
        );
        expect(storeMock.getActions()).toEqual([
          {
            type: "auth/fetchProfile/pending",
          },
          {
            type: "auth/fetchProfile/rejected",
            error: "[mocked-response] Failed to authenticated you as an HTTP client",
          },
        ]);
      }
    );

    test(
      "fetchProfile()" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        const fetchProfilePromise = storeMock.dispatch(fetchProfile());

        await expect(fetchProfilePromise).resolves.toEqual(undefined);
        expect(storeMock.getActions()).toEqual([
          {
            type: "auth/fetchProfile/pending",
          },
          {
            type: "auth/fetchProfile/fulfilled",
            payload: {
              profile: profileMock,
            },
          },
        ]);
      }
    );

    test(
      "fetchEntries()" +
        " + the HTTP request issued by that thunk-action is mocked to fail",
      async () => {
        // Arrange.
        quasiServer.use(
          rest.get("/api/entries", (req, res, ctx) => {
            return res(
              ctx.status(401),
              ctx.json({
                error: "[mocked-response] Failed to authenticate you as an HTTP client",
              })
            );
          })
        );

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
            error: "[mocked-response] Failed to authenticate you as an HTTP client",
          },
        ]);
      }
    );

    test(
      "fetchEntries()" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        // Arrange.
        quasiServer.use(rest.get("/api/entries", mockFetchEntries));

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
            return res(
              ctx.status(400),
              ctx.json({
                error: "[mocked-response] Failed to create a new Entry resource",
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
            error: "[mocked-response] Failed to create a new Entry resource",
          },
        ]);
      }
    );

    test(
      "createEntry(localTime, ...)" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        const createEntryPromise = storeMock.dispatch(
          createEntry(
            MOCK_ENTRY_10.localTime,
            MOCK_ENTRY_10.timezone,
            MOCK_ENTRY_10.content
          )
        );

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
            return res(
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
        const targetedEntryId: number = MOCK_ENTRY_10.id;
        const editEntryPromise = storeMock.dispatch(
          editEntry(
            targetedEntryId,
            MOCK_ENTRY_20_LOCAL_TIME,
            MOCK_ENTRY_20.utcZoneOfTimestamp,
            MOCK_ENTRY_20.content
          )
        );

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
        quasiServer.use(
          rest.delete("/api/entries/:id", (req, res, ctx) => {
            return res(
              ctx.status(401),
              ctx.json({
                error: "[mocked-response] Failed to delete the targeted Entry resource",
              })
            );
          })
        );

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
            error: "[mocked-response] Failed to delete the targeted Entry resource",
          },
        ]);
      }
    );

    test(
      "deleteEntry(entryId)" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        const targetedEntryId: number = MOCK_ENTRY_10.id;

        const deleteEntryPromise = storeMock.dispatch(deleteEntry(targetedEntryId));

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

import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import {
  IEntry,
  IPaginationLinks,
  IPaginationMeta,
  IStateEntries,
  IState,
} from "./types";

import {
  createUserPending,
  createUserRejected,
  createUserFulfilled,
  rootReducer,
  PrivateRoute,
} from "./App";
import App, { Alerts, Home, SignUp, SignIn, JournalEntries, CreateEntry } from "./App";

import { Provider } from "react-redux";
import { store } from "./App";

import { alertsCreate, alertsRemove } from "./App";

import { createStore } from "redux";

import { rest } from "msw";
import { setupServer } from "msw/node";

import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import thunkMiddleware from "redux-thunk";
import { createUser } from "./App";

import { applyMiddleware } from "redux";

import {
  issueJWSTokenPending,
  issueJWSTokenRejected,
  issueJWSTokenFulfilled,
} from "./App";
import { issueJWSToken } from "./App";

import {
  fetchProfilePending,
  fetchProfileRejected,
  fetchProfileFulfilled,
} from "./App";
import { fetchProfile } from "./App";

import { clearAuthSlice } from "./App";

import {
  fetchEntriesPending,
  fetchEntriesRejected,
  fetchEntriesFulfilled,
  entriesReducer,
} from "./App";
import { fetchEntries } from "./App";

import { createEntryPending, createEntryRejected, createEntryFulfilled } from "./App";
import { createEntry } from "./App";

import { editEntryPending, editEntryRejected, editEntryFulfilled } from "./App";
import { editEntry } from "./App";

import { createMemoryHistory } from "history";
import { Router, Switch, Route } from "react-router-dom";
import { EditEntry } from "./App";

import { deleteEntryPending, deleteEntryRejected, deleteEntryFulfilled } from "./App";
import { deleteEntry } from "./App";

import { DeleteEntryLink, DeleteEntry } from "./App";

import { clearEntriesSlice } from "./App";

import { signOut } from "./App";
import {
  initialStateAlerts,
  JOURNAL_APP_TOKEN,
  initialStateAuth,
  initialStateEntries,
  URL_FOR_FIRST_PAGE_OF_EXAMPLES,
} from "./constants";

import moment from "moment";

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

  test(
    "alerts/create should add an alert to" +
      " both state.alerts.ids and state.alerts.entities",
    () => {
      initState.alerts.ids = ["id-17"];
      initState.alerts.entities = {
        "id-17": {
          id: "id-17",
          message: "the-undertaken-action-is-illegitimate",
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
          requestStatus: "idle",
          requestError: null,
          token: null,
          hasValidToken: null,
          signedInUserProfile: null,
        },
        entries: {
          requestStatus: "idle",
          requestError: null,
          _meta: { ...initialStateEntries._meta },
          _links: { ...initialStateEntries._links },
          ids: [],
          entities: {},
        },
      });
    }
  );

  test(
    "alerts/remove should remove an alert from" +
      " both state.alerts.ids and state.alerts.entities",
    () => {
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
          requestStatus: "idle",
          requestError: null,
          token: null,
          hasValidToken: null,
          signedInUserProfile: null,
        },
        entries: {
          requestStatus: "idle",
          requestError: null,
          _meta: { ...initialStateEntries._meta },
          _links: { ...initialStateEntries._links },
          ids: [],
          entities: {},
        },
      });
    }
  );

  test(
    "auth/createUser/pending should" +
      " update state.auth.requestStatus to 'loading'" +
      " and clear state.auth.requestError",
    () => {
      initState.auth.requestStatus = "failed";
      initState.auth.requestError =
        "The previous attempt to create a User resource didn't succeed";
      const action = {
        type: "auth/createUser/pending",
      };

      const newState = rootReducer(initState, action);

      expect(newState).toEqual({
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "loading",
          requestError: null,
          token: null,
          hasValidToken: null,
          signedInUserProfile: null,
        },
        entries: {
          requestStatus: "idle",
          requestError: null,
          _meta: { ...initialStateEntries._meta },
          _links: { ...initialStateEntries._links },
          ids: [],
          entities: {},
        },
      });
    }
  );

  test(
    "auth/createUser/rejected should update" +
      " both state.auth.requestStatus and state.auth.requestError",
    () => {
      initState.auth.requestStatus = "pending";
      const action = {
        type: "auth/createUser/rejected",
        error: "auth-createUser-rejected",
      };

      const newState = rootReducer(initState, action);

      expect(newState).toEqual({
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "failed",
          requestError: "auth-createUser-rejected",
          token: null,
          hasValidToken: null,
          signedInUserProfile: null,
        },
        entries: {
          requestStatus: "idle",
          requestError: null,
          _meta: { ...initialStateEntries._meta },
          _links: { ...initialStateEntries._links },
          ids: [],
          entities: {},
        },
      });
    }
  );

  test(
    "auth/createUser/fulfilled should" +
      " update state.auth.requestStatus to 'succeeded'" +
      " and clear state.auth.requestError",
    () => {
      initState.auth.requestStatus = "pending";
      const action = {
        type: "auth/createUser/fulfilled",
      };

      const newState = rootReducer(initState, action);

      expect(newState).toEqual({
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "succeeded",
          requestError: null,
          token: null,
          hasValidToken: null,
          signedInUserProfile: null,
        },
        entries: {
          requestStatus: "idle",
          requestError: null,
          _meta: { ...initialStateEntries._meta },
          _links: { ...initialStateEntries._links },
          ids: [],
          entities: {},
        },
      });
    }
  );

  test(
    "auth/issueJWSToken/pending should" +
      " update state.auth.requestStatus to 'loading'" +
      " and clear state.auth.requestError",
    () => {
      initState.auth.requestStatus = "failed";
      initState.auth.requestError =
        "The previous attempt to issue a JWS token didn't succeed";
      const action = {
        type: "auth/issueJWSToken/pending",
      };

      const newState = rootReducer(initState, action);

      expect(newState).toEqual({
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "loading",
          requestError: null,
          token: null,
          hasValidToken: null,
          signedInUserProfile: null,
        },
        entries: {
          requestStatus: "idle",
          requestError: null,
          _meta: { ...initialStateEntries._meta },
          _links: { ...initialStateEntries._links },
          ids: [],
          entities: {},
        },
      });
    }
  );

  test(
    "auth/issueJWSToken/rejected should update" +
      " both state.auth.requestStatus and state.auth.requestError",
    () => {
      initState.auth.requestStatus = "pending";
      const action = {
        type: "auth/issueJWSToken/rejected",
        error: "auth-issueJWSToken-rejected",
      };

      const newState = rootReducer(initState, action);

      expect(newState).toEqual({
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "failed",
          requestError: "auth-issueJWSToken-rejected",
          token: null,
          hasValidToken: false,
          signedInUserProfile: null,
        },
        entries: {
          requestStatus: "idle",
          requestError: null,
          _meta: { ...initialStateEntries._meta },
          _links: { ...initialStateEntries._links },
          ids: [],
          entities: {},
        },
      });
    }
  );

  test(
    "auth/issueJWSToken/fulfilled should" +
      " update state.auth.requestStatus to 'succeeded'," +
      " clear state.auth.requestError," +
      " and set state.auth.token",
    () => {
      initState.auth.requestStatus = "pending";
      const action = {
        type: "auth/issueJWSToken/fulfilled",
        payload: {
          token: "a-jws-token-issued-by-the-backend",
        },
      };

      const newState = rootReducer(initState, action);

      expect(newState).toEqual({
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "succeeded",
          requestError: null,
          token: "a-jws-token-issued-by-the-backend",
          hasValidToken: true,
          signedInUserProfile: null,
        },
        entries: {
          requestStatus: "idle",
          requestError: null,
          _meta: { ...initialStateEntries._meta },
          _links: { ...initialStateEntries._links },
          ids: [],
          entities: {},
        },
      });
    }
  );

  test("auth/fetchProfile/pending", () => {
    const action = {
      type: "auth/fetchProfile/pending",
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        entities: {},
        ids: [],
      },
      auth: {
        requestStatus: "loading",
        requestError: null,
        token: null,
        hasValidToken: null,
        signedInUserProfile: null,
      },
      entries: {
        requestStatus: "idle",
        requestError: null,
        _meta: { ...initialStateEntries._meta },
        _links: { ...initialStateEntries._links },
        ids: [],
        entities: {},
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
        entities: {},
        ids: [],
      },
      auth: {
        requestStatus: "failed",
        requestError: "auth-fetchProfile-rejected",
        token: null,
        hasValidToken: false,
        signedInUserProfile: null,
      },
      entries: {
        requestStatus: "idle",
        requestError: null,
        _meta: { ...initialStateEntries._meta },
        _links: { ...initialStateEntries._links },
        ids: [],
        entities: {},
      },
    });
  });

  test("auth/fetchProfile/fulfilled", () => {
    initState.auth.requestStatus = "pending";
    initState.auth.requestError = null;
    initState.auth.token = "a-jws-token-issued-by-the-backend";
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
        entities: {},
        ids: [],
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
        requestStatus: "idle",
        requestError: null,
        _meta: { ...initialStateEntries._meta },
        _links: { ...initialStateEntries._links },
        ids: [],
        entities: {},
      },
    });
  });

  test("auth/clearAuthSlice should clear state.auth.token", () => {
    initState.auth.token = "a-jws-token-issued-by-the-backend";
    initState.auth.hasValidToken = true;
    const action = {
      type: "auth/clearAuthSlice",
    };

    const newState = rootReducer(initState, action);

    expect(newState).toEqual({
      alerts: {
        entities: {},
        ids: [],
      },
      auth: {
        requestStatus: "idle",
        requestError: null,
        token: null,
        hasValidToken: false,
        signedInUserProfile: null,
      },
      entries: {
        requestStatus: "idle",
        requestError: null,
        _meta: { ...initialStateEntries._meta },
        _links: { ...initialStateEntries._links },
        ids: [],
        entities: {},
      },
    });
  });

  test(
    "an action, which the rootReducer doesn't specifically handle," +
      " should not modify the state",
    () => {
      const initState = {
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
          requestStatus: "original-status",
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
      initStateEntries.requestStatus = "pending";
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
      initStateEntries.requestStatus = "pending";
      initStateEntries.ids = [1];
      initStateEntries.entities = {
        1: {
          id: 1,
          timestampInUTC: "2020-12-01T15:17:00.000Z",
          utcZoneOfTimestamp: "+02:00",
          content: "[hard-coded] Then it dawned on me: there is no finish line!",
          createdAt: "2021-04-29T05:10:56.000Z",
          updatedAt: "2021-04-29T05:10:56.000Z",
          userId: 1,
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
      initStateEntries.requestStatus = "pending";
      initStateEntries.ids = [1];
      initStateEntries.entities = {
        1: {
          id: 1,
          timestampInUTC: "2020-12-01T15:17:00.000Z",
          utcZoneOfTimestamp: "+02:00",
          content: "[hard-coded] Then it dawned on me: there is no finish line!",
          createdAt: "2021-04-29T05:10:56.000Z",
          updatedAt: "2021-04-29T05:10:56.000Z",
          userId: 1,
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
      initStateEntries.requestStatus = "succeeded";
      initStateEntries.ids = [MOCK_ENTRY_1.id];
      initStateEntries.entities = {
        [MOCK_ENTRY_1.id]: MOCK_ENTRY_1,
      };
      const action = deleteEntryPending();

      const newState = entriesReducer(initStateEntries, action);

      expect(newState).toEqual({
        requestStatus: "loading",
        requestError: null,
        _meta: { ...initialStateEntries._meta },
        _links: { ...initialStateEntries._links },
        ids: [MOCK_ENTRY_1.id],
        entities: {
          [MOCK_ENTRY_1.id]: MOCK_ENTRY_1,
        },
      });
    });

    test("entries/deleteEntry/rejected", () => {
      initStateEntries.requestStatus = "succeeded";
      initStateEntries.ids = [MOCK_ENTRY_1.id];
      initStateEntries.entities = {
        [MOCK_ENTRY_1.id]: MOCK_ENTRY_1,
      };
      const action = deleteEntryRejected("entries-deleteEntry-rejected");

      const newState = entriesReducer(initStateEntries, action);

      expect(newState).toEqual({
        requestStatus: "failed",
        requestError: "entries-deleteEntry-rejected",
        _meta: { ...initialStateEntries._meta },
        _links: { ...initialStateEntries._links },
        ids: [MOCK_ENTRY_1.id],
        entities: {
          [MOCK_ENTRY_1.id]: MOCK_ENTRY_1,
        },
      });
    });

    test("entries/deleteEntry/fulfilled", () => {
      initStateEntries.requestStatus = "pending";
      initStateEntries.requestError = null;
      initStateEntries.ids = MOCK_ENTRIES_IDS;
      initStateEntries.entities = MOCK_ENTRIES_ENTITIES;
      const action = deleteEntryFulfilled(MOCK_ENTRY_20.id);

      const newState = entriesReducer(initStateEntries, action);

      expect(newState).toEqual({
        requestStatus: "succeeded",
        requestError: null,
        _meta: { ...initialStateEntries._meta },
        _links: { ...initialStateEntries._links },
        ids: [MOCK_ENTRY_1.id],
        entities: {
          [MOCK_ENTRY_1.id]: MOCK_ENTRY_1,
        },
      });
    });

    test("entries/clearEntriesSlice", () => {
      initStateEntries.requestStatus = "succeeded";
      initStateEntries.ids = [17];
      initStateEntries.entities = {
        17: {
          id: 17,
          timestampInUTC: "2020-12-01T15:17:00.000Z",
          utcZoneOfTimestamp: "+02:00",
          content: "[hard-coded] Then it dawned on me: there is no finish line!",
          createdAt: "2021-04-29T05:10:56.000Z",
          updatedAt: "2021-04-29T05:10:56.000Z",
          userId: 1,
        },
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

/* Describe what requests should be mocked. */
const profileMock = {
  id: 17,
  username: "[mocked] jd",
  name: "[mocked] John Doe",
  email: "[mocked] john.doe@protonmail.com",
  createdAt: "[mocked] 2021-05-23T11:10:17.000Z",
  updatedAt: "[mocked] 2021-05-23T11:10:34.000Z",
};

const MOCK_ENTRY_1 = {
  id: 1,
  timestampInUTC: "2020-12-01T15:17:00.000Z",
  utcZoneOfTimestamp: "+02:00",
  content: "mocked-content-of-entry-1",
  createdAt: "2021-04-29T05:10:56.000Z",
  updatedAt: "2021-04-29T05:10:56.000Z",
  userId: 1,
};

const MOCK_ENTRY_20 = {
  id: 20,
  timestampInUTC: "2019-08-20T13:17:00.000Z",
  utcZoneOfTimestamp: "+01:00",
  content: "mocked-content-of-entry-20",
  createdAt: "2021-04-29T05:11:01.000Z",
  updatedAt: "2021-04-29T05:11:01.000Z",
  userId: 1,
};

const MOCK_ENTRIES = [MOCK_ENTRY_1, MOCK_ENTRY_20];

const _metaMock: IPaginationMeta = {
  totalItems: MOCK_ENTRIES.length,
  perPage: 10,
  totalPages: 1,
  page: 1,
};

const _linksMock: IPaginationLinks = {
  self: "localhost:5000/api/entries?perPage=10&page=1",
  next: null,
  prev: null,
  first: "localhost:5000/api/entries?perPage=10&page=1",
  last: "localhost:5000/api/entries?perPage=10&page=1",
};

const MOCK_ENTRIES_IDS = MOCK_ENTRIES.map((e: IEntry) => e.id);

const MOCK_ENTRIES_ENTITIES = MOCK_ENTRIES.reduce(
  (entriesObj: { [entryId: string]: IEntry }, entry: IEntry) => {
    entriesObj[entry.id] = entry;
    return entriesObj;
  },
  {}
);

const requestHandlersToMock = [
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

  rest.get("/api/entries", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        _meta: _metaMock,
        _links: _linksMock,
        items: MOCK_ENTRIES,
      })
    );
  }),

  rest.post("/api/entries", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(MOCK_ENTRY_1));
  }),

  rest.put("/api/entries/:id", (req, res, ctx) => {
    const { id: entryIdStr } = req.params;
    const entryId: number = parseInt(entryIdStr);

    const editedEntry = entryId !== MOCK_ENTRY_1.id ? MOCK_ENTRY_1 : MOCK_ENTRY_20;

    return res(
      ctx.status(200),
      ctx.json({
        ...editedEntry,
        id: entryId,
      })
    );
  }),

  rest.delete("/api/entries/1", (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

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
        const fetchEntriesPromise = storeMock.dispatch(
          fetchEntries(URL_FOR_FIRST_PAGE_OF_EXAMPLES)
        );

        await expect(fetchEntriesPromise).resolves.toEqual(undefined);
        expect(storeMock.getActions()).toEqual([
          {
            type: "entries/fetchEntries/pending",
          },
          {
            type: "entries/fetchEntries/fulfilled",
            payload: {
              _meta: _metaMock,
              _links: _linksMock,
              entries: MOCK_ENTRIES,
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
          createEntry("bad-localTime", MOCK_ENTRY_1.timezone, MOCK_ENTRY_1.content)
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
            MOCK_ENTRY_1.localTime,
            MOCK_ENTRY_1.timezone,
            MOCK_ENTRY_1.content
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
              entry: MOCK_ENTRY_1,
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
        const targetedEntryId: number = 1;

        quasiServer.use(
          rest.put(`/api/entries/${targetedEntryId}`, (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({
                error: "[mocked response] Failed to edit the targeted Entry resource",
              })
            );
          })
        );

        // Act.
        const editEntryPromise = storeMock.dispatch(
          editEntry(
            targetedEntryId,
            moment
              .utc(MOCK_ENTRY_20.timestampInUTC)
              .utcOffset(MOCK_ENTRY_20.utcZoneOfTimestamp)
              .format("YYYY-MM-DD HH:mm"),
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
        const targetedEntryId: number = 1;
        const editEntryPromise = storeMock.dispatch(
          editEntry(
            targetedEntryId,
            moment
              .utc(MOCK_ENTRY_20.timestampInUTC)
              .utcOffset(MOCK_ENTRY_20.utcZoneOfTimestamp)
              .format("YYYY-MM-DD HH:mm"),
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
          rest.delete("/api/entries/1", (req, res, ctx) => {
            return res(
              ctx.status(401),
              ctx.json({
                error: "[mocked-response] Failed to delete the targeted Entry resource",
              })
            );
          })
        );

        // Act.
        const deleteEntryPromise = storeMock.dispatch(deleteEntry(1));

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
        const deleteEntryPromise = storeMock.dispatch(deleteEntry(1));

        await expect(deleteEntryPromise).resolves.toEqual(undefined);

        expect(storeMock.getActions()).toEqual([
          {
            type: "entries/deleteEntry/pending",
          },
          {
            type: "entries/deleteEntry/fulfilled",
            payload: {
              entryId: 1,
            },
          },
        ]);
      }
    );
  }
);

describe("<App>", () => {
  let enhancer: any;
  let initState: IState;
  let history: any;

  beforeAll(() => {
    // Enable API mocking.
    quasiServer.listen();
  });

  beforeEach(() => {
    enhancer = applyMiddleware(thunkMiddleware);

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

    history = createMemoryHistory();
  });

  afterEach(() => {
    quasiServer.resetHandlers();
  });

  afterAll(() => {
    // Disable API mocking.
    quasiServer.close();
  });

  test("initial render (i.e. before/without any user interaction)", async () => {
    quasiServer.use(
      rest.get("/api/user-profile", (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({
            error: "[mocked-response] You have not signed in yet!",
          })
        );
      })
    );

    const realStore = createStore(rootReducer, enhancer);
    const { getByText } = render(
      <Provider store={realStore}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      getByText("Home");
      getByText("Sign In");
      getByText("Sign Up");

      getByText("Welcome to JournalEntries!");
    });
  });

  test("render after the user has signed in", async () => {
    // Arrange.
    const realStore = createStore(rootReducer, initState, enhancer);

    // Act.
    const { getByText } = render(
      <Provider store={realStore}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );

    // Assert.
    await waitFor(() => {
      getByText("Home");
      getByText("JournalEntries");
      getByText("Sign Out");
    });
  });

  test("after the user has signed in, the user clicks on 'Sign Out'", async () => {
    // Arrange.
    const realStore = createStore(rootReducer, initState, enhancer);
    const { getByText } = render(
      <Provider store={realStore}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );

    // Act.
    await waitFor(() => {
      const signOutAnchor = getByText("Sign Out");
      fireEvent.click(signOutAnchor);
    });

    // Assert.
    await waitFor(() => {
      getByText("Home");
      getByText("Sign In");
      getByText("Sign Up");

      getByText("SIGN-OUT SUCCESSFUL");
    });
  });

  test(
    "after the user has signed in, the user clicks on 'Sign Out'" +
      " - that should update the localStorage correctly",
    async () => {
      // Arrange.
      localStorage.setItem(JOURNAL_APP_TOKEN, "a-jws-token-issued-by-the-backend");
      // Strictly speaking, the setup logic for this test case renders
      // the next two statements unnecessary-to-have,
      // but including them is of some instructive value.
      initState.auth.token = localStorage.getItem(JOURNAL_APP_TOKEN);
      initState.auth.hasValidToken = true;

      const realStore = createStore(rootReducer, initState, enhancer);
      const { getByText } = render(
        <Provider store={realStore}>
          <Router history={history}>
            <App />
          </Router>
        </Provider>
      );

      // Act.
      await waitFor(() => {
        const signOutAnchor = getByText("Sign Out");
        fireEvent.click(signOutAnchor);
      });

      // Assert.
      expect(localStorage.getItem(JOURNAL_APP_TOKEN)).toEqual(null);
    }
  );

  test(
    "if a user hasn't signed in" +
      " but manually saves a token in their web-browser's localStorage," +
      " the frontend application should display only the following navigation links:" +
      " 'Home', 'Sign In', 'Sign Up'",
    async () => {
      // Arrange.

      // Strictly speaking, the setup logic for this test case renders
      // the next two statements unnecessary-to-have,
      // but including them is of some instructive value.
      localStorage.setItem(JOURNAL_APP_TOKEN, "a-jws-token-NOT-issued-by-the-backend");
      initState.auth.token = localStorage.getItem(JOURNAL_APP_TOKEN);

      const realStore = createStore(rootReducer, initState, enhancer);

      quasiServer.use(
        rest.get("/api/user-profile", (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              error:
                "[mocked-response] Although state.auth.token is not `null`," +
                " it is invalid",
            })
          );
        })
      );

      // Act.
      const { getByText } = render(
        <Provider store={realStore}>
          <Router history={history}>
            <App />
          </Router>
        </Provider>
      );

      // Assert.
      await waitFor(() => {
        getByText("Home");
        getByText("Sign In");
        getByText("Sign Up");
      });
    }
  );

  test(
    "if a user signs in" +
      " and goes on to manually change the URL in her browser's address bar" +
      " to /journal-entries ," +
      " the frontend application should display only the following navigation links:" +
      " 'Home', 'JournalEntries', and 'Sign Out'",
    async () => {
      // Arrange.
      const realStore = createStore(rootReducer, initState, enhancer);

      // Act:

      // - navigate to the root URL, and mount the application's entire React tree
      history.push("/");

      const { getByText: getByTextFromRootURL } = render(
        <Provider store={realStore}>
          <Router history={history}>
            <App />
          </Router>
        </Provider>
      );

      // - unamount React trees that were mounted with render
      cleanup();

      // - navigate to the /journal-entries URL,
      //   and mount the application's entire React tree
      history.push("/journal-entries");
      const { getByText: getByTextFromJournalEntriesURL } = render(
        <Provider store={realStore}>
          <Router history={history}>
            <App />
          </Router>
        </Provider>
      );

      // Assert.
      await waitFor(() => {
        getByTextFromJournalEntriesURL("Home");
        getByTextFromJournalEntriesURL("Sign Out");
        getByTextFromJournalEntriesURL("JournalEntries");
      });
    }
  );

  test(
    "if a user hasn't signed in" +
      " but manually changes the URL in her browser's address bar" +
      " to /journal-entries ," +
      " the frontend application should redirect the user to /sign-in",
    async () => {
      // Arrange.
      const realStore = createStore(rootReducer, initState, enhancer);

      // Act.
      history.push("/journal-entries");

      const { queryAllByText } = render(
        <Provider store={realStore}>
          <Router history={history}>
            <App />
          </Router>
        </Provider>
      );

      // Assert.
      await waitFor(() => {
        const elements = queryAllByText("Review JournalEntries!");
        expect(elements.length).toEqual(0);
      });
    }
  );
});

describe("<Alerts>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText } = render(
      <Provider store={store}>
        <Alerts />
      </Provider>
    );

    getByText("<Alerts>");
  });

  test(
    "initial render (i.e. before/without any user interaction)" +
      " - illustration of how to assert that" +
      " a function (or other block of code) will throw an error",
    () => {
      const { getByText } = render(
        <Provider store={store}>
          <Alerts />
        </Provider>
      );

      /*
      The official Jest documentation makes the following closely-related statements:
        (
          https://jestjs.io/docs/using-matchers
          >>
          Note:
          the function that throws an exception
          needs to be invoked within a wrapping function[;]
          otherwise[,] the `toThrow` assertion will fail.
        )
      and
        (
          https://jestjs.io/docs/expect
          >>
          You must wrap the code in a function,
          otherwise the error will not be caught and the assertion will fail.
        )
      
      Both of the above statements can be condensed into the following single one:
          If you want to write a test which asserts that
          a function (or other block of code) will throw an error,
          then:
          (a) the function (or block of code) must be invoked
              within a "wrapping function", and
          (b) that "wrapping function" must be passed into Jest's `expect` function.

          Otherwise, the `toThrow` matcher will not catch the error,
          which gets thrown by the input of `expect`,
          _and_ that uncaught error will cause the encompassing test-case to fail.
      */

      /*
      // This won't work:
      expect(getByText("some non-existent alert text")).toThrowError();
      */
      // This works:
      expect(() => getByText("some non-existent alert text")).toThrowError();
    }
  );

  test(
    "the user clicks on the 'X' button," +
      " which is associated with a particular alert message",
    () => {
      const initState = {
        alerts: {
          ids: ["a-id-0", "a-id-1"],
          entities: {
            "a-id-0": {
              id: "a-id-0",
              message: "Alert Message #0",
            },
            "a-id-1": {
              id: "a-id-1",
              message: "Alert Message #1",
            },
          },
        },
        auth: {
          ...initialStateAuth,
          requestStatus: "n/a",
          requestError: "n/a",
        },
        entries: {
          ...initialStateEntries,
        },
      };
      const storeWithAlerts = createStore(rootReducer, initState);
      const { getAllByRole, getByText } = render(
        <Provider store={storeWithAlerts}>
          <Alerts />
        </Provider>
      );

      const buttons = getAllByRole("button");
      fireEvent.click(buttons[0]);

      expect(() => {
        // Use a regex to match a substring:
        getByText(/Alert Message #0/);
      }).toThrowError();
      // Again, use a regex to match a substring:
      getByText(/Alert Message #1/);
    }
  );
});

describe("<SignUp>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText, getAllByRole, getByPlaceholderText } = render(
      <Provider store={store}>
        <SignUp />
      </Provider>
    );

    getByText("Create a new account!");

    const forms = getAllByRole("form");
    expect(forms.length).toEqual(1);

    getByPlaceholderText("Choose a username...");
    getByPlaceholderText("Enter your name...");
    getByPlaceholderText("Enter your email address...");
    getByPlaceholderText("Choose a password...");
    getByPlaceholderText("Repeat the chosen password...");
    getByText("Create an account for me");
  });

  test("the user fills out the form (without submitting it)", () => {
    const { getByPlaceholderText, getByDisplayValue } = render(
      <Provider store={store}>
        <SignUp />
      </Provider>
    );

    const usernameInput = getByPlaceholderText("Choose a username...");
    const nameInput = getByPlaceholderText("Enter your name...");
    const emailInput = getByPlaceholderText("Enter your email address...");
    const passwordInput = getByPlaceholderText("Choose a password...");
    const repeatPasswordInput = getByPlaceholderText("Repeat the chosen password...");

    fireEvent.change(usernameInput, { target: { value: "[f-e] jd" } });
    fireEvent.change(nameInput, { target: { value: "[f-e] John Doe" } });
    fireEvent.change(emailInput, {
      target: { value: "[f-e] john.doe@protonmail.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });
    fireEvent.change(repeatPasswordInput, { target: { value: "[f-e] 456" } });

    getByDisplayValue("[f-e] jd");
    getByDisplayValue("[f-e] John Doe");
    getByDisplayValue("[f-e] john.doe@protonmail.com");
    getByDisplayValue("[f-e] 123");
    getByDisplayValue("[f-e] 456");
  });
});

describe(
  "<Alerts> + <SignUp>" +
    " (without the user interaction triggering any network communication)",
  () => {
    test(
      "the user fills out the form in an invalid way" +
        " (by failing to fill out all required fields) and submits it",
      () => {
        // Arrange.
        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        const { getByPlaceholderText, getByRole, getByText } = render(
          <Provider store={realStore}>
            <Alerts />
            <SignUp />
          </Provider>
        );

        // Act.
        const usernameInput = getByPlaceholderText("Choose a username...");
        const nameInput = getByPlaceholderText("Enter your name...");
        const emailInput = getByPlaceholderText("Enter your email address...");
        const repeatPasswordInput = getByPlaceholderText(
          "Repeat the chosen password..."
        );

        fireEvent.change(usernameInput, { target: { value: "[f-e] jd" } });
        fireEvent.change(nameInput, { target: { value: "[f-e] John Doe" } });
        fireEvent.change(emailInput, {
          target: { value: "[f-e] john.doe@protonmail.com" },
        });
        fireEvent.change(repeatPasswordInput, { target: { value: "[f-e] 123" } });

        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        getByText("YOU MUST FILL OUT ALL FORM FIELDS");
      }
    );

    test(
      "the user fills out the form in an invalid way" +
        " (by providing different texts in the 2 password fields) and submits it",
      () => {
        // Arrange.
        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        const { getByPlaceholderText, getByRole, getByText } = render(
          <Provider store={realStore}>
            <Alerts />
            <SignUp />
          </Provider>
        );

        // Act.
        const usernameInput = getByPlaceholderText("Choose a username...");
        const nameInput = getByPlaceholderText("Enter your name...");
        const emailInput = getByPlaceholderText("Enter your email address...");
        const passwordInput = getByPlaceholderText("Choose a password...");
        const repeatPasswordInput = getByPlaceholderText(
          "Repeat the chosen password..."
        );

        fireEvent.change(usernameInput, { target: { value: "[f-e] jd" } });
        fireEvent.change(nameInput, { target: { value: "[f-e] John Doe" } });
        fireEvent.change(emailInput, {
          target: { value: "[f-e] john.doe@protonmail.com" },
        });
        fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });
        fireEvent.change(repeatPasswordInput, { target: { value: "[f-e] 456" } });

        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        getByText(/THE PROVIDED PASSWORDS DON'T MATCH/);
      }
    );
  }
);

describe(
  "<Alerts> + <SignUp>" +
    " (with the user interaction triggering network communication)",
  () => {
    beforeAll(() => {
      // Enable API mocking.
      quasiServer.listen();
    });

    beforeEach(() => {
      quasiServer.resetHandlers();
    });

    afterAll(() => {
      // Disable API mocking.
      quasiServer.close();
    });

    test(
      "the user fills out the form and submits it," +
        " but the backend is _mocked_ to respond that" +
        " the form was filled out in an invalid way",
      async () => {
        // Arrange.
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

        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        const { getByPlaceholderText, getByRole, getByText } = render(
          <Provider store={realStore}>
            <Alerts />
            <SignUp />
          </Provider>
        );

        // Act.
        const usernameInput = getByPlaceholderText("Choose a username...");
        const nameInput = getByPlaceholderText("Enter your name...");
        const emailInput = getByPlaceholderText("Enter your email address...");
        const passwordInput = getByPlaceholderText("Choose a password...");
        const repeatPasswordInput = getByPlaceholderText(
          "Repeat the chosen password..."
        );

        fireEvent.change(usernameInput, { target: { value: "[f-e] jd" } });
        fireEvent.change(nameInput, { target: { value: "[f-e] John Doe" } });
        fireEvent.change(emailInput, {
          target: { value: "[f-e] john.doe@protonmail.com" },
        });
        fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });
        fireEvent.change(repeatPasswordInput, { target: { value: "[f-e] 123" } });

        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        /*
        // This throws, causing the test to FAIL:
        getByText("This text is not in the DOM so ...");
        
        // This causes the test to PASS:
        expect(() => getByText("This text is not in the DOM so ...")).toThrowError();
        */

        /*
        // This causes the test to PASS: 
        getByText("Create an account for me");

        // This causes the test to FAIL:
        expect(() => getByText("Create an account for me")).toThrowError();
        */

        /*
        // This throws, causing the test to FAIL:
        getByText("[mocked-response] Failed to create a new User resource");
        */
        // This causes the test to PASS:
        await waitFor(() => {
          getByText("[mocked-response] Failed to create a new User resource");
        });
      }
    );

    test(
      "the user fills out the form and submits it," +
        " and the backend is _mocked_ to respond that" +
        " the form submission was accepted as valid and processed",
      async () => {
        // Arrange.
        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        const { getByPlaceholderText, getByRole, getByText } = render(
          <Provider store={realStore}>
            <Alerts />
            <SignUp />
          </Provider>
        );

        // Act.
        const usernameInput = getByPlaceholderText("Choose a username...");
        const nameInput = getByPlaceholderText("Enter your name...");
        const emailInput = getByPlaceholderText("Enter your email address...");
        const passwordInput = getByPlaceholderText("Choose a password...");
        const repeatPasswordInput = getByPlaceholderText(
          "Repeat the chosen password..."
        );

        fireEvent.change(usernameInput, { target: { value: "[f-e] jd" } });
        fireEvent.change(nameInput, { target: { value: "[f-e] John Doe" } });
        fireEvent.change(emailInput, {
          target: { value: "[f-e] john.doe@protonmail.com" },
        });
        fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });
        fireEvent.change(repeatPasswordInput, { target: { value: "[f-e] 123" } });

        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        await waitFor(() => {
          getByText("REGISTRATION SUCCESSFUL");
        });
      }
    );
  }
);

describe("<SignUp> + <Home>", () => {
  test(
    "if a(n already registered) user has already signed in" +
      " and then tries to navigate to /sign-up," +
      " she should be redirected to /",
    () => {
      // Arrange.
      const token = "pretend-that-this-was-actually-issued-by-the-backend";
      localStorage.setItem(JOURNAL_APP_TOKEN, token);

      const initState = {
        alerts: {
          ...initialStateAlerts,
        },
        auth: {
          ...initialStateAuth,
          token,
          hasValidToken: true,
          signedInUserProfile: profileMock,
        },
        entries: {
          ...initialStateEntries,
        },
      };
      const enhancer = applyMiddleware(thunkMiddleware);
      const realStore = createStore(rootReducer, initState, enhancer);

      const history = createMemoryHistory();

      // Act.
      history.push("/sign-up");

      const { getByText } = render(
        <Provider store={realStore}>
          <Router history={history}>
            <Route exact path="/sign-up">
              <SignUp />
            </Route>
            <Route exact path="/">
              <Home />
            </Route>
          </Router>
        </Provider>
      );

      // Assert.
      getByText("Hello, [mocked] John Doe!");
    }
  );
});

describe("<SignIn>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText, getAllByRole, getByPlaceholderText } = render(
      <Provider store={store}>
        <SignIn />
      </Provider>
    );

    getByText("Log in to your account!");

    const forms = getAllByRole("form");
    expect(forms.length).toEqual(1);

    getByPlaceholderText("Enter your email...");
    getByPlaceholderText("Enter your password...");
    getByText("Sign me in");
  });

  test("the user fills out the form (without submitting it)", () => {
    const { getByPlaceholderText, getByDisplayValue } = render(
      <Provider store={store}>
        <SignIn />
      </Provider>
    );

    const emailInput = getByPlaceholderText("Enter your email...");
    const passwordInput = getByPlaceholderText("Enter your password...");

    fireEvent.change(emailInput, { target: { value: "[f-e] jd" } });
    fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });

    getByDisplayValue("[f-e] jd");
    getByDisplayValue("[f-e] 123");
  });
});

describe(
  "<Alerts> + <SignIn>" +
    " (without the user interaction triggering any network communication)",
  () => {
    test(
      "the user fills out the form in an invalid way" +
        " (by failing to fill out all required fields) and submits it",
      () => {
        // Arrange.
        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        const { getByPlaceholderText, getByRole, getByText } = render(
          <Provider store={realStore}>
            <Alerts />
            <SignIn />
          </Provider>
        );

        // Act.
        const emailInput = getByPlaceholderText("Enter your email...");
        const passwordInput = getByPlaceholderText("Enter your password...");

        fireEvent.change(emailInput, { target: { value: "" } });
        fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });

        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        getByText("YOU MUST FILL OUT ALL FORM FIELDS");
      }
    );
  }
);

describe(
  "<Alerts> + <SignIn>" +
    " (with the user interaction triggering network communication)",
  () => {
    let realStore: any;

    beforeAll(() => {
      // Enable API mocking.
      quasiServer.listen();
    });

    beforeEach(() => {
      quasiServer.resetHandlers();

      const enhancer = applyMiddleware(thunkMiddleware);
      realStore = createStore(rootReducer, enhancer);
    });

    afterAll(() => {
      // Disable API mocking.
      quasiServer.close();
    });

    test(
      "the user fills out the form and submits it," +
        " but the backend is _mocked_ to respond that" +
        " the form was filled out in an invalid way",
      async () => {
        // Arrange.
        quasiServer.use(
          rest.post("/api/tokens", (req, res, ctx) => {
            return res(
              ctx.status(401),
              ctx.json({
                error:
                  "[mocked response] Authenticaiton failed" +
                  " - incorrect email and/or password",
              })
            );
          })
        );

        const { getByPlaceholderText, getByRole, getByText } = render(
          <Provider store={realStore}>
            <Alerts />
            <SignIn />
          </Provider>
        );

        // Act.
        const emailInput = getByPlaceholderText("Enter your email...");
        const passwordInput = getByPlaceholderText("Enter your password...");

        fireEvent.change(emailInput, { target: { value: "[f-e] jd" } });
        fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });

        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        await waitFor(() => {
          getByText(
            "[mocked response] Authenticaiton failed - incorrect email and/or password"
          );
        });
      }
    );

    test(
      "the user fills out the form and submits it," +
        " and the backend is _mocked_ to respond that" +
        " the form submission was accepted as valid and processed",
      async () => {
        // Arrange.
        const history = createMemoryHistory();
        history.push("/sign-in");

        const { getByPlaceholderText, getByRole, getByText } = render(
          <Provider store={realStore}>
            <Router history={history}>
              <Alerts />
              <Switch>
                <Route exact path="/sign-in">
                  <SignIn />
                </Route>
              </Switch>
            </Router>
          </Provider>
        );

        // Act.
        const emailInput = getByPlaceholderText("Enter your email...");
        const passwordInput = getByPlaceholderText("Enter your password...");

        fireEvent.change(emailInput, { target: { value: "[f-e] jd" } });
        fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });

        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        await waitFor(() => {
          getByText("SIGN-IN SUCCESSFUL");
        });

        expect(history.location.pathname).toEqual("/");
      }
    );
  }
);

describe("<Home>", () => {
  test("initial render (i.e. before/without any user interaction)", async () => {
    // Arrange.
    const initState = {
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        ...initialStateAuth,
        signedInUserProfile: null,
      },
      entries: {
        ...initialStateEntries,
      },
    };
    const enhancer = applyMiddleware(thunkMiddleware);
    const realStore = createStore(rootReducer, initState, enhancer);

    const { getByText } = render(
      <Provider store={realStore}>
        <Home />
      </Provider>
    );

    // Assert.
    getByText("Welcome to JournalEntries!");
  });

  test("render after a user has successfully signed in", async () => {
    // Arrange.
    const initState = {
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        ...initialStateAuth,
        signedInUserProfile: profileMock,
      },
      entries: {
        ...initialStateEntries,
      },
    };
    const enhancer = applyMiddleware(thunkMiddleware);
    const realStore = createStore(rootReducer, initState, enhancer);

    const { getByText } = render(
      <Provider store={realStore}>
        <Home />
      </Provider>
    );

    // Assert.
    getByText("Hello, [mocked] John Doe!");
  });
});

describe("<JournalEntries> - initial render", () => {
  beforeAll(() => {
    // Enable API mocking.
    quasiServer.listen();
  });

  beforeEach(() => {
    quasiServer.resetHandlers();
  });

  afterAll(() => {
    // Disable API mocking.
    quasiServer.close();
  });

  test(
    "(<Alerts> + <JournalEntries>) a GET request is issued to /api/entries" +
      " as part of the effect function, but the backend is _mocked_ to reject" +
      " the client-provided authentication credential as invalid",
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

      const initState = {
        alerts: {
          ...initialStateAlerts,
        },
        auth: {
          ...initialStateAuth,
          signedInUserProfile: {
            id: 17,
            username: "[mocked] jd",
            name: "[mocked] John Doe",
            email: "[mocked] john.doe@protonmail.com",
            createdAt: "[mocked] 2021-05-24T20:10:17.000Z",
            updatedAt: "[mocked] 2021-05-24T20:10:17.000Z",
          },
        },
        entries: {
          ...initialStateEntries,
        },
      };
      const enhancer = applyMiddleware(thunkMiddleware);
      const realStore = createStore(rootReducer, initState, enhancer);

      // Act.
      const { getByText, getByRole } = render(
        <Provider store={realStore}>
          <BrowserRouter>
            <Alerts />
            <JournalEntries />
          </BrowserRouter>
        </Provider>
      );

      // Assert.
      await waitFor(() => {
        getByRole("button");
        getByText("[FROM <JournalEntries>'S useEffect HOOK] PLEASE SIGN BACK IN");
      });
    }
  );

  test(
    "(<Alerts> + <JournalEntries>) a GET request is issued to /api/entries" +
      " as part of the effect function, but the backend is _mocked_ to respond" +
      " with an error, which is not related to authentication",
    async () => {
      // Arrange.
      quasiServer.use(
        rest.get("/api/entries", (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              error:
                "[mocked-response] Encountered an error," +
                " which is not related to authentication",
            })
          );
        })
      );

      const enhancer = applyMiddleware(thunkMiddleware);
      const realStore = createStore(rootReducer, enhancer);

      // Act.
      const { getByText } = render(
        <Provider store={realStore}>
          <BrowserRouter>
            <Alerts />
            <JournalEntries />
          </BrowserRouter>
        </Provider>
      );

      // Assert.
      await waitFor(() => {
        getByText(
          "[mocked-response] Encountered an error," +
            " which is not related to authentication"
        );
      });
    }
  );

  test(
    "a GET request is issued to /api/entries" +
      " as part of the effect function, and the backend is _mocked_ to accept" +
      " the client-provided authentication credential as valid",
    async () => {
      const initState = {
        alerts: {
          ...initialStateAlerts,
        },
        auth: {
          ...initialStateAuth,
          signedInUserProfile: {
            id: 17,
            username: "[mocked] jd",
            name: "[mocked] John Doe",
            email: "[mocked] john.doe@protonmail.com",
            createdAt: "[mocked] 2021-05-24T20:10:17.000Z",
            updatedAt: "[mocked] 2021-05-24T20:10:17.000Z",
          },
        },
        entries: {
          ...initialStateEntries,
        },
      };
      const enhancer = applyMiddleware(thunkMiddleware);
      const realStore = createStore(rootReducer, initState, enhancer);

      const { getByText, getAllByText } = render(
        <Provider store={realStore}>
          <BrowserRouter>
            <JournalEntries />
          </BrowserRouter>
        </Provider>
      );

      getByText("Review JournalEntries!");
      getByText("Create a new entry");

      await waitFor(() => {
        getByText("mocked-content-of-entry-1");
        getByText("mocked-content-of-entry-20");
      });

      const editLinks = getAllByText("Edit");
      expect(editLinks.length).toEqual(2);
    }
  );
});

describe("<CreateEntry>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getAllByRole, getByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <CreateEntry />
      </Provider>
    );

    const textboxes = getAllByRole("textbox");
    expect(textboxes.length).toEqual(2);

    getByText("You are about to create a new Entry:");

    getByText("Specify your current local time:");
    getByPlaceholderText("YYYY-MM-DD HH:MM");

    getByText("Specify the time zone that you are currently in:");

    getByText("Type up the content of your new Entry:");

    getByText("Create entry");
  });

  test("the user fills out the form (without submitting it)", () => {
    // Arrange.
    const { getAllByRole, getByRole, getByDisplayValue, getByText } = render(
      <Provider store={store}>
        <CreateEntry />
      </Provider>
    );

    // Act.
    const [localTimeInput, contentTextArea] = getAllByRole("textbox");
    const timezoneSelect = getByRole("combobox");

    fireEvent.change(localTimeInput, { target: { value: "2021-05-13 00:18" } });
    fireEvent.change(contentTextArea, {
      target: {
        value:
          "'The genius can do many things. But he does only one thing at a time.'" +
          " - Matthew McConaughey",
      },
    });

    fireEvent.change(timezoneSelect, { target: { value: "-08:00" } });

    // Assert.
    /*
    The next statement (implicitly but also effectively) makes an assertion
    about the "current value" of one <input> tag.

    It is worth emphasizing that
    the <input> tag in question doesn't need to include a `value` attribute
    _but_ including it makes the encompasssing test case more friendly/tractable.
    To wit:

      - on the one hand, if the string within the next statement is changed,
        the encompassing test case will fail - which is what one would expect to happen

      - on the other hand, if the <input> tag is rid of its `value` attribute
        and if the string within the next statement is changed,
        the encompassing test case will fail
        _but_ its error message will not indicate the actual "display value" of the
        <input> tag
    */
    getByDisplayValue("2021-05-13 00:18");
    /*
    Replacing the next statement's "-08:00" with "-07:00" causes this test to crash
    and prints out an error message.

    TODO: find out whether the error message can be forced to indicate
          which `<option>` tag is actually `selected`
    */
    getByDisplayValue("-08:00");
    /*
    The next statement (implicitly but also effectively) makes an assertion
    about the "text content" of one <textarea> tag.

    It is worth emphasizing that
    the <textarea> tag in question _needs_ to include a `value` attribute.
    To wit:

      - on the one hand, if the string within the next statement is changed,
        the encompassing test case will fail - which is what one would expect to happen
  
      - on the other hand, if the <textarea> tag is rid of its `value` attribute
        and if the string within the next statement remains unchanged,
        the encompassing test will fail
    */
    getByText(
      "'The genius can do many things. But he does only one thing at a time.'" +
        " - Matthew McConaughey"
    );
  });
});

describe(
  "<Alerts> + <CreateEntry>" +
    " (without the user interaction triggering any network communication)",
  () => {
    test(
      "the user fills out the form in an invalid way" +
        " (by failing to fill out all required fields) and submits it",
      () => {
        // Arrange.
        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        const { getAllByRole, getByRole, getByText } = render(
          <Provider store={realStore}>
            <Alerts />
            <CreateEntry />
          </Provider>
        );

        // Act.
        const [localTimeInput, contentTextArea] = getAllByRole("textbox");

        fireEvent.change(localTimeInput, { target: { value: "2021-05-13 00:18" } });
        fireEvent.change(contentTextArea, {
          target: {
            value:
              "'The genius can do many things. But he does only one thing at a time.'" +
              " - Matthew McConaughey",
          },
        });

        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        getByText("YOU MUST FILL OUT ALL FORM FIELDS");
      }
    );
  }
);

describe(
  "<Alerts> + <CreateEntry>" +
    " (with the user interaction triggering network communication)",
  () => {
    beforeAll(() => {
      // Enable API mocking.
      quasiServer.listen();
    });

    beforeEach(() => {
      quasiServer.resetHandlers();
    });

    afterAll(() => {
      // Disable API mocking.
      quasiServer.close();
    });

    test(
      "the user fills out the form and submits it," +
        " but the backend is _mocked_ to respond that" +
        " the form was filled out in an invalid way",
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

        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        const { getAllByRole, getByRole, getByText } = render(
          <Provider store={realStore}>
            <Alerts />
            <CreateEntry />
          </Provider>
        );

        // Act.
        const [localTimeInput, contentTextArea] = getAllByRole("textbox");
        const timezoneSelect = getByRole("combobox");

        fireEvent.change(localTimeInput, { target: { value: "2021-05-13 00:18" } });
        fireEvent.change(timezoneSelect, { target: { value: "-08:00" } });
        fireEvent.change(contentTextArea, {
          target: { value: "some insightful content" },
        });

        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        await waitFor(() => {
          getByText("[mocked-response] Failed to create a new Entry resource");
        });
      }
    );

    test(
      "the user fills out the form and submits it," +
        " but the backend is _mocked_ to respond that" +
        " the user's JWS Token is no longer valid",
      async () => {
        // Arrange.
        quasiServer.use(
          rest.post("/api/entries", (req, res, ctx) => {
            return res(
              ctx.status(401),
              ctx.json({
                error: "[mocked-response] Your JWS Token is no longer valid",
              })
            );
          })
        );

        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        const { getAllByRole, getByRole, getByText } = render(
          <Provider store={realStore}>
            <Alerts />
            <CreateEntry />
          </Provider>
        );

        // Act.
        const [localTimeInput, contentTextArea] = getAllByRole("textbox");
        const timezoneSelect = getByRole("combobox");

        fireEvent.change(localTimeInput, { target: { value: "2021-05-13 00:18" } });
        fireEvent.change(timezoneSelect, { target: { value: "-08:00" } });
        fireEvent.change(contentTextArea, {
          target: { value: "some insightful content" },
        });

        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        await waitFor(() => {
          getByText("[FROM <CreateEntry>'S handleSubmit] PLEASE SIGN BACK IN");
        });
      }
    );

    test(
      "the user fills out the form and submits it," +
        " and the backend is _mocked_ to respond that" +
        " the form submission was accepted as valid and processed",
      async () => {
        // Arrange.
        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        const history = createMemoryHistory();
        history.push("/entries/create");

        const { getAllByRole, getByRole, getByText } = render(
          <Provider store={realStore}>
            <Alerts />
            <Router history={history}>
              <Route exact path="/entries/create">
                <CreateEntry />
              </Route>
            </Router>
          </Provider>
        );

        // Act.
        const [localTimeInput, contentTextArea] = getAllByRole("textbox");
        const timezoneSelect = getByRole("combobox");

        fireEvent.change(localTimeInput, { target: { value: "2021-05-13 00:18" } });
        fireEvent.change(timezoneSelect, { target: { value: "-08:00" } });
        fireEvent.change(contentTextArea, {
          target: { value: "some insightful content " },
        });

        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        await waitFor(() => {
          getByText("ENTRY CREATION SUCCESSFUL");
        });

        expect(history.location.pathname).toEqual("/journal-entries");
      }
    );
  }
);

describe("<EditEntry>", () => {
  let history;
  let realStore;

  beforeEach(() => {
    const initState: IState = {
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: "succeeded",
        requestError: null,
        token: "token-issued-by-the-backend",
        hasValidToken: true,
        signedInUserProfile: null,
      },
      entries: {
        requestStatus: "succeeded",
        requestError: null,
        ids: [MOCK_ENTRY_1.id],
        entities: {
          [MOCK_ENTRY_1.id]: MOCK_ENTRY_1,
        },
      },
    };
    const enhancer = applyMiddleware(thunkMiddleware);
    realStore = createStore(rootReducer, initState, enhancer);

    history = createMemoryHistory();
    const route = "/entries/1/edit";
    history.push(route);
  });

  describe("by itself", () => {
    test("initial render (i.e. before/without any user interaction)", () => {
      // Act.
      const { getByText, getAllByText, getByDisplayValue } = render(
        <Provider store={realStore}>
          <Router history={history}>
            <Route exact path="/entries/:id/edit">
              <EditEntry />
            </Route>
          </Router>
        </Provider>
      );

      // Assert.
      getByText("2020-12-01 15:17 (UTC +00:00)");

      const elementsWithTheEntryContent = getAllByText("mocked-content-of-entry-1");
      expect(elementsWithTheEntryContent.length).toEqual(2);

      getByDisplayValue("2020-12-01 17:17");
      getByDisplayValue("+02:00");
    });

    test("the user fills out the form (without submitting it)", () => {
      // Arrange.
      const { getAllByRole, getByRole, getByDisplayValue } = render(
        <Provider store={realStore}>
          <Router history={history}>
            <Route exact path="/entries/:id/edit">
              <EditEntry />
            </Route>
          </Router>
        </Provider>
      );

      // Act.
      /*
      Unlike the corresponding test case for <CreateEntry>,
      the remainder of this test case
      acts upon and makes assertions about rendered HTML elements
      in the same order as they are rendered on the DOM.
      */
      const [localTimeInput, contentTextArea] = getAllByRole("textbox");
      const timezoneSelect = getByRole("combobox");

      fireEvent.change(localTimeInput, { target: { value: "1999-01-01 03:00" } });
      fireEvent.change(timezoneSelect, { target: { value: "+01:00" } });
      fireEvent.change(contentTextArea, {
        target: {
          value: "This is an Entry resource, all of whose details have been edited.",
        },
      });

      // Assert.
      getByDisplayValue("1999-01-01 03:00");
      getByDisplayValue("+01:00");
      getByDisplayValue(
        "This is an Entry resource, all of whose details have been edited."
      );
    });
  });

  describe(
    "+ <Alerts>" +
      " (without the user interaction triggering any network communication)",
    () => {
      test(
        "the user fills out the form in an invalid way" +
          " (by failing to fill out all required fields) and submits it",
        () => {
          // Arrange.
          const { getByRole, getByText } = render(
            <Provider store={realStore}>
              <Router history={history}>
                <Alerts />
                <Route exact path="/entries/:id/edit">
                  <EditEntry />
                </Route>
              </Router>
            </Provider>
          );

          // Act.
          const timezoneSelect = getByRole("combobox");
          fireEvent.change(timezoneSelect, { target: { value: "" } });

          const button = getByRole("button");
          fireEvent.click(button);

          // Assert.
          getByText("YOU MUST FILL OUT ALL FORM FIELDS");
        }
      );
    }
  );

  describe("+ <Alerts> (with the user interaction triggering network communication)", () => {
    beforeAll(() => {
      // Enable API mocking.
      quasiServer.listen();
    });

    beforeEach(() => {
      quasiServer.resetHandlers();
    });

    afterAll(() => {
      // Disable API mocking.
      quasiServer.close();
    });

    test(
      "the user fills out the form and submits it," +
        " but the backend is _mocked_ to respond that" +
        " the form was filled out in an invalid way",
      async () => {
        // Arrange.
        quasiServer.use(
          rest.put("/api/entries/1", (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({
                error: "[mocked-response] Failed to edit the targeted Entry resource",
              })
            );
          })
        );

        const { getByRole, getByText } = render(
          <Provider store={realStore}>
            <Router history={history}>
              <Alerts />
              <Route exact path="/entries/:id/edit">
                <EditEntry />
              </Route>
            </Router>
          </Provider>
        );

        // Act.
        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        await waitFor(() => {
          getByText("[mocked-response] Failed to edit the targeted Entry resource");
        });
      }
    );

    test(
      "the user fills out the form and submits it," +
        " but the backend is _mocked_ to respond that" +
        " the user's JWS Token is no longer valid",
      async () => {
        // Arrange.
        quasiServer.use(
          rest.put("/api/entries/1", (req, res, ctx) => {
            return res(
              ctx.status(401),
              ctx.json({
                error: "[mocked-response] Your JWS Token is no longer valid",
              })
            );
          })
        );

        const { getByRole, getByText } = render(
          <Provider store={realStore}>
            <Router history={history}>
              <Alerts />
              <Route exact path="/sign-in">
                <SignIn />
              </Route>
              <PrivateRoute exact path="/entries/:id/edit">
                <EditEntry />
              </PrivateRoute>
            </Router>
          </Provider>
        );

        // Act.
        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        await waitFor(() => {
          getByText("[FROM <EditEntry>'S handleSubmit] PLEASE SIGN BACK IN");
        });
      }
    );

    test(
      "the user fills out the form and submits it," +
        " and the backend is _mocked_ to respond that" +
        " the form submission was accepted as valid and processed",
      async () => {
        // Arrange.
        const { getByRole, getByText } = render(
          <Provider store={realStore}>
            <Router history={history}>
              <Alerts />
              <Switch>
                <Route exact path="/entries/:id/edit">
                  <EditEntry />
                </Route>
              </Switch>
            </Router>
          </Provider>
        );

        // Act.
        const button = getByRole("button");
        fireEvent.click(button);

        // Assert.
        await waitFor(() => {
          getByText("ENTRY EDITING SUCCESSFUL");
        });

        expect(history.location.pathname).toEqual("/journal-entries");
      }
    );
  });
});

describe("<DeleteEntryLink>", () => {
  let history: any;

  beforeEach(() => {
    history = createMemoryHistory();
  });

  test("initial render", () => {
    const { getByText } = render(
      <Router history={history}>
        <DeleteEntryLink to="/entries/17/delete" />
      </Router>
    );

    getByText("Delete");
  });

  test(
    "the user hovers her mouse" +
      " first over the anchor tag, and then away from that tag",
    () => {
      // Arrange.
      const { getByText, queryByText } = render(
        <Router history={history}>
          <DeleteEntryLink to="/entries/17/delete" />
        </Router>
      );

      const deleteAnchor = getByText("Delete");

      // Act.
      fireEvent.mouseEnter(deleteAnchor);

      // Assert.
      getByText("(HINT: After clicking, you will be asked to confirm your choice.)");

      // Act.
      fireEvent.mouseLeave(deleteAnchor);

      // Assert.
      const hint = queryByText(
        "(HINT: After clicking, you will be asked to confirm your choice.)"
      );
      expect(hint).toEqual(null);
    }
  );
});

describe("<DeleteEntry>", () => {
  let history;
  let realStore;

  beforeEach(() => {
    const initState: IState = {
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: "succeeded",
        requestError: null,
        token: "token-issued-by-the-backend",
        hasValidToken: true,
        signedInUserProfile: null,
      },
      entries: {
        requestStatus: "succeeded",
        requestError: null,
        _meta: _metaMock,
        _links: _linksMock,
        ids: MOCK_ENTRIES_IDS,
        entities: MOCK_ENTRIES_ENTITIES,
      },
    };
    const enhancer = applyMiddleware(thunkMiddleware);
    realStore = createStore(rootReducer, initState, enhancer);

    history = createMemoryHistory();
    const route = "/entries/1/delete";
    history.push(route);
  });

  describe("without the user interaction triggering any network communication", () => {
    test("initial render (i.e. before/without any user interaction)", () => {
      // Act.
      const { getByText, getAllByRole, getByRole } = render(
        <Provider store={realStore}>
          <Router history={history}>
            <PrivateRoute exact path="/entries/:id/delete">
              <DeleteEntry />
            </PrivateRoute>
          </Router>
        </Provider>
      );

      // Assert.
      getByText("You are about to delete the following Entry:");

      getByText("2020-12-01 15:17 (UTC +00:00)");
      getByText(MOCK_ENTRY_1.content);

      getByText("Do you want to delete the selected Entry?");
      getByRole("button", { name: "Yes" });
      getByRole("button", { name: "No" });
    });

    test("the user clicks the 'No' button, which should redirect to /journal-entries", () => {
      // Arrange.
      const { getByRole, getByText } = render(
        <Provider store={realStore}>
          <Router history={history}>
            <PrivateRoute exact path="/journal-entries">
              <JournalEntries />
            </PrivateRoute>
            <PrivateRoute exact path="/entries/:id/delete">
              <DeleteEntry />
            </PrivateRoute>
          </Router>
        </Provider>
      );

      const buttonNo = getByRole("button", { name: "No" });

      // Act.
      fireEvent.click(buttonNo);

      // Assert.
      getByText("Review JournalEntries!");

      expect(history.location.pathname).toEqual("/journal-entries");
    });
  });

  describe("with the user interaction triggering network communication", () => {
    beforeAll(() => {
      // Enable API mocking.
      quasiServer.listen();
    });

    beforeEach(() => {
      quasiServer.resetHandlers();
    });

    afterAll(() => {
      // Disable API mocking.
      quasiServer.close();
    });

    test(
      "the user clicks on the 'Yes' button," +
        " but the backend is _mocked_ to respond that" +
        " the user's JWS Token is no longer valid",
      async () => {
        // Arrange.
        quasiServer.use(
          rest.delete("/api/entries/1", (req, res, ctx) => {
            return res(
              ctx.status(401),
              ctx.json({
                error: "[mocked-response] Your JWS Token is no longer valid",
              })
            );
          })
        );

        const { getByRole, getByText } = render(
          <Provider store={realStore}>
            <Router history={history}>
              <Alerts />
              <Route exact path="/sign-in">
                <SignIn />
              </Route>
              <PrivateRoute exact path="/entries/:id/delete">
                <DeleteEntry />
              </PrivateRoute>
            </Router>
          </Provider>
        );

        // Act.
        const buttonYes = getByRole("button", { name: "Yes" });
        fireEvent.click(buttonYes);

        // Assert.
        await waitFor(() => {
          getByText("[FROM <DeleteEntry>'S handleClickYes] PLEASE SIGN BACK IN");
        });

        await waitFor(() => {
          expect(history.location.pathname).toEqual("/sign-in");

          getByText("Sign me in");
        });
      }
    );

    test(
      "the user clicks on the 'Yes' button," +
        " but the backend is _mocked_ to respond" +
        " with an error, which is not related to authentication",
      async () => {
        // Arrange.
        quasiServer.use(
          rest.delete("/api/entries/1", (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({
                error:
                  "[mocked-response] Encountered an error," +
                  " which is not related to authentication",
              })
            );
          })
        );

        const { getByRole, getByText } = render(
          <Provider store={realStore}>
            <Router history={history}>
              <Alerts />
              <PrivateRoute exact path="/entries/:id/delete">
                <DeleteEntry />
              </PrivateRoute>
            </Router>
          </Provider>
        );

        // Act.
        const buttonYes = getByRole("button", { name: "Yes" });
        fireEvent.click(buttonYes);

        // Assert.
        await waitFor(() => {
          getByText(
            "[mocked-response] Encountered an error, which is not related to authentication"
          );
        });
      }
    );

    test(
      "the user clicks on the 'Yes' button," +
        " and the backend is _mocked_ to respond that" +
        " the DELETE request was accepted as valid and processed",
      async () => {
        // Arrange.
        render(
          <Provider store={realStore}>
            <Router history={history}>
              <Alerts />
              <Switch>
                <Route exact path="/entries/:id/delete">
                  <DeleteEntry />
                </Route>
              </Switch>
            </Router>
          </Provider>
        );

        const buttonYes = screen.getByRole("button", { name: "Yes" });

        // Act.
        fireEvent.click(buttonYes);

        // Assert.
        await waitFor(() => {
          /*
          As soon as the Redux store is notified
          that the targeted Entry resource has been successfully deleted,
          the corresponding change of the Redux state
          causes the UI to re-render <DeleteEntry>
          - importantly, that re-rendering takes places
            before the UI redirects the browser to /journal-entries
          */
          screen.getByText("Loading...");
        });

        screen.getByText("ENTRY DELETION SUCCESSFUL");

        expect(history.location.pathname).toEqual("/journal-entries");
      }
    );
  });
});

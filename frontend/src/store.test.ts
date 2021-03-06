import { MockStoreEnhanced } from "redux-mock-store";
import configureMockStore from "redux-mock-store";
import thunkMiddleware from "redux-thunk";

import {
  IAlert,
  IEntry,
  IPaginationLinks,
  IPaginationMeta,
  IProfile,
  IState,
  RequestStatus,
} from "./types";

import {
  MOCK_ALERTS_ENTITIES,
  MOCK_ALERTS_IDS,
  MOCK_ENTRIES_ENTITIES,
  MOCK_ENTRIES_IDS,
  MOCK_LINKS,
  MOCK_META,
  MOCK_PROFILE_1,
} from "./mockPiecesOfData";
import {
  selectAlertsEntities,
  selectAlertsIds,
  selectAuthRequestStatus,
  selectEntriesEntities,
  selectEntriesIds,
  selectEntriesLinks,
  selectEntriesMeta,
  selectHasValidToken,
  selectSignedInUserProfile,
  signOut,
  INITIAL_STATE,
} from "./store";

describe("selectors", () => {
  const initSt: IState = {
    alerts: {
      ids: MOCK_ALERTS_IDS,
      entities: MOCK_ALERTS_ENTITIES,
    },
    auth: {
      requestStatus: RequestStatus.SUCCEEDED,
      requestError: null,
      token: "a-jws-token-issued-by-the-backend",
      hasValidToken: true,
      signedInUserProfile: MOCK_PROFILE_1,
    },
    entries: {
      requestStatus: RequestStatus.SUCCEEDED,
      requestError: null,
      _meta: MOCK_META,
      _links: MOCK_LINKS,
      ids: MOCK_ENTRIES_IDS,
      entities: MOCK_ENTRIES_ENTITIES,
    },
  };

  test("selectAlertsIds", () => {
    const alertsIds: string[] = selectAlertsIds(initSt);

    expect(alertsIds).toEqual(MOCK_ALERTS_IDS);
  });

  test("selectAlertsEntities", () => {
    const alertsEntities: { [alertId: string]: IAlert } = selectAlertsEntities(initSt);

    expect(alertsEntities).toEqual(MOCK_ALERTS_ENTITIES);
  });

  test("selectAuthRequestStatus", () => {
    const authRequestStatus: RequestStatus = selectAuthRequestStatus(initSt);

    expect(authRequestStatus).toEqual(RequestStatus.SUCCEEDED);
  });

  test("selectHasValidToken", () => {
    const hasValidToken: boolean | null = selectHasValidToken(initSt);

    expect(hasValidToken).toEqual(true);
  });

  test("selectSignedInUserProfile", () => {
    const signedInUserProfile: IProfile | null = selectSignedInUserProfile(initSt);

    expect(signedInUserProfile).toEqual(MOCK_PROFILE_1);
  });

  test("selectEntriesMeta", () => {
    const entriesMeta: IPaginationMeta = selectEntriesMeta(initSt);

    expect(entriesMeta).toEqual(MOCK_META);
  });

  test("selectEntriesLinks", () => {
    const entriesLinks: IPaginationLinks = selectEntriesLinks(initSt);

    expect(entriesLinks).toEqual(MOCK_LINKS);
  });

  test("selectEntriesIds", () => {
    const entriesIds: number[] = selectEntriesIds(initSt);

    expect(entriesIds).toEqual(MOCK_ENTRIES_IDS);
  });

  test("selectEntriesEntities", () => {
    const entriesEntities: { [entryId: string]: IEntry } =
      selectEntriesEntities(initSt);

    expect(entriesEntities).toEqual(MOCK_ENTRIES_ENTITIES);
  });
});

const createStoreMock = configureMockStore([thunkMiddleware]);

describe(
  "dispatching of sync thunk-actions," +
    " with each test case focusing on the action-related logic only" +
    " (and thus completely disregarding the reducer-related logic) ",
  () => {
    let initSt: IState;
    let storeMock: MockStoreEnhanced<unknown, {}>;

    beforeEach(() => {
      initSt = {
        ...INITIAL_STATE,
      };
      storeMock = createStoreMock(initSt);
    });

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
  }
);

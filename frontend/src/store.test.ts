import { MockStoreEnhanced } from "redux-mock-store";
import configureMockStore from "redux-mock-store";
import thunkMiddleware from "redux-thunk";

import { IState, RequestStatus } from "./types";
import { initialStateAuth, initialStateEntries } from "./constants";

import { MOCK_ALERT_17 } from "./testHelpers";
import { rootReducer, signOut, store } from "./store";

describe("reducers", () => {
  let initState: IState;

  beforeEach(() => {
    initState = {
      ...store.getState(),
    };
  });

  test(
    "an action, which the rootReducer doesn't specifically handle," +
      " should not modify the state",
    () => {
      const initState: IState = {
        alerts: {
          ids: [MOCK_ALERT_17.id],
          entities: {
            [MOCK_ALERT_17.id]: MOCK_ALERT_17,
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
});

const createStoreMock = configureMockStore([thunkMiddleware]);

describe(
  "dispatching of async thunk-actions," +
    " with each test case focusing on the action-related logic only" +
    " (and thus completely disregarding the reducer-related logic) ",
  () => {
    let initSt: IState;
    let storeMock: MockStoreEnhanced<unknown, {}>;

    beforeEach(() => {
      initSt = {
        ...store.getState(),
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

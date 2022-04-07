import { IStateAuth } from "../../types";
import { INITIAL_STATE_AUTH } from "../../constants";
import {
  ActionTypesCreateUser,
  ActionTypesFetchProfile,
  ActionTypesIssueJWSToken,
  ACTION_TYPE_CLEAR_AUTH_SLICE,
  authReducer,
  clearAuthSlice,
  createUserFulfilled,
  createUserPending,
  createUserRejected,
  fetchProfileFulfilled,
  fetchProfilePending,
  fetchProfileRejected,
  IActionClearAuthSlice,
  IActionCreateUserFulfilled,
  IActionCreateUserPending,
  IActionCreateUserRejected,
  IActionFetchProfileFulfilled,
  IActionFetchProfilePending,
  IActionFetchProfileRejected,
  IActionIssueJWSTokenFulfilled,
  IActionIssueJWSTokenPending,
  IActionIssueJWSTokenRejected,
  issueJWSTokenFulfilled,
  issueJWSTokenPending,
  issueJWSTokenRejected,
} from "./authSlice";

import { setupServer, SetupServerApi } from "msw/node";
import { MockStoreEnhanced } from "redux-mock-store";
import configureMockStore from "redux-mock-store";
import thunkMiddleware from "redux-thunk";
import { DefaultRequestBody, MockedRequest, rest, RestHandler } from "msw";
import { IState, RequestStatus } from "../../types";
import { requestHandlers } from "../../testHelpers";
import { MOCK_PROFILE_1 } from "../../mockPiecesOfData";
import { INITIAL_STATE } from "../../store";
import { createUser, issueJWSToken, fetchProfile } from "./authSlice";

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
});

describe("reducer", () => {
  let initStAuth: IStateAuth;

  beforeEach(() => {
    initStAuth = { ...INITIAL_STATE_AUTH };
  });

  test("auth/createUser/pending", () => {
    initStAuth = {
      ...initStAuth,
      requestStatus: RequestStatus.FAILED,
      requestError: "The previous attempt to create a User resource didn't succeed",
    };
    const action: IActionCreateUserPending = {
      type: ActionTypesCreateUser.PENDING,
    };

    const newSt: IStateAuth = authReducer(initStAuth, action);

    expect(newSt).toEqual({
      requestStatus: "loading",
      requestError: null,
      token: null,
      hasValidToken: null,
      signedInUserProfile: null,
    });
  });

  test("auth/createUser/rejected", () => {
    initStAuth = {
      ...initStAuth,
      requestStatus: RequestStatus.LOADING,
    };
    const action: IActionCreateUserRejected = {
      type: ActionTypesCreateUser.REJECTED,
      error: "auth-createUser-rejected",
    };

    const newSt: IStateAuth = authReducer(initStAuth, action);

    expect(newSt).toEqual({
      requestStatus: "failed",
      requestError: "auth-createUser-rejected",
      token: null,
      hasValidToken: null,
      signedInUserProfile: null,
    });
  });

  test("auth/createUser/fulfilled", () => {
    initStAuth = {
      ...initStAuth,
      requestStatus: RequestStatus.LOADING,
    };
    const action: IActionCreateUserFulfilled = {
      type: ActionTypesCreateUser.FULFILLED,
    };

    const newSt: IStateAuth = authReducer(initStAuth, action);

    expect(newSt).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      token: null,
      hasValidToken: null,
      signedInUserProfile: null,
    });
  });

  test("auth/issueJWSToken/pending", () => {
    initStAuth = {
      ...initStAuth,
      requestStatus: RequestStatus.FAILED,
      requestError: "The previous attempt to issue a JWS token didn't succeed",
    };
    const action: IActionIssueJWSTokenPending = {
      type: ActionTypesIssueJWSToken.PENDING,
    };

    const newSt: IStateAuth = authReducer(initStAuth, action);

    expect(newSt).toEqual({
      requestStatus: "loading",
      requestError: null,
      token: null,
      hasValidToken: null,
      signedInUserProfile: null,
    });
  });

  test("auth/issueJWSToken/rejected", () => {
    initStAuth = {
      ...initStAuth,
      requestStatus: RequestStatus.LOADING,
    };
    const action: IActionIssueJWSTokenRejected = {
      type: ActionTypesIssueJWSToken.REJECTED,
      error: "auth-issueJWSToken-rejected",
    };

    const newSt: IStateAuth = authReducer(initStAuth, action);

    expect(newSt).toEqual({
      requestStatus: "failed",
      requestError: "auth-issueJWSToken-rejected",
      token: null,
      hasValidToken: false,
      signedInUserProfile: null,
    });
  });

  test("auth/issueJWSToken/fulfilled", () => {
    initStAuth = {
      ...initStAuth,
      requestStatus: RequestStatus.LOADING,
    };
    const action: IActionIssueJWSTokenFulfilled = {
      type: ActionTypesIssueJWSToken.FULFILLED,
      payload: {
        token: "a-jws-token-issued-by-the-backend",
      },
    };

    const newSt: IStateAuth = authReducer(initStAuth, action);

    expect(newSt).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      token: "a-jws-token-issued-by-the-backend",
      hasValidToken: true,
      signedInUserProfile: null,
    });
  });

  test("auth/fetchProfile/pending", () => {
    const action: IActionFetchProfilePending = {
      type: ActionTypesFetchProfile.PENDING,
    };

    const newSt: IStateAuth = authReducer(initStAuth, action);

    expect(newSt).toEqual({
      requestStatus: "loading",
      requestError: null,
      token: null,
      hasValidToken: null,
      signedInUserProfile: null,
    });
  });

  test("auth/fetchProfile/rejected", () => {
    initStAuth = {
      ...initStAuth,
      requestStatus: RequestStatus.LOADING,
    };
    const action: IActionFetchProfileRejected = {
      type: ActionTypesFetchProfile.REJECTED,
      error: "auth-fetchProfile-rejected",
    };

    const newSt: IStateAuth = authReducer(initStAuth, action);

    expect(newSt).toEqual({
      requestStatus: "failed",
      requestError: "auth-fetchProfile-rejected",
      token: null,
      hasValidToken: false,
      signedInUserProfile: null,
    });
  });

  test("auth/fetchProfile/fulfilled", () => {
    initStAuth = {
      ...initStAuth,
      requestStatus: RequestStatus.LOADING,
      requestError: null,
      token: "a-jws-token-issued-by-the-backend",
    };
    const action: IActionFetchProfileFulfilled = {
      type: ActionTypesFetchProfile.FULFILLED,
      payload: {
        profile: MOCK_PROFILE_1,
      },
    };

    const newSt: IStateAuth = authReducer(initStAuth, action);

    expect(newSt).toEqual({
      requestStatus: "succeeded",
      requestError: null,
      token: "a-jws-token-issued-by-the-backend",
      hasValidToken: true,
      signedInUserProfile: MOCK_PROFILE_1,
    });
  });

  test("auth/clearAuthSlice", () => {
    initStAuth = {
      ...initStAuth,
      token: "a-jws-token-issued-by-the-backend",
      hasValidToken: true,
    };
    const action: IActionClearAuthSlice = {
      type: ACTION_TYPE_CLEAR_AUTH_SLICE,
    };

    const newSt: IStateAuth = authReducer(initStAuth, action);

    expect(newSt).toEqual({
      requestStatus: "idle",
      requestError: null,
      token: null,
      hasValidToken: false,
      signedInUserProfile: null,
    });
  });

  test(
    "an action, which this reducer doesn't specifically handle," +
      " should not modify its associated state (slice)",
    () => {
      initStAuth = {
        ...INITIAL_STATE_AUTH,
        requestStatus: RequestStatus.SUCCEEDED,
        token: "a-jws-token-issued-by-the-backend",
        hasValidToken: true,
        signedInUserProfile: MOCK_PROFILE_1,
      };
      const action: any = {
        type: "an action, which this reducer doesn't specifically handle",
      };

      const newSt: IStateAuth = authReducer(initStAuth, action);

      expect(newSt).toEqual(initStAuth);
    }
  );
});

/* Create an MSW "request-interception layer". */
const restHandlers: RestHandler<MockedRequest<DefaultRequestBody>>[] = [
  rest.post("/api/users", requestHandlers.mockMultipleFailures),
  rest.post("/api/tokens", requestHandlers.mockMultipleFailures),
  rest.get("/api/user-profile", requestHandlers.mockMultipleFailures),
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
      "createUser(username, ...)" +
        " + the HTTP request issued by that thunk-action is mocked to fail",
      async () => {
        // Arrange.
        // (Prepend a request handler to the request-interception layer.)
        requestInterceptionLayer.use(
          rest.post("/api/users", (req, res, ctx) => {
            return res.once(
              ctx.status(400),
              ctx.json({
                error: "mocked-Failed to create a new User resource",
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
          "mocked-Failed to create a new User resource"
        );
        expect(storeMock.getActions()).toEqual([
          {
            type: "auth/createUser/pending",
          },
          {
            type: "auth/createUser/rejected",
            error: "mocked-Failed to create a new User resource",
          },
        ]);
      }
    );

    test(
      "createUser(username, ...)" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        // Arrange.
        requestInterceptionLayer.use(
          rest.post("/api/users", requestHandlers.mockCreateUser)
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
        // Act.
        const issueJWSTokenPromise = storeMock.dispatch(
          issueJWSToken("mocked-request-email", "mocked-request-password")
        );

        // Assert.
        await expect(issueJWSTokenPromise).rejects.toEqual(
          "mocked-authentication required"
        );
        expect(storeMock.getActions()).toEqual([
          {
            type: "auth/issueJWSToken/pending",
          },
          {
            type: "auth/issueJWSToken/rejected",
            error: "mocked-authentication required",
          },
        ]);
      }
    );

    test(
      "issueJWSToken(email, password)" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        // Arrange.
        requestInterceptionLayer.use(
          rest.post("/api/tokens", requestHandlers.mockIssueJWSToken)
        );

        // Act.
        const issueJWSTokenPromise = storeMock.dispatch(
          issueJWSToken("mocked-request-email", "mocked-request-password")
        );

        // Assert.
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

    test(
      "fetchProfile()" +
        " + the HTTP request issued by that thunk-action is mocked to fail",
      async () => {
        // Act.
        const fetchProfilePromise = storeMock.dispatch(fetchProfile());

        // Assert.
        await expect(fetchProfilePromise).rejects.toEqual(
          "mocked-authentication required"
        );
        expect(storeMock.getActions()).toEqual([
          {
            type: "auth/fetchProfile/pending",
          },
          {
            type: "auth/fetchProfile/rejected",
            error: "mocked-authentication required",
          },
        ]);
      }
    );

    test(
      "fetchProfile()" +
        " + the HTTP request issued by that thunk-action is mocked to succeed",
      async () => {
        // Arrange.
        requestInterceptionLayer.use(
          rest.get("/api/user-profile", requestHandlers.mockFetchUserProfile)
        );

        // Act.
        const fetchProfilePromise = storeMock.dispatch(fetchProfile());

        // Assert.
        await expect(fetchProfilePromise).resolves.toEqual(undefined);
        expect(storeMock.getActions()).toEqual([
          {
            type: "auth/fetchProfile/pending",
          },
          {
            type: "auth/fetchProfile/fulfilled",
            payload: {
              profile: MOCK_PROFILE_1,
            },
          },
        ]);
      }
    );
  }
);

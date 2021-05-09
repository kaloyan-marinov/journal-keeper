import { render, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import {
  createUserPending,
  createUserRejected,
  createUserFulfilled,
  rootReducer,
} from "./App";
import App, { Alerts, SignUp, SignIn, MyMonthlyJournal } from "./App";

import { Provider } from "react-redux";
import { store } from "./App";

import { alertCreate, alertRemove } from "./App";

import { createStore } from "redux";

import { rest } from "msw";
import { setupServer } from "msw/node";

import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import thunkMiddleware from "redux-thunk";
import { initialState } from "./App";
import { createUser } from "./App";

import { applyMiddleware } from "redux";

import {
  issueJWSTokenPending,
  issueJWSTokenRejected,
  issueJWSTokenFulfilled,
} from "./App";

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

  test("alertCreate", () => {
    const action = alertCreate("id-17", "the-undertaken-action-is-illegitimate");

    expect(action).toEqual({
      type: "alerts/create",
      payload: {
        id: "id-17",
        message: "the-undertaken-action-is-illegitimate",
      },
    });
  });

  test("alertRemove", () => {
    const action = alertRemove("id-17");

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
});

describe("reducers", () => {
  test(
    "auth/createUser/pending should" +
      " update state.auth.requestStatus" +
      " to 'loading'",
    () => {
      const action = {
        type: "auth/createUser/pending",
      };

      const newState = rootReducer(initialState, action);

      expect(newState).toEqual({
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "loading",
          requestError: null,
          token: null,
        },
      });
    }
  );

  test(
    "auth/createUser/rejected should update" +
      " both state.auth.requestStatus and state.auth.requestError",
    () => {
      const action = {
        type: "auth/createUser/rejected",
        error: "auth-createUser-rejected",
      };

      const newState = rootReducer(initialState, action);

      expect(newState).toEqual({
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "failed",
          requestError: "auth-createUser-rejected",
          token: null,
        },
      });
    }
  );

  test(
    "auth/createUser/fulfilled should" +
      " update state.auth.requestStatus to 'succeeded'" +
      " and clear state.auth.requestError",
    () => {
      const initState = {
        ...initialState,
        auth: {
          ...initialState.auth,
          requestStatus: "pending",
          requestError: "auth-createUser-rejected",
        },
      };
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
        },
      });
    }
  );

  test(
    "alerts/create should add an alert to" +
      " both state.alerts.ids and state.alerts.entities",
    () => {
      const initialState = {
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
        },
      };
      const action = {
        type: "alerts/create",
        payload: {
          id: "id-34",
          message: "once-again-the-undertaken-action-is-illegitimate",
        },
      };

      const newState = rootReducer(initialState, action);

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
        },
      });
    }
  );

  test(
    "alerts/remove should remove an alert from" +
      " both state.alerts.ids and state.alerts.entities",
    () => {
      const initialState = {
        alerts: {
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
        },
        auth: {
          requestStatus: "idle",
          requestError: null,
        },
      };
      const action = {
        type: "alerts/remove",
        payload: {
          id: "id-34",
        },
      };

      const newState = rootReducer(initialState, action);

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
        },
      });
    }
  );

  test(
    "auth/issueJWSToken/pending should" +
      " update state.auth.requestStatus" +
      " to 'loading'",
    () => {
      const action = {
        type: "auth/issueJWSToken/pending",
      };

      const newState = rootReducer(initialState, action);

      expect(newState).toEqual({
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "loading",
          requestError: null,
          token: null,
        },
      });
    }
  );

  test(
    "auth/issueJWSToken/rejected should update" +
      " both state.auth.requestStatus and state.auth.requestError",
    () => {
      const action = {
        type: "auth/issueJWSToken/rejected",
        error: "auth-issueJWSToken-rejected",
      };

      const newState = rootReducer(initialState, action);

      expect(newState).toEqual({
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "failed",
          requestError: "auth-issueJWSToken-rejected",
          token: null,
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
      const initState = {
        ...initialState,
        auth: {
          ...initialState.auth,
          requestStatus: "pending",
          requestError: "auth-issueJWSToken-rejected",
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
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "succeeded",
          requestError: null,
          token: "a-jws-token-issued-by-the-backend",
        },
      });
    }
  );

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
      };
      const action = {
        type: "an action, which the rootReducer doesn't specifically handle",
      };

      const newState = rootReducer(initState, action);

      expect(newState).toEqual(initState);
    }
  );
});

/* Describe what requests should be mocked. */
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
];

/* Create an MSW "request-interception layer". */
const quasiServer = setupServer(...requestHandlersToMock);

const createStoreMock = configureMockStore([thunkMiddleware]);

describe(
  "dispatching of async thunk-actions," +
    " with each test case focusing on the action-related logic only" +
    " (and thus completely disregarding the reducer-related logic) ",
  () => {
    let initSt;
    let storeMock: MockStoreEnhanced<unknown, {}>;

    beforeAll(() => {
      // Establish the created request-interception layer
      // (= Enable API mocking).
      quasiServer.listen();
    });

    beforeEach(() => {
      initSt = initialState;
      storeMock = createStoreMock(initialState);
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
        // Prepend a request handler to the request-interception layer.
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

        const createUserPromise = storeMock.dispatch(
          createUser(
            "mocked-request-username",
            "mocked-request-name",
            "mocked-request-email@protonmail.com",
            "mocked-request-password"
          )
        );

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
  }
);

describe("<App>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    getByText("Home");
    getByText("Sign Up");
    getByText("Sign In");
    getByText("MyMonthlyJournal");

    getByText("Welcome to MyMonthlyJournal!");
  });
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
      const initialStateWithAlerts = {
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
          requestStatus: "n/a",
          requestError: "n/a",
        },
      };
      const storeWithAlerts = createStore(rootReducer, initialStateWithAlerts);
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
    test("the user fills out the form in an invalid way and submits it", () => {
      const { getByPlaceholderText, getByRole, getByText } = render(
        <Provider store={store}>
          <Alerts />
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

      const button = getByRole("button");
      fireEvent.click(button);

      getByText(/THE PROVIDED PASSWORDS DON'T MATCH/);
    });
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

describe("<MyMonthlyJournal>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText, getAllByText } = render(
      <BrowserRouter>
        <MyMonthlyJournal />
      </BrowserRouter>
    );

    getByText("Review the entries in MyMonthlyJournal!");
    getByText("Create a new entry");

    getByText("Then it dawned on me: there is no finish line!");
    getByText("Mallorca has beautiful sunny beaches!");

    const editLinks = getAllByText("Edit");
    expect(editLinks.length).toEqual(2);
  });
});

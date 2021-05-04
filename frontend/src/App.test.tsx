import { render, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import {
  createUserPending,
  createUserRejected,
  createUserFulfilled,
  rootReducer,
} from "./App";
import App, { SignUp, SignIn, MyMonthlyJournal } from "./App";

import { Provider } from "react-redux";
import { store } from "./App";

import { alertCreate, alertRemove } from "./App";

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
});

describe("reducers", () => {
  test(
    "auth/createUser/pending should" +
      " update state.auth.requestStatus" +
      " to 'loading'",
    () => {
      const initialState = {
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "idle",
          requestError: null,
        },
      };
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
        },
      });
    }
  );

  test(
    "auth/createUser/rejected should update" +
      " both state.auth.requestStatus and state.auth.requestError",
    () => {
      const initialState = {
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "pending",
          requestError: null,
        },
      };
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
        },
      });
    }
  );

  test(
    "auth/createUser/fulfilled should" +
      " update state.auth.requestStatus to 'succeeded'" +
      " and clear state.auth.requestError",
    () => {
      const initialState = {
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "pending",
          requestError: "auth-createUser-rejected",
        },
      };
      const action = {
        type: "auth/createUser/fulfilled",
      };

      const newState = rootReducer(initialState, action);

      expect(newState).toEqual({
        alerts: {
          entities: {},
          ids: [],
        },
        auth: {
          requestStatus: "succeeded",
          requestError: null,
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
    "an action, which the rootReducer doesn't specifically handle," +
      " should not modify the state",
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
          requestStatus: "original-status",
          requestError: "original-error",
        },
      };
      const action = {
        type: "an action, which the rootReducer doesn't specifically handle",
      };

      const newState = rootReducer(initialState, action);

      expect(newState).toEqual(initialState);
    }
  );
});

describe("<App>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText } = render(<App />);

    getByText("Home");
    getByText("Sign Up");
    getByText("Sign In");
    getByText("MyMonthlyJournal");

    getByText("Welcome to MyMonthlyJournal!");
  });
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

describe("<SignIn>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText, getAllByRole, getByPlaceholderText } = render(<SignIn />);

    getByText("Log in to your account!");

    const forms = getAllByRole("form");
    expect(forms.length).toEqual(1);

    getByPlaceholderText("Enter your email...");
    getByPlaceholderText("Enter your password...");
    getByText("Sign me in");
  });

  test("the user fills out the form (without submitting it)", () => {
    const { getByPlaceholderText, getByDisplayValue } = render(<SignIn />);

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

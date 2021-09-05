import { render, screen } from "@testing-library/react";
import { applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import { Provider } from "react-redux";

import { IState } from "./types";
import { initialStateAlerts, initialStateAuth, initialStateEntries } from "./constants";
import { Home } from "./features/Home";
import { rootReducer } from "./store";
import { MOCK_PROFILE_1 } from "./testHelpers";

describe("<Home>", () => {
  test("initial render (i.e. before/without any user interaction)", async () => {
    // Arrange.
    const initState: IState = {
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

    render(
      <Provider store={realStore}>
        <Home />
      </Provider>
    );

    // Assert.
    screen.getByText("Welcome to JournalEntries!");
  });

  test("render after a user has successfully signed in", async () => {
    // Arrange.
    const initState = {
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        ...initialStateAuth,
        signedInUserProfile: MOCK_PROFILE_1,
      },
      entries: {
        ...initialStateEntries,
      },
    };
    const enhancer = applyMiddleware(thunkMiddleware);
    const realStore = createStore(rootReducer, initState, enhancer);

    render(
      <Provider store={realStore}>
        <Home />
      </Provider>
    );

    // Assert.
    screen.getByText("Hello, mocked-John Doe!");
  });
});

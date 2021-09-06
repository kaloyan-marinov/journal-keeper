import { render, screen } from "@testing-library/react";
import { applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import { Provider } from "react-redux";

import { IState } from "./types";
import {
  INITIAL_STATE_ALERTS,
  INITIAL_STATE_AUTH,
  INITIAL_STATE_ENTRIES,
} from "./constants";
import { Home } from "./features/Home";
import { rootReducer } from "./store";
import { MOCK_PROFILE_1 } from "./testHelpers";

describe("<Home>", () => {
  test("initial render (i.e. before/without any user interaction)", async () => {
    // Arrange.
    const initState: IState = {
      alerts: {
        ...INITIAL_STATE_ALERTS,
      },
      auth: {
        ...INITIAL_STATE_AUTH,
        signedInUserProfile: null,
      },
      entries: {
        ...INITIAL_STATE_ENTRIES,
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
        ...INITIAL_STATE_ALERTS,
      },
      auth: {
        ...INITIAL_STATE_AUTH,
        signedInUserProfile: MOCK_PROFILE_1,
      },
      entries: {
        ...INITIAL_STATE_ENTRIES,
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

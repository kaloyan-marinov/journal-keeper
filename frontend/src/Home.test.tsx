import { render, screen } from "@testing-library/react";
import { applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import { Provider } from "react-redux";

import { IState } from "./types";
import { Home } from "./features/Home";
import { INITIAL_STATE, rootReducer } from "./store";
import { MOCK_PROFILE_1 } from "./testHelpers";

test("initial render (i.e. before/without any user interaction)", async () => {
  // Arrange.
  const initState: IState = {
    ...INITIAL_STATE,
    auth: {
      ...INITIAL_STATE.auth,
      signedInUserProfile: null,
    },
  };
  const enhancer = applyMiddleware(thunkMiddleware);
  const realStore = createStore(rootReducer, initState, enhancer);

  // Act.
  render(
    <Provider store={realStore}>
      <Home />
    </Provider>
  );

  // Assert.
  screen.getByText("Welcome to JournalKeeper!");
});

test("render after a user has successfully signed in", async () => {
  // Arrange.
  const initState = {
    ...INITIAL_STATE,
    auth: {
      ...INITIAL_STATE.auth,
      signedInUserProfile: MOCK_PROFILE_1,
    },
  };
  const enhancer = applyMiddleware(thunkMiddleware);
  const realStore = createStore(rootReducer, initState, enhancer);

  // Act.
  render(
    <Provider store={realStore}>
      <Home />
    </Provider>
  );

  // Assert.
  screen.getByText("Hello, mocked-John Doe!");
});

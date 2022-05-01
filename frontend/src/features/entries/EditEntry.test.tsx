import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { Route, Router, Switch } from "react-router-dom";
import { applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import { createMemoryHistory, MemoryHistory } from "history";

import { IState, RequestStatus } from "../../types";
import { MOCK_ENTRY_10, MOCK_ENTRY_10_LOCAL_TIME } from "../../testHelpers";
import { EditEntry } from "./EditEntry";
import { INITIAL_STATE, TStore, rootReducer } from "../../store";
import { Alerts } from "../alerts/Alerts";

import { requestHandlers } from "../../testHelpers";
import { DefaultRequestBody, MockedRequest, rest, RestHandler } from "msw";
import { setupServer, SetupServerApi } from "msw/node";
import { SignIn } from "../auth/SignIn";
import { PrivateRoute } from "../auth/PrivateRoute";

let history: MemoryHistory<unknown>;
let realStore: TStore;

let element: HTMLElement;

beforeEach(() => {
  const initState: IState = {
    ...INITIAL_STATE,
    auth: {
      ...INITIAL_STATE.auth,
      requestStatus: RequestStatus.SUCCEEDED,
      token: "token-issued-by-the-backend",
      hasValidToken: true,
    },
    entries: {
      ...INITIAL_STATE.entries,
      requestStatus: RequestStatus.SUCCEEDED,
      ids: [MOCK_ENTRY_10.id],
      entities: {
        [MOCK_ENTRY_10.id]: MOCK_ENTRY_10,
      },
    },
  };
  const enhancer = applyMiddleware(thunkMiddleware);
  realStore = createStore(rootReducer, initState, enhancer);

  history = createMemoryHistory();
  const route = `/entries/${MOCK_ENTRY_10.id}/edit`;
  history.push(route);
});

describe("standalone - as a single component", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    // Act.
    render(
      <Provider store={realStore}>
        <Router history={history}>
          <Route exact path="/entries/:id/edit">
            <EditEntry />
          </Route>
        </Router>
      </Provider>
    );

    // Assert.
    element = screen.getByText("2021-09-01 06:01 (UTC +00:00)");
    expect(element).toBeInTheDocument();

    const elementsWithTheEntryContent = screen.getAllByText(MOCK_ENTRY_10.content);
    expect(elementsWithTheEntryContent.length).toEqual(2);

    element = screen.getByDisplayValue(MOCK_ENTRY_10_LOCAL_TIME);
    expect(element).toBeInTheDocument();
    element = screen.getByDisplayValue(MOCK_ENTRY_10.utcZoneOfTimestamp);
    expect(element).toBeInTheDocument();
  });

  test("the user fills out the form (without submitting it)", () => {
    // Arrange.
    render(
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
    in the same order as they are rendered in the DOM.
    */
    const [localTimeInput, contentTextArea] = screen.getAllByRole("textbox");
    const timezoneSelect = screen.getByRole("combobox");

    fireEvent.change(localTimeInput, { target: { value: "1999-01-01 03:00" } });
    fireEvent.change(timezoneSelect, { target: { value: "+01:00" } });
    fireEvent.change(contentTextArea, {
      target: {
        value: "This is an Entry resource, all of whose details have been edited.",
      },
    });

    // Assert.
    element = screen.getByDisplayValue("1999-01-01 03:00");
    expect(element).toBeInTheDocument();
    element = screen.getByDisplayValue("+01:00");
    expect(element).toBeInTheDocument();
    element = screen.getByDisplayValue(
      "This is an Entry resource, all of whose details have been edited."
    );
    expect(element).toBeInTheDocument();
  });
});

describe(
  "+ <Alerts>" + " (without the user interaction triggering any network communication)",
  () => {
    test(
      "the user fills out the form in an invalid way" +
        " (by failing to fill out all required fields) and submits it",
      () => {
        // Arrange.
        render(
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
        const timezoneSelect = screen.getByRole("combobox");
        fireEvent.change(timezoneSelect, { target: { value: "" } });

        const button: HTMLElement = screen.getByRole("button", {
          name: "Edit entry",
        });
        fireEvent.click(button);

        // Assert.
        element = screen.getByText("YOU MUST FILL OUT ALL FORM FIELDS");
        expect(element).toBeInTheDocument();
      }
    );
  }
);

describe("+ <Alerts> (with the user interaction triggering network communication)", () => {
  /* Create an MSW "request-interception layer". */
  const restHandlers: RestHandler<MockedRequest<DefaultRequestBody>>[] = [
    rest.put("/api/entries/:id", requestHandlers.mockMultipleFailures),
  ];

  const requestInterceptionLayer: SetupServerApi = setupServer(...restHandlers);

  beforeAll(() => {
    // Enable API mocking.
    requestInterceptionLayer.listen();
  });

  beforeEach(() => {
    requestInterceptionLayer.resetHandlers();
  });

  afterAll(() => {
    // Disable API mocking.
    requestInterceptionLayer.close();
  });

  test(
    "the user fills out the form and submits it," +
      " but the backend is _mocked_ to respond that" +
      " the form was filled out in an invalid way",
    async () => {
      // Arrange.
      requestInterceptionLayer.use(
        rest.put("/api/entries/:id", (req, res, ctx) => {
          return res.once(
            ctx.status(400),
            ctx.json({
              error: "mocked-Failed to edit the targeted Entry resource",
            })
          );
        })
      );

      render(
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
      const button: HTMLElement = screen.getByRole("button", { name: "Edit entry" });
      fireEvent.click(button);

      // Assert.
      const element: HTMLElement = await screen.findByText(
        "mocked-Failed to edit the targeted Entry resource"
      );
      expect(element).toBeInTheDocument();
    }
  );

  test(
    "the user fills out the form and submits it," +
      " but the backend is _mocked_ to respond that" +
      " the user's JWS Token is no longer valid",
    async () => {
      // Arrange.
      render(
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
      const button: HTMLElement = screen.getByRole("button", { name: "Edit entry" });
      fireEvent.click(button);

      // Assert.
      const element: HTMLElement = await screen.findByText(
        "[FROM <EditEntry>'S handleSubmit] PLEASE SIGN BACK IN"
      );
      expect(element).toBeInTheDocument();

      expect(history.location.pathname).toEqual("/sign-in");
    }
  );

  xtest(
    "the user fills out the form and submits it," +
      " and the backend is _mocked_ to respond that" +
      " the form submission was accepted as valid and processed",
    async () => {
      // Arrange.
      requestInterceptionLayer.use(
        rest.put("/api/entries/:id", requestHandlers.mockEditEntry)
      );

      render(
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
      const button: HTMLElement = screen.getByRole("button", { name: "Edit entry" });
      fireEvent.click(button);

      // Assert.
      const element: HTMLElement = await screen.findByText("ENTRY EDITING SUCCESSFUL");
      expect(element).toBeInTheDocument();

      expect(history.location.pathname).toEqual("/journal-entries");
    }
  );
});

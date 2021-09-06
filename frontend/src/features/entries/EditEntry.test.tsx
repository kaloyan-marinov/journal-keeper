import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { Route, Router, Switch } from "react-router-dom";
import { applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import { createMemoryHistory } from "history";

import { IState, RequestStatus } from "../../types";
import {
  INITIAL_STATE_ALERTS,
  INITIAL_STATE_AUTH,
  INITIAL_STATE_ENTRIES,
} from "../../constants";
import { MOCK_ENTRY_10, MOCK_ENTRY_10_LOCAL_TIME } from "../../testHelpers";
import { EditEntry } from "./EditEntry";
import { rootReducer } from "../../store";
import { Alerts } from "../alerts/Alerts";

import { requestHandlers } from "../../testHelpers";
import { DefaultRequestBody, MockedRequest, rest, RestHandler } from "msw";
import { setupServer } from "msw/node";
import { SignIn } from "../auth/SignIn";
import { PrivateRoute } from "../auth/PrivateRoute";

describe("<EditEntry>", () => {
  let history;
  let realStore;

  beforeEach(() => {
    const initState: IState = {
      alerts: {
        ...INITIAL_STATE_ALERTS,
      },
      auth: {
        ...INITIAL_STATE_AUTH,
        requestStatus: RequestStatus.SUCCEEDED,
        token: "token-issued-by-the-backend",
        hasValidToken: true,
      },
      entries: {
        ...INITIAL_STATE_ENTRIES,
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

  describe("by itself", () => {
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
      screen.getByText("2021-09-01 06:01 (UTC +00:00)");

      const elementsWithTheEntryContent = screen.getAllByText(MOCK_ENTRY_10.content);
      expect(elementsWithTheEntryContent.length).toEqual(2);

      screen.getByDisplayValue(MOCK_ENTRY_10_LOCAL_TIME);
      screen.getByDisplayValue(MOCK_ENTRY_10.utcZoneOfTimestamp);
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
      in the same order as they are rendered on the DOM.
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
      screen.getByDisplayValue("1999-01-01 03:00");
      screen.getByDisplayValue("+01:00");
      screen.getByDisplayValue(
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
          screen.getByText("YOU MUST FILL OUT ALL FORM FIELDS");
        }
      );
    }
  );

  describe("+ <Alerts> (with the user interaction triggering network communication)", () => {
    /* Create an MSW "request-interception layer". */
    const requestInterceptionLayer: RestHandler<MockedRequest<DefaultRequestBody>>[] = [
      rest.put("/api/entries/:id", requestHandlers.mockMultipleFailures),
    ];

    const quasiServer = setupServer(...requestInterceptionLayer);

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
      }
    );

    test(
      "the user fills out the form and submits it," +
        " and the backend is _mocked_ to respond that" +
        " the form submission was accepted as valid and processed",
      async () => {
        // Arrange.
        quasiServer.use(rest.put("/api/entries/:id", requestHandlers.mockEditEntry));

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
        const element: HTMLElement = await screen.findByText(
          "ENTRY EDITING SUCCESSFUL"
        );
        expect(element).toBeInTheDocument();

        expect(history.location.pathname).toEqual("/journal-entries");
      }
    );
  });
});

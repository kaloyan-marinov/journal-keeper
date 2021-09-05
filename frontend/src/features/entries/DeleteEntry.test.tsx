import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import { Provider } from "react-redux";
import { Route, Router, Switch } from "react-router-dom";
import { createMemoryHistory } from "history";

import { IState, RequestStatus } from "../../types";
import { initialStateAlerts } from "../../constants";
import { rootReducer } from "../../store";
import {
  MOCK_ENTRIES_ENTITIES,
  MOCK_ENTRIES_IDS,
  MOCK_ENTRY_10,
  MOCK_LINKS,
  MOCK_META,
} from "../../testHelpers";
import { PrivateRoute } from "../auth/PrivateRoute";
import { DeleteEntry } from "./DeleteEntry";
import { JournalEntries } from "./JournalEntries";
import { Alerts } from "../alerts/Alerts";
import { SignIn } from "../auth/SignIn";

import { requestHandlers } from "../../testHelpers";
import { DefaultRequestBody, MockedRequest, rest, RestHandler } from "msw";
import { setupServer } from "msw/node";

describe("<DeleteEntry>", () => {
  let history;
  let realStore;

  beforeEach(() => {
    const initState: IState = {
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        requestStatus: RequestStatus.SUCCEEDED,
        requestError: null,
        token: "token-issued-by-the-backend",
        hasValidToken: true,
        signedInUserProfile: null,
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
    const enhancer = applyMiddleware(thunkMiddleware);
    realStore = createStore(rootReducer, initState, enhancer);

    history = createMemoryHistory();
    const route = `/entries/${MOCK_ENTRY_10.id}/delete`;
    history.push(route);
  });

  describe("without the user interaction triggering any network communication", () => {
    test("initial render (i.e. before/without any user interaction)", () => {
      // Act.
      render(
        <Provider store={realStore}>
          <Router history={history}>
            <PrivateRoute exact path="/entries/:id/delete">
              <DeleteEntry />
            </PrivateRoute>
          </Router>
        </Provider>
      );

      // Assert.
      screen.getByText("You are about to delete the following Entry:");

      screen.getByText("2021-09-01 06:01 (UTC +00:00)");
      screen.getByText(MOCK_ENTRY_10.content);

      screen.getByText("Do you want to delete the selected Entry?");
      screen.getByRole("button", { name: "Yes" });
      screen.getByRole("button", { name: "No" });
    });

    test("the user clicks the 'No' button, which should redirect to /journal-entries", () => {
      // Arrange.
      render(
        <Provider store={realStore}>
          <Router history={history}>
            <PrivateRoute exact path="/journal-entries">
              <JournalEntries />
            </PrivateRoute>
            <PrivateRoute exact path="/entries/:id/delete">
              <DeleteEntry />
            </PrivateRoute>
          </Router>
        </Provider>
      );

      const buttonNo = screen.getByRole("button", { name: "No" });

      // Act.
      fireEvent.click(buttonNo);

      // Assert.
      screen.getByText("Review JournalEntries!");

      expect(history.location.pathname).toEqual("/journal-entries");
    });
  });

  describe("with the user interaction triggering network communication", () => {
    /* Create an MSW "request-interception layer". */
    const requestInterceptionLayer: RestHandler<MockedRequest<DefaultRequestBody>>[] = [
      rest.delete("/api/entries/:id", requestHandlers.mockMultipleFailures),
      rest.get("/api/entries", requestHandlers.mockMultipleFailures),
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
      "the user clicks on the 'Yes' button," +
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
              <PrivateRoute exact path="/entries/:id/delete">
                <DeleteEntry />
              </PrivateRoute>
            </Router>
          </Provider>
        );

        // Act.
        const buttonYes: HTMLElement = screen.getByRole("button", { name: "Yes" });
        fireEvent.click(buttonYes);

        // Assert.
        let element: HTMLElement = await screen.findByText(
          "[FROM <DeleteEntry>'S handleClickYes] PLEASE SIGN BACK IN"
        );
        expect(element).toBeInTheDocument();

        expect(history.location.pathname).toEqual("/sign-in");

        element = screen.getByText("Sign me in");
        expect(element).toBeInTheDocument();
      }
    );

    test(
      "the user clicks on the 'Yes' button," +
        " but the backend is _mocked_ to respond" +
        " with an error, which is not related to authentication",
      async () => {
        // Arrange.
        quasiServer.use(
          rest.delete("/api/entries/:id", (req, res, ctx) => {
            return res.once(
              ctx.status(400),
              ctx.json({
                error:
                  "mocked-Encountered an error," +
                  " which is not related to authentication",
              })
            );
          })
        );

        render(
          <Provider store={realStore}>
            <Router history={history}>
              <Alerts />
              <PrivateRoute exact path="/entries/:id/delete">
                <DeleteEntry />
              </PrivateRoute>
            </Router>
          </Provider>
        );

        // Act.
        const buttonYes: HTMLElement = screen.getByRole("button", { name: "Yes" });
        fireEvent.click(buttonYes);

        // Assert.
        const element: HTMLElement = await screen.findByText(
          "mocked-Encountered an error, which is not related to authentication"
        );
        expect(element).toBeInTheDocument();
      }
    );

    test(
      "the user clicks on the 'Yes' button," +
        " and the backend is _mocked_ to respond that" +
        " the DELETE request was accepted as valid and processed",
      async () => {
        // Arrange.
        quasiServer.use(
          rest.delete("/api/entries/:id", requestHandlers.mockDeleteEntry)
        );

        render(
          <Provider store={realStore}>
            <Router history={history}>
              <Alerts />
              <Switch>
                <Route exact path="/entries/:id/delete">
                  <DeleteEntry />
                </Route>
              </Switch>
            </Router>
          </Provider>
        );

        const buttonYes: HTMLElement = screen.getByRole("button", { name: "Yes" });

        // Act.
        fireEvent.click(buttonYes);

        // Assert.
        const element: HTMLElement = await screen.findByText(
          "ENTRY DELETION SUCCESSFUL"
        );
        expect(element).toBeInTheDocument();

        expect(history.location.pathname).toEqual("/journal-entries");
      }
    );
  });
});

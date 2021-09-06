import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { applyMiddleware, createStore } from "redux";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import thunkMiddleware from "redux-thunk";

import { IState } from "../../types";
import {
  INITIAL_STATE_ALERTS,
  INITIAL_STATE_AUTH,
  INITIAL_STATE_ENTRIES,
  PER_PAGE_DEFAULT,
} from "../../constants";
import { rootReducer } from "../../store";
import { Alerts } from "../alerts/Alerts";
import { JournalEntries } from "./JournalEntries";
import { MOCK_ENTRY_10, requestHandlers } from "../../testHelpers";

import { DefaultRequestBody, MockedRequest, rest, RestHandler } from "msw";
import { setupServer } from "msw/node";
import { createMemoryHistory } from "history";

/* Create an MSW "request-interception layer". */
const requestInterceptionLayer: RestHandler<MockedRequest<DefaultRequestBody>>[] = [
  rest.get("/api/entries", requestHandlers.mockMultipleFailures),
];

const quasiServer = setupServer(...requestInterceptionLayer);

describe("<JournalEntries>", () => {
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

  describe("initial render", () => {
    test(
      "(<Alerts> + <JournalEntries>) a GET request is issued to /api/entries" +
        " as part of the effect function, but the backend is _mocked_ to reject" +
        " the client-provided authentication credential as invalid",
      async () => {
        // Arrange.
        const initState: IState = {
          alerts: {
            ...INITIAL_STATE_ALERTS,
          },
          auth: {
            ...INITIAL_STATE_AUTH,
            signedInUserProfile: {
              id: 17,
              username: "mocked-jd",
              name: "mocked-John Doe",
              email: "mocked-john.doe@protonmail.com",
              createdAt: "mocked-2021-05-24T20:10:17.000Z",
              updatedAt: "mocked-2021-05-24T20:10:17.000Z",
            },
          },
          entries: {
            ...INITIAL_STATE_ENTRIES,
          },
        };
        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, initState, enhancer);

        const history = createMemoryHistory();

        // Act.
        render(
          <Provider store={realStore}>
            <Router history={history}>
              <Alerts />
              <JournalEntries />
            </Router>
          </Provider>
        );

        // Assert.
        let element: HTMLElement;

        element = await screen.findByRole("button", { name: "Clear alert" });
        expect(element).toBeInTheDocument();
        element = screen.getByText(
          "[FROM <JournalEntries>'S useEffect HOOK] PLEASE SIGN BACK IN"
        );
        expect(element).toBeInTheDocument();
      }
    );

    test(
      "(<Alerts> + <JournalEntries>) a GET request is issued to /api/entries" +
        " as part of the effect function, but the backend is _mocked_ to respond" +
        " with an error, which is not related to authentication",
      async () => {
        // Arrange.
        quasiServer.use(
          rest.get("/api/entries", (req, res, ctx) => {
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

        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        const history = createMemoryHistory();

        // Act.
        render(
          <Provider store={realStore}>
            <Router history={history}>
              <Alerts />
              <JournalEntries />
            </Router>
          </Provider>
        );

        // Assert.
        const element: HTMLElement = await screen.findByText(
          "mocked-Encountered an error, which is not related to authentication"
        );
        expect(element).toBeInTheDocument();
      }
    );

    test(
      "a GET request is issued to /api/entries" +
        " as part of the effect function, and the backend is _mocked_ to accept" +
        " the client-provided authentication credential as valid",
      async () => {
        // Arrange.
        quasiServer.use(rest.get("/api/entries", requestHandlers.mockFetchEntries));

        const initState = {
          alerts: {
            ...INITIAL_STATE_ALERTS,
          },
          auth: {
            ...INITIAL_STATE_AUTH,
            signedInUserProfile: {
              id: 17,
              username: "mocked-jd",
              name: "mocked-John Doe",
              email: "mocked-john.doe@protonmail.com",
              createdAt: "mocked-2021-05-24T20:10:17.000Z",
              updatedAt: "mocked-2021-05-24T20:10:17.000Z",
            },
          },
          entries: {
            ...INITIAL_STATE_ENTRIES,
          },
        };
        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, initState, enhancer);

        const history = createMemoryHistory();

        // Act.
        render(
          <Provider store={realStore}>
            <Router history={history}>
              <JournalEntries />
            </Router>
          </Provider>
        );

        screen.getByText("Review JournalEntries!");
        screen.getByText("Create a new entry");

        // Assert.
        let element: HTMLElement;

        element = await screen.findByText("mocked-content-of-entry-01");
        expect(element).toBeInTheDocument();

        for (const i of [2, 3, 4, 5, 6, 7, 8, 9, 10]) {
          element = screen.getByText(
            `mocked-content-of-entry-` + i.toString().padStart(2, "0")
          );
          expect(element).toBeInTheDocument();
        }

        const editLinks = screen.getAllByText("Edit");
        expect(editLinks.length).toEqual(PER_PAGE_DEFAULT);
      }
    );
  });

  describe("responds to user interaction", () => {
    test("the user interacts with the pagination-controlling buttons", async () => {
      // Arrange.
      quasiServer.use(
        rest.get("/api/entries", requestHandlers.mockFetchEntries),

        rest.get("/api/entries", requestHandlers.mockFetchEntries),
        rest.get("/api/entries", requestHandlers.mockFetchEntries),
        rest.get("/api/entries", requestHandlers.mockFetchEntries),
        rest.get("/api/entries", requestHandlers.mockFetchEntries)
      );

      const enhancer = applyMiddleware(thunkMiddleware);
      const realStore = createStore(rootReducer, enhancer);

      const history = createMemoryHistory();

      render(
        <Provider store={realStore}>
          <Router history={history}>
            <JournalEntries />
          </Router>
        </Provider>
      );

      const mockEntry10: HTMLElement = await screen.findByText(MOCK_ENTRY_10.content);
      expect(mockEntry10).toBeInTheDocument();

      let currentPageSpan: HTMLElement;
      let entryAtTopOfPage: HTMLElement;
      let entryAtBottomOfPage: HTMLElement;

      // Act.
      const lastPageButton: HTMLElement = screen.getByRole("button", {
        name: "Last page: 5",
      });
      fireEvent.click(lastPageButton);

      // Assert.
      currentPageSpan = await screen.findByText("Current page: 5");
      expect(currentPageSpan).toBeInTheDocument();

      entryAtTopOfPage = await screen.findByText("mocked-content-of-entry-41");
      expect(entryAtTopOfPage).toBeInTheDocument();

      entryAtBottomOfPage = await screen.findByText("mocked-content-of-entry-50");
      expect(entryAtBottomOfPage).toBeInTheDocument();

      // Act.
      const prevPageButton: HTMLElement = screen.getByRole("button", {
        name: "Previous page",
      });
      fireEvent.click(prevPageButton);

      // Assert.
      currentPageSpan = await screen.findByText("Current page: 4");
      expect(currentPageSpan);

      entryAtTopOfPage = await screen.findByText("mocked-content-of-entry-31");
      expect(entryAtTopOfPage).toBeInTheDocument();

      entryAtBottomOfPage = await screen.findByText("mocked-content-of-entry-40");
      expect(entryAtBottomOfPage).toBeInTheDocument();

      // Act.
      const firstPageButton: HTMLElement = screen.getByRole("button", {
        name: "First page: 1",
      });
      fireEvent.click(firstPageButton);

      // Assert.
      currentPageSpan = await screen.findByText("Current page: 1");
      expect(currentPageSpan);

      entryAtTopOfPage = await screen.findByText("mocked-content-of-entry-01");
      expect(entryAtTopOfPage).toBeInTheDocument();

      entryAtBottomOfPage = await screen.findByText("mocked-content-of-entry-10");
      expect(entryAtBottomOfPage).toBeInTheDocument();

      // Act.
      const nextPageButton: HTMLElement = screen.getByRole("button", {
        name: "Next page",
      });
      fireEvent.click(nextPageButton);

      // Assert.
      currentPageSpan = await screen.findByText("Current page: 2");
      expect(currentPageSpan);

      entryAtTopOfPage = await screen.findByText("mocked-content-of-entry-11");
      expect(entryAtTopOfPage).toBeInTheDocument();

      entryAtBottomOfPage = await screen.findByText("mocked-content-of-entry-20");
      expect(entryAtBottomOfPage).toBeInTheDocument();
    });
  });
});

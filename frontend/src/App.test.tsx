import "@testing-library/jest-dom";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";

import { IState, RequestStatus } from "./types";

import { PrivateRoute } from "./App";
import App, { JournalEntries, CreateEntry } from "./App";

import { Provider } from "react-redux";

import { createStore } from "redux";

import { setupServer } from "msw/node";

import thunkMiddleware from "redux-thunk";

import { applyMiddleware } from "redux";

import { createMemoryHistory } from "history";
import { Router, Switch, Route } from "react-router-dom";
import { EditEntry } from "./App";

import { DeleteEntryLink, DeleteEntry } from "./App";

import {
  initialStateAlerts,
  JOURNAL_APP_TOKEN,
  initialStateAuth,
  initialStateEntries,
  PER_PAGE_DEFAULT,
} from "./constants";

import { DefaultRequestBody, MockedRequest, rest, RestHandler } from "msw";

import {
  MOCK_ENTRIES_ENTITIES,
  MOCK_ENTRIES_IDS,
  MOCK_ENTRY_10,
  MOCK_ENTRY_10_LOCAL_TIME,
  MOCK_LINKS,
  MOCK_META,
  requestHandlers,
} from "./testHelpers";

import { rootReducer, store } from "./store";
import { Alerts } from "./features/alerts/Alerts";
import { SignIn } from "./features/auth/SignIn";

/* Create an MSW "request-interception layer". */
const requestInterceptionLayer: RestHandler<MockedRequest<DefaultRequestBody>>[] = [
  rest.post("/api/users", requestHandlers.mockMultipleFailures),

  rest.post("/api/tokens", requestHandlers.mockMultipleFailures),

  rest.get("/api/user-profile", requestHandlers.mockMultipleFailures),

  rest.get("/api/entries", requestHandlers.mockMultipleFailures),
  rest.post("/api/entries", requestHandlers.mockMultipleFailures),
  rest.put("/api/entries/:id", requestHandlers.mockMultipleFailures),
  rest.delete("/api/entries/:id", requestHandlers.mockMultipleFailures),
];

const quasiServer = setupServer(...requestInterceptionLayer);

describe("<App>", () => {
  let enhancer: any;
  let initState: IState;
  let history: any;

  beforeAll(() => {
    // Enable API mocking.
    quasiServer.listen();
  });

  beforeEach(() => {
    enhancer = applyMiddleware(thunkMiddleware);

    initState = {
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        ...initialStateAuth,
      },
      entries: {
        ...initialStateEntries,
      },
    };

    history = createMemoryHistory();
  });

  afterEach(() => {
    quasiServer.resetHandlers();
  });

  afterAll(() => {
    // Disable API mocking.
    quasiServer.close();
  });

  test("initial render (i.e. before/without any user interaction)", async () => {
    const realStore = createStore(rootReducer, enhancer);
    render(
      <Provider store={realStore}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );

    let element: HTMLElement;

    element = await screen.findByText("Home");
    expect(element).toBeInTheDocument();
    element = screen.getByText("Sign In");
    expect(element).toBeInTheDocument();
    element = screen.getByText("Sign Up");
    expect(element).toBeInTheDocument();

    element = screen.getByText("Welcome to JournalEntries!");
    expect(element).toBeInTheDocument();
  });

  test("render after the user has signed in", async () => {
    // Arrange.
    quasiServer.use(
      rest.get("/api/user-profile", requestHandlers.mockFetchUserProfile)
    );

    const realStore = createStore(rootReducer, initState, enhancer);

    // Act.
    render(
      <Provider store={realStore}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );

    // Assert.
    let element: HTMLElement;

    element = await screen.findByText("Sign Out");
    expect(element).toBeInTheDocument();
    element = screen.getByText("JournalEntries");
    expect(element).toBeInTheDocument();
    element = screen.getByText("Home");
    expect(element).toBeInTheDocument();
  });

  test("after the user has signed in, the user clicks on 'Sign Out'", async () => {
    // Arrange.
    quasiServer.use(
      rest.get("/api/user-profile", requestHandlers.mockFetchUserProfile)
    );

    const realStore = createStore(rootReducer, initState, enhancer);

    render(
      <Provider store={realStore}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );

    // Act.
    const signOutAnchor: HTMLElement = await screen.findByText("Sign Out");
    fireEvent.click(signOutAnchor);

    // Assert.
    let element: HTMLElement;

    element = await screen.findByText("SIGN-OUT SUCCESSFUL");
    expect(element).toBeInTheDocument();

    element = screen.getByText("Home");
    expect(element).toBeInTheDocument();
    element = screen.getByText("Sign In");
    expect(element).toBeInTheDocument();
    element = screen.getByText("Sign Up");
    expect(element).toBeInTheDocument();
  });

  test(
    "after the user has signed in, the user clicks on 'Sign Out'" +
      " - that should update the localStorage correctly",
    async () => {
      // Arrange.
      localStorage.setItem(JOURNAL_APP_TOKEN, "a-jws-token-issued-by-the-backend");
      // Strictly speaking, the setup logic for this test case renders
      // the next two statements unnecessary-to-have,
      // but including them is of some instructive value.
      initState.auth.token = localStorage.getItem(JOURNAL_APP_TOKEN);
      initState.auth.hasValidToken = true;

      const realStore = createStore(rootReducer, initState, enhancer);
      render(
        <Provider store={realStore}>
          <Router history={history}>
            <App />
          </Router>
        </Provider>
      );

      // Act.
      const signOutAnchor: HTMLElement = await screen.findByText("Sign Out");
      fireEvent.click(signOutAnchor);

      // Assert.
      expect(localStorage.getItem(JOURNAL_APP_TOKEN)).toEqual(null);
    }
  );

  test(
    "if a user hasn't signed in" +
      " but manually saves a token in their web-browser's localStorage," +
      " the frontend application should display only the following navigation links:" +
      " 'Home', 'Sign In', 'Sign Up'",
    async () => {
      // Arrange.

      // Strictly speaking, the setup logic for this test case renders
      // the next two statements unnecessary-to-have,
      // but including them is of some instructive value.
      localStorage.setItem(JOURNAL_APP_TOKEN, "a-jws-token-NOT-issued-by-the-backend");
      initState.auth.token = localStorage.getItem(JOURNAL_APP_TOKEN);

      const realStore = createStore(rootReducer, initState, enhancer);

      // Act.
      render(
        <Provider store={realStore}>
          <Router history={history}>
            <App />
          </Router>
        </Provider>
      );

      // Assert.
      let element: HTMLElement;

      element = await screen.findByText("TO CONTINUE, PLEASE SIGN IN");
      expect(element).toBeInTheDocument();

      element = screen.getByText("Home");
      expect(element).toBeInTheDocument();
      element = screen.getByText("Sign In");
      expect(element).toBeInTheDocument();
      element = screen.getByText("Sign Up");
      expect(element).toBeInTheDocument();
    }
  );

  xtest(
    "if a user signs in" +
      " and goes on to manually change the URL in her browser's address bar" +
      " to /journal-entries ," +
      " the frontend application should redirect to / (but keep the user signed in)",
    async () => {
      // Arrange.
      quasiServer.use(
        rest.get("/api/user-profile", requestHandlers.mockFetchUserProfile),

        rest.get("/api/entries", requestHandlers.mockFetchEntries),
        rest.get("/api/user-profile", requestHandlers.mockFetchUserProfile)
      );

      const realStore = createStore(rootReducer, initState, enhancer);

      // Act:

      // - navigate to the root URL, and mount the application's entire React tree
      history.push("/");

      const { getByText: getByTextFromRootURL } = render(
        <Provider store={realStore}>
          <Router history={history}>
            <App />
          </Router>
        </Provider>
      );

      let element: HTMLElement;

      element = await screen.findByText("Hello, mocked-John Doe!");
      expect(element).toBeInTheDocument();

      // - unamount React trees that were mounted with render
      cleanup();

      // - navigate to the /journal-entries URL,
      //   and mount the application's entire React tree
      console.log("[the test case is]");
      console.log("navigating to the /journal-entries URL");
      console.log("and mounting the application's entire React tree");

      history.push("/journal-entries");

      render(
        <Provider store={realStore}>
          <Router history={history}>
            <App />
          </Router>
        </Provider>
      );

      // Assert.
      await waitFor(() => {
        expect(history.location.pathname).toEqual("/");
      });

      element = screen.getByText("Hello, mocked-John Doe!");
      expect(element).toBeInTheDocument();
    }
  );

  test(
    "if a user hasn't signed in" +
      " but manually changes the URL in her browser's address bar" +
      " to /journal-entries ," +
      " the frontend application should redirect the user to /sign-in",
    async () => {
      // Arrange.
      const realStore = createStore(rootReducer, initState, enhancer);

      // Act.
      history.push("/journal-entries");

      render(
        <Provider store={realStore}>
          <Router history={history}>
            <App />
          </Router>
        </Provider>
      );

      // Assert.
      expect(history.location.pathname).toEqual("/sign-in");

      const elements = screen.queryAllByText("Review JournalEntries!");
      expect(elements.length).toEqual(0);
    }
  );
});

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
        const initState = {
          alerts: {
            ...initialStateAlerts,
          },
          auth: {
            ...initialStateAuth,
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
            ...initialStateEntries,
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
            ...initialStateAlerts,
          },
          auth: {
            ...initialStateAuth,
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
            ...initialStateEntries,
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

describe("<CreateEntry>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    render(
      <Provider store={store}>
        <CreateEntry />
      </Provider>
    );

    const textboxes = screen.getAllByRole("textbox");
    expect(textboxes.length).toEqual(2);

    screen.getByText("You are about to create a new Entry:");

    screen.getByText("Specify your current local time:");
    screen.getByPlaceholderText("YYYY-MM-DD HH:MM");

    screen.getByText("Specify the time zone that you are currently in:");

    screen.getByText("Type up the content of your new Entry:");

    screen.getByText("Create entry");
  });

  test("the user fills out the form (without submitting it)", () => {
    // Arrange.
    render(
      <Provider store={store}>
        <CreateEntry />
      </Provider>
    );

    // Act.
    const [localTimeInput, contentTextArea] = screen.getAllByRole("textbox");
    const timezoneSelect = screen.getByRole("combobox");

    fireEvent.change(localTimeInput, { target: { value: "2021-05-13 00:18" } });
    fireEvent.change(contentTextArea, {
      target: {
        value:
          "'The genius can do many things. But he does only one thing at a time.'" +
          " - Matthew McConaughey",
      },
    });

    fireEvent.change(timezoneSelect, { target: { value: "-08:00" } });

    // Assert.
    /*
    The next statement (implicitly but also effectively) makes an assertion
    about the "current value" of one <input> tag.

    It is worth emphasizing that
    the <input> tag in question doesn't need to include a `value` attribute
    _but_ including it makes the encompasssing test case more friendly/tractable.
    To wit:

      - on the one hand, if the string within the next statement is changed,
        the encompassing test case will fail - which is what one would expect to happen

      - on the other hand, if the <input> tag is rid of its `value` attribute
        and if the string within the next statement is changed,
        the encompassing test case will fail
        _but_ its error message will not indicate the actual "display value" of the
        <input> tag
    */
    screen.getByDisplayValue("2021-05-13 00:18");
    /*
    Replacing the next statement's "-08:00" with "-07:00" causes this test to crash
    and prints out an error message.

    TODO: find out whether the error message can be forced to indicate
          which `<option>` tag is actually `selected`
    */
    screen.getByDisplayValue("-08:00");
    /*
    The next statement (implicitly but also effectively) makes an assertion
    about the "text content" of one <textarea> tag.

    It is worth emphasizing that
    the <textarea> tag in question _needs_ to include a `value` attribute.
    To wit:

      - on the one hand, if the string within the next statement is changed,
        the encompassing test case will fail - which is what one would expect to happen
  
      - on the other hand, if the <textarea> tag is rid of its `value` attribute
        and if the string within the next statement remains unchanged,
        the encompassing test will fail
    */
    screen.getByText(
      "'The genius can do many things. But he does only one thing at a time.'" +
        " - Matthew McConaughey"
    );
  });
});

describe(
  "<Alerts> + <CreateEntry>" +
    " (without the user interaction triggering any network communication)",
  () => {
    test(
      "the user fills out the form in an invalid way" +
        " (by failing to fill out all required fields) and submits it",
      () => {
        // Arrange.
        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        render(
          <Provider store={realStore}>
            <Alerts />
            <CreateEntry />
          </Provider>
        );

        // Act.
        const [localTimeInput, contentTextArea] = screen.getAllByRole("textbox");

        fireEvent.change(localTimeInput, { target: { value: "2021-05-13 00:18" } });
        fireEvent.change(contentTextArea, {
          target: {
            value:
              "'The genius can do many things. But he does only one thing at a time.'" +
              " - Matthew McConaughey",
          },
        });

        const button: HTMLElement = screen.getByRole("button", {
          name: "Create entry",
        });
        fireEvent.click(button);

        // Assert.
        screen.getByText("YOU MUST FILL OUT ALL FORM FIELDS");
      }
    );
  }
);

describe(
  "<Alerts> + <CreateEntry>" +
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
          rest.post("/api/entries", (req, res, ctx) => {
            return res.once(
              ctx.status(400),
              ctx.json({
                error: "mocked-Failed to create a new Entry resource",
              })
            );
          })
        );

        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        render(
          <Provider store={realStore}>
            <Alerts />
            <CreateEntry />
          </Provider>
        );

        // Act.
        const [localTimeInput, contentTextArea] = screen.getAllByRole("textbox");
        const timezoneSelect = screen.getByRole("combobox");

        fireEvent.change(localTimeInput, { target: { value: "2021-05-13 00:18" } });
        fireEvent.change(timezoneSelect, { target: { value: "-08:00" } });
        fireEvent.change(contentTextArea, {
          target: { value: "some insightful content" },
        });

        const button: HTMLElement = screen.getByRole("button", {
          name: "Create entry",
        });
        fireEvent.click(button);

        // Assert.
        const element: HTMLElement = await screen.findByText(
          "mocked-Failed to create a new Entry resource"
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
        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        render(
          <Provider store={realStore}>
            <Alerts />
            <CreateEntry />
          </Provider>
        );

        // Act.
        const [localTimeInput, contentTextArea] = screen.getAllByRole("textbox");
        const timezoneSelect = screen.getByRole("combobox");

        fireEvent.change(localTimeInput, { target: { value: "2021-05-13 00:18" } });
        fireEvent.change(timezoneSelect, { target: { value: "-08:00" } });
        fireEvent.change(contentTextArea, {
          target: { value: "some insightful content" },
        });

        const button: HTMLElement = screen.getByRole("button", {
          name: "Create entry",
        });
        fireEvent.click(button);

        // Assert.
        const element: HTMLElement = await screen.findByText(
          "[FROM <CreateEntry>'S handleSubmit] PLEASE SIGN BACK IN"
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
        quasiServer.use(rest.post("/api/entries", requestHandlers.mockCreateEntry));

        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        const history = createMemoryHistory();
        history.push("/entries/create");

        render(
          <Provider store={realStore}>
            <Alerts />
            <Router history={history}>
              <Route exact path="/entries/create">
                <CreateEntry />
              </Route>
            </Router>
          </Provider>
        );

        // Act.
        const [localTimeInput, contentTextArea] = screen.getAllByRole("textbox");
        const timezoneSelect = screen.getByRole("combobox");

        fireEvent.change(localTimeInput, { target: { value: "2021-05-13 00:18" } });
        fireEvent.change(timezoneSelect, { target: { value: "-08:00" } });
        fireEvent.change(contentTextArea, {
          target: { value: "some insightful content " },
        });

        const button: HTMLElement = screen.getByRole("button", {
          name: "Create entry",
        });
        fireEvent.click(button);

        // Assert.
        const element: HTMLElement = await screen.findByText(
          "ENTRY CREATION SUCCESSFUL"
        );
        expect(element).toBeInTheDocument();

        expect(history.location.pathname).toEqual("/journal-entries");
      }
    );
  }
);

describe("<EditEntry>", () => {
  let history;
  let realStore;

  beforeEach(() => {
    const initState: IState = {
      alerts: {
        ...initialStateAlerts,
      },
      auth: {
        ...initialStateAuth,
        requestStatus: RequestStatus.SUCCEEDED,
        token: "token-issued-by-the-backend",
        hasValidToken: true,
      },
      entries: {
        ...initialStateEntries,
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

describe("<DeleteEntryLink>", () => {
  let history: any;

  beforeEach(() => {
    history = createMemoryHistory();
  });

  test("initial render", () => {
    const { getByText } = render(
      <Router history={history}>
        <DeleteEntryLink to="/entries/17/delete" />
      </Router>
    );

    getByText("Delete");
  });

  test(
    "the user hovers her mouse" +
      " first over the anchor tag, and then away from that tag",
    () => {
      // Arrange.
      render(
        <Router history={history}>
          <DeleteEntryLink to="/entries/17/delete" />
        </Router>
      );

      const deleteAnchor = screen.getByText("Delete");

      // Act.
      fireEvent.mouseEnter(deleteAnchor);

      // Assert.
      screen.getByText(
        "(HINT: After clicking, you will be asked to confirm your choice.)"
      );

      // Act.
      fireEvent.mouseLeave(deleteAnchor);

      // Assert.
      const hint = screen.queryByText(
        "(HINT: After clicking, you will be asked to confirm your choice.)"
      );
      expect(hint).toEqual(null);
    }
  );
});

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

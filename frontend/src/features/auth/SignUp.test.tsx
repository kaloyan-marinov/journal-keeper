import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import thunkMiddleware from "redux-thunk";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import { Route, Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import { IState } from "../../types";
import { JOURNAL_APP_TOKEN } from "../../constants";
import { INITIAL_STATE, rootReducer } from "../../store";
import { SignUp } from "./SignUp";
import { Alerts } from "../alerts/Alerts";
import { requestHandlers } from "../../testHelpers";
import { MOCK_PROFILE_1 } from "../../mockPiecesOfData";
import { Home } from "../Home";

import { DefaultRequestBody, MockedRequest, rest, RestHandler } from "msw";
import { setupServer, SetupServerApi } from "msw/node";

describe("standalone - as a single component", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    // Arrange.
    const realStore = createStore(rootReducer);

    // Act.
    render(
      <Provider store={realStore}>
        <SignUp />
      </Provider>
    );

    // Assert.
    screen.getByText("Create a new account!");

    const forms = screen.getAllByRole("form");
    expect(forms.length).toEqual(1);

    screen.getByPlaceholderText("Choose a username...");
    screen.getByPlaceholderText("Enter your name...");
    screen.getByPlaceholderText("Enter your email address...");
    screen.getByPlaceholderText("Choose a password...");
    screen.getByPlaceholderText("Repeat the chosen password...");
    screen.getByText("Create an account for me");
  });

  test("the user fills out the form (without submitting it)", () => {
    // Arrange.
    const realStore = createStore(rootReducer);

    // Act.
    render(
      <Provider store={realStore}>
        <SignUp />
      </Provider>
    );

    // Assert.
    const usernameInput = screen.getByPlaceholderText("Choose a username...");
    const nameInput = screen.getByPlaceholderText("Enter your name...");
    const emailInput = screen.getByPlaceholderText("Enter your email address...");
    const passwordInput = screen.getByPlaceholderText("Choose a password...");
    const repeatPasswordInput = screen.getByPlaceholderText(
      "Repeat the chosen password..."
    );

    fireEvent.change(usernameInput, { target: { value: "[f-e] jd" } });
    fireEvent.change(nameInput, { target: { value: "[f-e] John Doe" } });
    fireEvent.change(emailInput, {
      target: { value: "[f-e] john.doe@protonmail.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });
    fireEvent.change(repeatPasswordInput, { target: { value: "[f-e] 456" } });

    screen.getByDisplayValue("[f-e] jd");
    screen.getByDisplayValue("[f-e] John Doe");
    screen.getByDisplayValue("[f-e] john.doe@protonmail.com");
    screen.getByDisplayValue("[f-e] 123");
    screen.getByDisplayValue("[f-e] 456");
  });
});

describe("+ <Home>", () => {
  test(
    "if a(n already registered) user has already signed in" +
      " and then tries to navigate to /sign-up," +
      " she should be redirected to /",
    () => {
      // Arrange.
      const token = "pretend-that-this-was-actually-issued-by-the-backend";
      localStorage.setItem(JOURNAL_APP_TOKEN, token);

      const initState: IState = {
        ...INITIAL_STATE,
        auth: {
          ...INITIAL_STATE.auth,
          token,
          hasValidToken: true,
          signedInUserProfile: MOCK_PROFILE_1,
        },
      };
      const enhancer = applyMiddleware(thunkMiddleware);
      const realStore = createStore(rootReducer, initState, enhancer);

      const history = createMemoryHistory();

      // Act.
      history.push("/sign-up");

      render(
        <Provider store={realStore}>
          <Router history={history}>
            <Route exact path="/sign-up">
              <SignUp />
            </Route>
            <Route exact path="/">
              <Home />
            </Route>
          </Router>
        </Provider>
      );

      // Assert.
      expect(history.location.pathname).toEqual("/");

      screen.getByText("Hello, mocked-John Doe!");
    }
  );
});

describe(
  "+ <Alerts>" + " (without the user interaction triggering any network communication)",
  () => {
    test(
      "the user fills out the form in an invalid way" +
        " (by failing to fill out all required fields) and submits it",
      () => {
        // Arrange.
        const realStore = createStore(rootReducer);

        render(
          <Provider store={realStore}>
            <Alerts />
            <SignUp />
          </Provider>
        );

        // Act.
        const usernameInput = screen.getByPlaceholderText("Choose a username...");
        const nameInput = screen.getByPlaceholderText("Enter your name...");
        const emailInput = screen.getByPlaceholderText("Enter your email address...");
        const repeatPasswordInput = screen.getByPlaceholderText(
          "Repeat the chosen password..."
        );

        fireEvent.change(usernameInput, { target: { value: "[f-e] jd" } });
        fireEvent.change(nameInput, { target: { value: "[f-e] John Doe" } });
        fireEvent.change(emailInput, {
          target: { value: "[f-e] john.doe@protonmail.com" },
        });
        fireEvent.change(repeatPasswordInput, { target: { value: "[f-e] 123" } });

        const button: HTMLElement = screen.getByRole("button", {
          name: "Create an account for me",
        });
        fireEvent.click(button);

        // Assert.
        screen.getByText("YOU MUST FILL OUT ALL FORM FIELDS");
      }
    );

    test(
      "the user fills out the form in an invalid way" +
        " (by providing different texts in the 2 password fields) and submits it",
      () => {
        // Arrange.
        const realStore = createStore(rootReducer);

        render(
          <Provider store={realStore}>
            <Alerts />
            <SignUp />
          </Provider>
        );

        // Act.
        const usernameInput = screen.getByPlaceholderText("Choose a username...");
        const nameInput = screen.getByPlaceholderText("Enter your name...");
        const emailInput = screen.getByPlaceholderText("Enter your email address...");
        const passwordInput = screen.getByPlaceholderText("Choose a password...");
        const repeatPasswordInput = screen.getByPlaceholderText(
          "Repeat the chosen password..."
        );

        fireEvent.change(usernameInput, { target: { value: "[f-e] jd" } });
        fireEvent.change(nameInput, { target: { value: "[f-e] John Doe" } });
        fireEvent.change(emailInput, {
          target: { value: "[f-e] john.doe@protonmail.com" },
        });
        fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });
        fireEvent.change(repeatPasswordInput, { target: { value: "[f-e] 456" } });

        const button: HTMLElement = screen.getByRole("button", {
          name: "Create an account for me",
        });
        fireEvent.click(button);

        // Assert.
        screen.getByText(/THE PROVIDED PASSWORDS DON'T MATCH/);
      }
    );
  }
);

/* Create an MSW "request-interception layer". */
const restHandlers: RestHandler<MockedRequest<DefaultRequestBody>>[] = [];

const requestInterceptionLayer: SetupServerApi = setupServer(...restHandlers);

describe(
  "+ <Alerts>" + " (with the user interaction triggering network communication)",
  () => {
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
          rest.post("/api/users", (req, res, ctx) => {
            return res.once(
              ctx.status(400),
              ctx.json({
                error: "mocked-Failed to create a new User resource",
              })
            );
          })
        );

        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        render(
          <Provider store={realStore}>
            <Alerts />
            <SignUp />
          </Provider>
        );

        // Act.
        const usernameInput = screen.getByPlaceholderText("Choose a username...");
        const nameInput = screen.getByPlaceholderText("Enter your name...");
        const emailInput = screen.getByPlaceholderText("Enter your email address...");
        const passwordInput = screen.getByPlaceholderText("Choose a password...");
        const repeatPasswordInput = screen.getByPlaceholderText(
          "Repeat the chosen password..."
        );

        fireEvent.change(usernameInput, { target: { value: "[f-e] jd" } });
        fireEvent.change(nameInput, { target: { value: "[f-e] John Doe" } });
        fireEvent.change(emailInput, {
          target: { value: "[f-e] john.doe@protonmail.com" },
        });
        fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });
        fireEvent.change(repeatPasswordInput, { target: { value: "[f-e] 123" } });

        const button: HTMLElement = screen.getByRole("button", {
          name: "Create an account for me",
        });
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
        getByText("mocked-Failed to create a new User resource");
        */
        // This causes the test to PASS:
        /*
        await waitFor(() => {
          screen.getByText("mocked-Failed to create a new User resource");
        });
        */
        // as does this:
        const element: HTMLElement = await screen.findByText(
          "mocked-Failed to create a new User resource"
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
        requestInterceptionLayer.use(
          rest.post("/api/users", requestHandlers.mockCreateUser)
        );

        const enhancer = applyMiddleware(thunkMiddleware);
        const realStore = createStore(rootReducer, enhancer);

        render(
          <Provider store={realStore}>
            <Alerts />
            <SignUp />
          </Provider>
        );

        // Act.
        const usernameInput = screen.getByPlaceholderText("Choose a username...");
        const nameInput = screen.getByPlaceholderText("Enter your name...");
        const emailInput = screen.getByPlaceholderText("Enter your email address...");
        const passwordInput = screen.getByPlaceholderText("Choose a password...");
        const repeatPasswordInput = screen.getByPlaceholderText(
          "Repeat the chosen password..."
        );

        fireEvent.change(usernameInput, { target: { value: "[f-e] jd" } });
        fireEvent.change(nameInput, { target: { value: "[f-e] John Doe" } });
        fireEvent.change(emailInput, {
          target: { value: "[f-e] john.doe@protonmail.com" },
        });
        fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });
        fireEvent.change(repeatPasswordInput, { target: { value: "[f-e] 123" } });

        const button: HTMLElement = screen.getByRole("button", {
          name: "Create an account for me",
        });
        fireEvent.click(button);

        // Assert.
        const element: HTMLElement = await screen.findByText("REGISTRATION SUCCESSFUL");
        expect(element).toBeInTheDocument();
      }
    );
  }
);

import { render, screen, fireEvent } from "@testing-library/react";
import thunkMiddleware from "redux-thunk";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";

import { rootReducer, store } from "../../store";
import { SignIn } from "./SignIn";
import { Alerts } from "../alerts/Alerts";
import { requestHandlers } from "../../testHelpers";
import { Route, Router, Switch } from "react-router-dom";

import { DefaultRequestBody, MockedRequest, rest, RestHandler } from "msw";
import { setupServer } from "msw/node";
import { createMemoryHistory } from "history";

describe("<SignIn>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    render(
      <Provider store={store}>
        <SignIn />
      </Provider>
    );

    screen.getByText("Log in to your account!");

    const forms = screen.getAllByRole("form");
    expect(forms.length).toEqual(1);

    screen.getByPlaceholderText("Enter your email...");
    screen.getByPlaceholderText("Enter your password...");
    screen.getByText("Sign me in");
  });

  test("the user fills out the form (without submitting it)", () => {
    render(
      <Provider store={store}>
        <SignIn />
      </Provider>
    );

    const emailInput = screen.getByPlaceholderText("Enter your email...");
    const passwordInput = screen.getByPlaceholderText("Enter your password...");

    fireEvent.change(emailInput, { target: { value: "[f-e] jd" } });
    fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });

    screen.getByDisplayValue("[f-e] jd");
    screen.getByDisplayValue("[f-e] 123");
  });
});

describe(
  "<Alerts> + <SignIn>" +
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
            <SignIn />
          </Provider>
        );

        // Act.
        const emailInput = screen.getByPlaceholderText("Enter your email...");
        const passwordInput = screen.getByPlaceholderText("Enter your password...");

        fireEvent.change(emailInput, { target: { value: "" } });
        fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });

        const button: HTMLElement = screen.getByRole("button", { name: "Sign me in" });
        fireEvent.click(button);

        // Assert.
        screen.getByText("YOU MUST FILL OUT ALL FORM FIELDS");
      }
    );
  }
);

/* Create an MSW "request-interception layer". */
const requestInterceptionLayer: RestHandler<MockedRequest<DefaultRequestBody>>[] = [
  rest.post("/api/tokens", requestHandlers.mockMultipleFailures),
];

const quasiServer = setupServer(...requestInterceptionLayer);

describe(
  "<Alerts> + <SignIn>" +
    " (with the user interaction triggering network communication)",
  () => {
    let realStore: any;

    beforeAll(() => {
      // Enable API mocking.
      quasiServer.listen();
    });

    beforeEach(() => {
      quasiServer.resetHandlers();

      const enhancer = applyMiddleware(thunkMiddleware);
      realStore = createStore(rootReducer, enhancer);
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
        render(
          <Provider store={realStore}>
            <Alerts />
            <SignIn />
          </Provider>
        );

        // Act.
        const emailInput = screen.getByPlaceholderText("Enter your email...");
        const passwordInput = screen.getByPlaceholderText("Enter your password...");

        fireEvent.change(emailInput, { target: { value: "[f-e] jd" } });
        fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });

        const button: HTMLElement = screen.getByRole("button", { name: "Sign me in" });
        fireEvent.click(button);

        // Assert.
        const element = await screen.findByText("mocked-authentication required");
        expect(element).toBeInTheDocument();
      }
    );

    test(
      "the user fills out the form and submits it," +
        " and the backend is _mocked_ to respond that" +
        " the form submission was accepted as valid and processed",
      async () => {
        // Arrange.
        quasiServer.use(rest.post("/api/tokens", requestHandlers.mockIssueJWSToken));

        const history = createMemoryHistory();
        history.push("/sign-in");

        render(
          <Provider store={realStore}>
            <Router history={history}>
              <Alerts />
              <Switch>
                <Route exact path="/sign-in">
                  <SignIn />
                </Route>
              </Switch>
            </Router>
          </Provider>
        );

        // Act.
        const emailInput = screen.getByPlaceholderText("Enter your email...");
        const passwordInput = screen.getByPlaceholderText("Enter your password...");

        fireEvent.change(emailInput, { target: { value: "[f-e] jd" } });
        fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });

        const button: HTMLElement = screen.getByRole("button", { name: "Sign me in" });
        fireEvent.click(button);

        // Assert.
        const element: HTMLElement = await screen.findByText("SIGN-IN SUCCESSFUL");
        expect(element).toBeInTheDocument();

        expect(history.location.pathname).toEqual("/");
      }
    );
  }
);

import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";

import { rootReducer, store } from "../../store";
import { Alerts } from "../alerts/Alerts";
import { CreateEntry } from "./CreateEntry";

import { requestHandlers } from "../../testHelpers";
import { DefaultRequestBody, MockedRequest, rest, RestHandler } from "msw";
import { setupServer } from "msw/node";
import { createMemoryHistory } from "history";
import { Route, Router } from "react-router-dom";

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

/* Create an MSW "request-interception layer". */
const requestInterceptionLayer: RestHandler<MockedRequest<DefaultRequestBody>>[] = [
  rest.post("/api/entries", requestHandlers.mockMultipleFailures),
];

const quasiServer = setupServer(...requestInterceptionLayer);

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

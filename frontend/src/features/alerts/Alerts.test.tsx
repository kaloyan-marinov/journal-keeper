import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { IState } from "../../types";
import { INITIAL_STATE_AUTH, INITIAL_STATE_ENTRIES } from "../../constants";
import { Alerts } from "./Alerts";
import { rootReducer, store } from "../../store";

describe("<Alerts>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    render(
      <Provider store={store}>
        <Alerts />
      </Provider>
    );

    screen.getByText("<Alerts>");
  });

  test(
    "initial render (i.e. before/without any user interaction)" +
      " - illustration of how to assert that" +
      " a function (or other block of code) will throw an error",
    () => {
      render(
        <Provider store={store}>
          <Alerts />
        </Provider>
      );

      /*
      The official Jest documentation makes the following closely-related statements:
        (
          https://jestjs.io/docs/using-matchers
          >>
          Note:
          the function that throws an exception
          needs to be invoked within a wrapping function[;]
          otherwise[,] the `toThrow` assertion will fail.
        )
      and
        (
          https://jestjs.io/docs/expect
          >>
          You must wrap the code in a function,
          otherwise the error will not be caught and the assertion will fail.
        )
      
      Both of the above statements can be condensed into the following single one:
          If you want to write a test which asserts that
          a function (or other block of code) will throw an error,
          then:
          (a) the function (or block of code) must be invoked
              within a "wrapping function", and
          (b) that "wrapping function" must be passed into Jest's `expect` function.

          Otherwise, the `toThrow` matcher will not catch the error,
          which gets thrown by the input of `expect`,
          _and_ that uncaught error will cause the encompassing test-case to fail.
      */

      /*
      // This won't work:
      expect(screen.getByText("some non-existent alert text")).toThrowError();
      */
      // This works:
      expect(() => screen.getByText("some non-existent alert text")).toThrowError();
    }
  );

  test(
    "the user clicks on the 'X' button," +
      " which is associated with a particular alert message",
    () => {
      const initState: IState = {
        alerts: {
          ids: ["a-id-0", "a-id-1"],
          entities: {
            "a-id-0": {
              id: "a-id-0",
              message: "Alert Message #0",
            },
            "a-id-1": {
              id: "a-id-1",
              message: "Alert Message #1",
            },
          },
        },
        auth: {
          ...INITIAL_STATE_AUTH,
        },
        entries: {
          ...INITIAL_STATE_ENTRIES,
        },
      };
      const storeWithAlerts = createStore(rootReducer, initState);
      render(
        <Provider store={storeWithAlerts}>
          <Alerts />
        </Provider>
      );

      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]);

      expect(() => {
        // Use a regex to match a substring:
        screen.getByText(/Alert Message #0/);
      }).toThrowError();
      // Again, use a regex to match a substring:
      screen.getByText(/Alert Message #1/);
    }
  );
});

import { render } from "@testing-library/react";

import App from "./App";

describe("<App>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText } = render(<App />);

    getByText("Home");
    getByText("Sign Up");

    getByText("Welcome to MyMonthlyJournal!");
  });
});

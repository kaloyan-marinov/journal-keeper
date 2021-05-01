import { render } from "@testing-library/react";

import App, { SignUp, SignIn, MyMonthlyJournal } from "./App";

describe("<App>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText } = render(<App />);

    getByText("Home");
    getByText("Sign Up");
    getByText("Sign In");
    getByText("MyMonthlyJournal");

    getByText("Welcome to MyMonthlyJournal!");
  });
});

describe("<SignUp>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText } = render(<SignUp />);

    getByText("Create a new account!");
  });
});

describe("<SignIn>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText } = render(<SignIn />);

    getByText("Log in to your account!");
  });
});

describe("<MyMonthlyJournal>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText } = render(<MyMonthlyJournal />);

    getByText("Review the entries in MyMonthlyJournal!");
  });
});

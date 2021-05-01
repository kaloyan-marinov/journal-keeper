import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

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
    const { getByText, getAllByRole, getByPlaceholderText } = render(<SignUp />);

    getByText("Create a new account!");

    const forms = getAllByRole("form");
    expect(forms.length).toEqual(1);

    getByPlaceholderText("Choose a username...");
    getByPlaceholderText("Enter your name...");
    getByPlaceholderText("Enter your email address...");
    getByPlaceholderText("Choose a password...");
    getByPlaceholderText("Repeat the chosen password...");
    getByText("Create an account for me");
  });
});

describe("<SignIn>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText, getAllByRole, getByPlaceholderText } = render(<SignIn />);

    getByText("Log in to your account!");

    const forms = getAllByRole("form");
    expect(forms.length).toEqual(1);

    getByPlaceholderText("Enter your username...");
    getByPlaceholderText("Enter your password...");
    getByText("Sign me in");
  });
});

describe("<MyMonthlyJournal>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText, getAllByText } = render(
      <BrowserRouter>
        <MyMonthlyJournal />
      </BrowserRouter>
    );

    getByText("Review the entries in MyMonthlyJournal!");
    getByText("Create a new entry");

    getByText("Then it dawned on me: there is no finish line!");
    getByText("Mallorca has beautiful sunny beaches!");

    const editLinks = getAllByText("Edit");
    expect(editLinks.length).toEqual(2);
  });
});

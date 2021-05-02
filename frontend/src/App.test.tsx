import { render, fireEvent } from "@testing-library/react";
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

  test("the user fills out the form (without submitting it)", () => {
    const { getByPlaceholderText, getByDisplayValue } = render(<SignUp />);

    const usernameInput = getByPlaceholderText("Choose a username...");
    const nameInput = getByPlaceholderText("Enter your name...");
    const emailInput = getByPlaceholderText("Enter your email address...");
    const passwordInput = getByPlaceholderText("Choose a password...");
    const repeatPasswordInput = getByPlaceholderText("Repeat the chosen password...");

    fireEvent.change(usernameInput, { target: { value: "[f-e] jd" } });
    fireEvent.change(nameInput, { target: { value: "[f-e] John Doe" } });
    fireEvent.change(emailInput, {
      target: { value: "[f-e] john.doe@protonmail.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });
    fireEvent.change(repeatPasswordInput, { target: { value: "[f-e] 456" } });

    getByDisplayValue("[f-e] jd");
    getByDisplayValue("[f-e] John Doe");
    getByDisplayValue("[f-e] john.doe@protonmail.com");
    getByDisplayValue("[f-e] 123");
    getByDisplayValue("[f-e] 456");
  });
});

describe("<SignIn>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    const { getByText, getAllByRole, getByPlaceholderText } = render(<SignIn />);

    getByText("Log in to your account!");

    const forms = getAllByRole("form");
    expect(forms.length).toEqual(1);

    getByPlaceholderText("Enter your email...");
    getByPlaceholderText("Enter your password...");
    getByText("Sign me in");
  });

  test("the user fills out the form (without submitting it)", () => {
    const { getByPlaceholderText, getByDisplayValue } = render(<SignIn />);

    const emailInput = getByPlaceholderText("Enter your email...");
    const passwordInput = getByPlaceholderText("Enter your password...");

    fireEvent.change(emailInput, { target: { value: "[f-e] jd" } });
    fireEvent.change(passwordInput, { target: { value: "[f-e] 123" } });

    getByDisplayValue("[f-e] jd");
    getByDisplayValue("[f-e] 123");
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

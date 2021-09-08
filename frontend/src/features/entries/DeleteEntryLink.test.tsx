import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryHistory, MemoryHistory } from "history";
import { Router } from "react-router-dom";

import { DeleteEntryLink } from "./DeleteEntryLink";

let history: MemoryHistory<unknown>;
let element: HTMLElement;

beforeEach(() => {
  history = createMemoryHistory();
});

test("initial render", () => {
  render(
    <Router history={history}>
      <DeleteEntryLink to="/entries/17/delete" />
    </Router>
  );

  element = screen.getByText("Delete");
  expect(element).toBeInTheDocument();
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
    element = screen.getByText(
      "(HINT: After clicking, you will be asked to confirm your choice.)"
    );
    expect(element).toBeInTheDocument();

    // Act.
    fireEvent.mouseLeave(deleteAnchor);

    // Assert.
    const hint = screen.queryByText(
      "(HINT: After clicking, you will be asked to confirm your choice.)"
    );
    expect(hint).toEqual(null);
  }
);

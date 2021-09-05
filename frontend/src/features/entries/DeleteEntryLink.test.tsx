import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";

import { DeleteEntryLink } from "./DeleteEntryLink";

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

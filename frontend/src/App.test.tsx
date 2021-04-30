import { render } from "@testing-library/react";

import App from "./App";

describe("<App>", () => {
  test("initial render (i.e. before/without any user interaction)", () => {
    /*
    TODO: update this test case, as suggested by https://stackoverflow.com/questions/54234515/get-by-html-element-with-react-testing-library
    */
    const { container } = render(<App />);

    const divs = container.querySelectorAll("div");

    expect(divs.length).toEqual(1);
  });
});

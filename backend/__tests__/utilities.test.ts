import { buildURLWithPaginationParams, PaginationHelper } from "../src/utilities";

test("buildURLWithPaginationParams", () => {
  const url = "https://some-elementary-school.com/api/students";
  const perPage = 10;
  const page = 3;

  const urlWithParams = buildURLWithPaginationParams(url, perPage, page);

  expect(urlWithParams).toEqual(
    "https://some-elementary-school.com/api/students?perPage=10&page=3"
  );
});

describe("PaginationHelper", () => {
  let paginationHelper: PaginationHelper;

  beforeEach(() => {
    const perPageStr: string = "10";
    const pageString: string = "3";
    const totalItems: number = 47;

    paginationHelper = new PaginationHelper(perPageStr, pageString, totalItems);
  });

  test("instantiates an object correctly", () => {
    expect(paginationHelper.perPage).toEqual(10);
    expect(paginationHelper.page).toEqual(3);
    expect(paginationHelper.totalPages).toEqual(5);
  });

  test(
    "builds pagination links correctly," +
      " when there exist both a `next` and `prev` page of results",
    () => {
      const origin: string = "https://some-elementary-school.com";
      const path = "/api/students";

      const links = paginationHelper.buildLinks(origin, path);

      expect(links).toEqual({
        self: "https://some-elementary-school.com/api/students?perPage=10&page=3",
        next: "https://some-elementary-school.com/api/students?perPage=10&page=4",
        prev: "https://some-elementary-school.com/api/students?perPage=10&page=2",
        first: "https://some-elementary-school.com/api/students?perPage=10&page=1",
        last: "https://some-elementary-school.com/api/students?perPage=10&page=5",
      });
    }
  );
});

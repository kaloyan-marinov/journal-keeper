import { IPaginationLinks } from "./types";

export const buildLinkWithPaginationParams = (
  url: URL,
  perPage: number,
  page: number
): string => {
  const changedUrl: URL = new URL(url.toString());
  changedUrl.searchParams.set("perPage", perPage.toString());
  changedUrl.searchParams.set("page", page.toString());
  return changedUrl.pathname + changedUrl.search;
};

const PER_PAGE_DEFAULT: number = 10;
const PER_PAGE_MAX: number = 100;

const PAGE_DEFAULT: number = 1;

export class PaginationHelper {
  perPage: number;
  page: number;
  totalPages: number;

  constructor(
    perPageStr: string | undefined,
    pageStr: string | undefined,
    totalItems: number
  ) {
    let perPage: number =
      perPageStr === undefined ? PER_PAGE_DEFAULT : parseInt(perPageStr);
    perPage = isNaN(perPage) ? PER_PAGE_DEFAULT : perPage;
    perPage = Math.min(perPage, PER_PAGE_MAX);
    this.perPage = perPage;

    let page: number = pageStr === undefined ? PAGE_DEFAULT : parseInt(pageStr);
    page = isNaN(page) ? PAGE_DEFAULT : page;
    this.page = page;

    /*
    TODO:
        find out why TypeScript complains when I change the next instruction into
        `this.totalPages: number = ...`
    */
    this.totalPages = Math.ceil(totalItems / this.perPage);
  }

  offset(): number {
    return (this.page - 1) * this.perPage;
  }

  buildLinks(url: URL): IPaginationLinks {
    const linkToSelf: string = buildLinkWithPaginationParams(
      url,
      this.perPage,
      this.page
    );

    const linkToNext: string | null =
      this.page < this.totalPages
        ? buildLinkWithPaginationParams(url, this.perPage, this.page + 1)
        : null;
    const linkToPrev: string | null =
      this.page > 1
        ? buildLinkWithPaginationParams(url, this.perPage, this.page - 1)
        : null;

    const linkToFirst: string = buildLinkWithPaginationParams(url, this.perPage, 1);
    const linkToLast: string = buildLinkWithPaginationParams(
      url,
      this.perPage,
      this.totalPages
    );

    return {
      self: linkToSelf,
      next: linkToNext,
      prev: linkToPrev,
      first: linkToFirst,
      last: linkToLast,
    };
  }
}

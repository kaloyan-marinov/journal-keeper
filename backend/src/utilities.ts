export const buildURLWithPaginationParams = (
  url: string,
  perPage: number,
  page: number
): string => {
  const urlObject = new URL(url);
  urlObject.searchParams.append("perPage", perPage.toString());
  urlObject.searchParams.append("page", page.toString());
  return urlObject.toString();
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

  buildLinks(origin: string, originalUrl: string, path: string): any {
    const linkToSelf: string = origin + originalUrl;
    const linkToNext: string | null =
      this.page < this.totalPages
        ? buildURLWithPaginationParams(origin + path, this.perPage, this.page + 1)
        : null;
    const linkToPrev: string | null =
      this.page > 1
        ? buildURLWithPaginationParams(origin + path, this.perPage, this.page - 1)
        : null;
    const linkToFirst: string = buildURLWithPaginationParams(
      origin + path,
      this.perPage,
      1
    );
    const linkToLast: string = buildURLWithPaginationParams(
      origin + path,
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

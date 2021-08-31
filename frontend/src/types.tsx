export interface IEntry {
  id: number;
  timestampInUTC: string;
  utcZoneOfTimestamp: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface IPaginationMeta {
  totalItems: number | null;
  perPage: number | null;
  totalPages: number | null;
  page: number | null;
}

export interface IPaginationLinks {
  self: string | null;
  next: string | null;
  prev: string | null;
  first: string | null;
  last: string | null;
}

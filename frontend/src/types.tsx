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
  totalItems: number;
  perPage: number;
  totalPages: number;
  page: number;
}

export interface IPaginationLinks {
  self: string | null;
  next: string | null;
  prev: string | null;
  first: string | null;
  last: string | null;
}

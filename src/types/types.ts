export type SortDirection = "asc" | "desc";

export interface SortConfig {
  columnIndex: number;
  direction: SortDirection;
}

export interface Column<T> {
  header: string;
  accessor: (row: T) => string | number;
  sortValue?: (row: T) => string | number;
  sortable?: boolean;
}

export interface LocationResult {
  timestamp: number;
  address?: { street: string; city: string };
  executionTime?: number;
  status: "loading" | "success" | "error";
  error?: string;
}

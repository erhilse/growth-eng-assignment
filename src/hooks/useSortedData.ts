import { useMemo } from "react";
import { SortConfig } from "../types/types";

export function useSortedData<T>(
  data: T[],
  sortConfig: SortConfig,
  columns: { accessor: (row: T) => string | number; sortValue?: (row: T) => string | number }[]
) {
  return useMemo(() => {
    const { columnIndex, direction } = sortConfig;
    const column = columns[columnIndex];

    // Use sortValue if provided or fallback to accessor
    const getValue = column.sortValue || column.accessor;

    return [...data].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);

      // Handle numeric comparison first
      if (typeof valA === "number" && typeof valB === "number") {
        return direction === "asc" ? valA - valB : valB - valA;
      }

      // Fallback to string comparison (case-sensitive by default)
      return direction === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [data, sortConfig, columns]);
}

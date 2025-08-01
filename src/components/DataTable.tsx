import React from "react";
import { css, cx } from "@emotion/css";
import { Column, SortConfig } from "../types/types";

const styles = {
  table: css`
    border-collapse: collapse;
    width: 100%;
  `,
  thead: css`
    background-color: var(--color-background);
    position: sticky;
    top: 0;

    &::after {
      background: var(--color-border);
      bottom: 0;
      content: '';
      height: 2px;
      left: 0;
      position: absolute;
      width: 100%;
    }
  `,
  tr: css`
    &:nth-child(even) {
      td {
        background-color: var(--color-surface);
      }
    }
  `,
  th: css`
    color: var(--color-text);
    font-size: var(--font-size-sm);
    font-weight: 600;
    line-height: var(--line-height-sm);
    padding: var(--space-2) var(--space-1);
    text-align: left;
    user-select: none;

    @media (min-width: 768px) {
      padding: var(--space-4) var(--space-3);
    }

    > span {
      align-items: center;
      display: flex;
      gap: var(--space-2);
    }

    svg {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
    }
  `,
  sortableTh: css`
    cursor: pointer;
  `,
  td: css`
    color: var(--color-text);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    padding: var(--space-2) var(--space-1);

    @media (min-width: 768px) {
      padding: var(--space-4) var(--space-3);
    }
  `,
  visuallyHidden: css`
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  `
};

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortConfig: SortConfig;
  onSort: (columnIndex: number) => void;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  sortConfig,
  onSort,
  emptyState
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const getSortArrow = (index: number) =>
    sortConfig.columnIndex === index
      ? sortConfig.direction === "asc"
        ? <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24"><polyline style={{fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2px'}} points="21 16.2671 12 7.7329 3 16.2671"/></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24"><polyline style={{fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2px'}} points="3 7.7329 12 16.2671 21 7.7329"/></svg>
      : "";

  const getAriaSort = (index: number) => {
    if (!columns[index].sortable) return "none";
    if (sortConfig.columnIndex !== index) return "none";
    return sortConfig.direction === "asc" ? "ascending" : "descending";
  };

  return (
    <table className={styles.table}>
      <thead className={styles.thead}>
        <tr>
          {columns.map((col, index) => (
            <th
              key={index}
              className={cx(styles.th, col.sortable && styles.sortableTh)}
              aria-sort={getAriaSort(index)}
              onClick={col.sortable ? () => onSort(index) : undefined}
              tabIndex={col.sortable ? 0 : -1}
              onKeyDown={(e) => {
                if (col.sortable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSort(index);
                }
              }}
              role="columnheader"
              scope="col"
            >
              <span>
                {col.header}
                {col.sortable && (
                  <>
                    {getSortArrow(index)}
                    <span className={styles.visuallyHidden}>
                      {sortConfig.columnIndex === index
                        ? `Sorted ${sortConfig.direction}`
                        : "Not sorted"}
                    </span>
                  </>
                )}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} className={styles.tr}>
            {columns.map((col, colIndex) => (
              <td key={colIndex} className={styles.td}>
                {col.accessor(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

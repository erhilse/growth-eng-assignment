import React, { useState, useCallback, useMemo } from "react";
import { css } from "@emotion/css";
import { fetchLastLocation } from "./backend/fetchLastLocations";
import { Column, LocationResult, SortConfig } from "./types/types";
import { useSortedData } from "./hooks/useSortedData";
import { DataTable } from "./components/DataTable";

const styles = {
  layout: css`
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  `,
  header: css`
    align-items: center;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    padding: var(--space-2) var(--space-4);
  `,
  footer: css`
    background-color: var(--color-background);
    border-top: 1px solid var(--color-border);
    bottom: 0;
    padding: var(--space-2) var(--space-4);
    position: sticky;
  `,
  title: css`
    color: var(--color-text);
    margin: 0;
  `,
  button: css`
    background-color: var(--color-primary);
    border: 0;
    border-radius: 6px;
    color: var(--color-white);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: 600;
    padding: var(--space-2) var(--space-3);
  `,
  container: css`
    flex-grow: 1;
  `,
  centerContainer: css`
    padding: 0 var(--space-6);
    place-content: center;
  `,
  stats: css`
    display: flex;
    gap: var(--space-6);
  `,
  stat: css`
    flex: 1;
    text-align: center;

    dt {
      color: var(--color-text-light);
      font-size: var(--font-size-md);
    }

    dd {
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: 600;
    }
  `,
  emptyData: css`
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    color: var(--color-text);
    font-weight: 600;
    margin: 0 auto;
    max-width: 640px;
    padding: var(--space-12);
    text-align: center;
  `
};

function App() {
  // Empty array for results
  const [results, setResults] = useState<LocationResult[]>([]);
  // Default state for stats
  const [stats, setStats] = useState({ fastest: 0, slowest: 0, average: 0 });

  // Sorting config
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    columnIndex: 0,
    direction: "desc"
  });

  // DataTable columns
  const columns = useMemo<Column<LocationResult>[]>(() => [
    {
      header: "Timestamp", // Columns header text
      accessor: (r) => new Date(r.timestamp).toLocaleString(), // Defines what gets displayed in the cell
      sortValue: (r) => r.timestamp, // Defines the actual value used for sorting
      sortable: true // Allows column to be sorted
    },
    {
      header: "Street",
      accessor: (r) => (r.status === "success" ? r.address?.street || "" : "-"),
      sortable: false
    },
    {
      header: "City",
      accessor: (r) => (r.status === "success" ? r.address?.city || "" : "-"),
      sortable: true
    },
    {
      header: "Execution Time (ms)",
      accessor: (r) => {
        // Displays different status
        if (r.status === "loading") return "Loading...";
        if (r.status === "error") return r.error || "Error";
        return `${r.executionTime} ms`;
      },
      // Sort numerically since we can't correctly sort a string
      // Number.MAX_SAFE_INTEGER keeps row at top while loading
      sortValue: (r) => (r.executionTime ? r.executionTime : Number.MAX_SAFE_INTEGER),
      sortable: true
    }
  ], []);

  // Sorted results with hook
  const sortedResults = useSortedData(results, sortConfig, columns);

  const calculateStats = (results: LocationResult[]) => {
    const successfulResults = results.filter((r) => r.status === "success");
    if (successfulResults.length === 0) return { fastest: 0, slowest: 0, average: 0 };

    const times = successfulResults.map((r) => r.executionTime!);
    return {
      fastest: Math.min(...times),
      slowest: Math.max(...times),
      average: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    };
  };

  const handleFetch = useCallback(async () => {
    const timestamp = Date.now();

    // Add row with loading status
    setResults((prev) => [...prev, { timestamp, status: "loading" }]);

    try {
      // Start tracking performance
      const start = performance.now();
      // Wait for response
      const res = await fetchLastLocation();
      // Stop tracking performance
      const end = performance.now();
      // Calculate how long it took
      const executionTime = Math.round(end - start);

      // Update row and stats
      setResults((prev) => {
        const updated = prev.map((r) =>
          r.timestamp === timestamp
            ? ({
                timestamp,
                address: res.address,
                executionTime,
                status: "success"
              } as LocationResult)
            : r
        );

        // Recalculate stats from updated state (always latest)
        setStats(calculateStats(updated));

        return updated;
      });
    } catch {
      // On error, mark row as failed
      setResults((prev) =>
        prev.map((r) =>
          r.timestamp === timestamp
            ? ({ ...r, status: "error", error: "Failed to fetch location" } as LocationResult)
            : r
        )
      );
    }
  }, []);

  const handleSort = useCallback((index: number) => {
    setSortConfig((prev: SortConfig) => ({
      columnIndex: index, // index is column selected
      direction: prev.columnIndex === index && prev.direction === "asc" ? "desc" : "asc" // toggle sort direction
    }));
  }, []);

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <h1 className={styles.title}>Location Execution Time</h1>
        {sortedResults.length > 0 && (
          <button className={styles.button} onClick={handleFetch}>
            Get Last Location
          </button>
        )}
      </div>

      <div
        className={`${styles.container} ${
          sortedResults.length === 0 ? styles.centerContainer : ""
        }`}
      >
        <DataTable
          data={sortedResults}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleSort}
          emptyState={
            <div className={styles.emptyData}>
              <p>No data yet. Click below to get started!</p>
              <button className={styles.button} onClick={handleFetch}>
                Get Last Location
              </button>
            </div>
          }
        />
      </div>

      <div className={styles.footer}>
        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt>Fastest</dt>
            <dd>{stats.fastest} ms</dd>
          </div>
          <div className={styles.stat}>
            <dt>Slowest</dt>
            <dd>{stats.slowest} ms</dd>
          </div>
          <div className={styles.stat}>
            <dt>Average</dt>
            <dd>{stats.average} ms</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default App;
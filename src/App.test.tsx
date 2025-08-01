import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";
import React from "react";

jest.mock("./backend/fetchLastLocations", () => ({
  fetchLastLocation: jest.fn()
}));
import { fetchLastLocation } from "./backend/fetchLastLocations";

test("renders empty state initially", () => {
  render(<App />);

  expect(screen.getByText(/No data yet. Click below to get started!/i)).toBeInTheDocument();
  expect(screen.getByText(/Get Last Location/i)).toBeInTheDocument();
});

test("adds a row and updates status to success", async () => {
  // Mock successful response
  (fetchLastLocation as jest.Mock).mockResolvedValue({
    address: { street: "3509 E 12th Ave", city: "Denver" }
  });

  render(<App />);

  // Click button to trigger fetch
  const button = screen.getByText(/Get Last Location/i);
  fireEvent.click(button);

  // Wait for "Loading..." to appear
  expect(await screen.findByText(/Loading.../i)).toBeInTheDocument();

  // Wait for success state (address appears)
  await waitFor(() => {
    expect(screen.getByText(/3509 E 12th Ave/i)).toBeInTheDocument();
    expect(screen.getByText(/Denver/i)).toBeInTheDocument();
  });

  // Stats should update
  expect(screen.getByText(/Fastest/i)).toBeInTheDocument();
  const times = await screen.findAllByText(/\d+\s?ms/i);
  expect(times).toHaveLength(4); // Checks 3 stats and 1 row
});

test("displays error when API call fails", async () => {
  // Mock error response
  (fetchLastLocation as jest.Mock).mockRejectedValue(new Error("Failed to fetch location"));

  render(<App />);

  const button = screen.getByText(/Get Last Location/i);
  fireEvent.click(button);

  // Check loading state
  expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

  // Wait for error state
  await waitFor(() => {
    expect(screen.getByText(/Failed to fetch location/i)).toBeInTheDocument();
  });
});

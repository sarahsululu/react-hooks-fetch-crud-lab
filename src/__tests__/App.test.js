import React from "react";
import "whatwg-fetch";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { server } from "../mocks/server";

import App from "../components/App";

// Setup API mocking
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ✅ Test 1: Check if questions display after fetch
test("displays question prompts after fetching", async () => {
  render(<App />);
  expect(await screen.findByText(/lorem testum 1/g)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 2/g)).toBeInTheDocument();
});

// ✅ Test 2: Create a new question using the form
test("creates a new question when the form is submitted", async () => {
  render(<App />);

  // Wait for initial list to load
  await screen.findByText(/lorem testum 1/g);

  // Navigate to form
  fireEvent.click(screen.queryByText("New Question"));

  // Fill in the form fields
  fireEvent.change(screen.queryByLabelText(/Prompt/), {
    target: { value: "Test Prompt" },
  });
  fireEvent.change(screen.queryByLabelText(/Answer 1/), {
    target: { value: "Test Answer 1" },
  });
  fireEvent.change(screen.queryByLabelText(/Answer 2/), {
    target: { value: "Test Answer 2" },
  });
  fireEvent.change(screen.getAllByLabelText(/Correct Answer/)[0], {
    target: { value: "1" },
  });

  // Submit the form
  fireEvent.submit(screen.queryByText(/Add Question/));

  // Expect new question to appear
  expect(await screen.findByText(/Test Prompt/g)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 1/g)).toBeInTheDocument();
});

// ✅ Test 3: Delete a question
test("deletes the question when the delete button is clicked", async () => {
  const { rerender } = render(<App />);

  // Wait for data to load
  await screen.findByText(/lorem testum 1/g);

  // Click delete button
  fireEvent.click(screen.queryAllByText("Delete Question")[0]);

  // Wait for question to be removed
  await waitForElementToBeRemoved(() => screen.queryByText(/lorem testum 1/g));

  // Re-render and confirm question is gone
  rerender(<App />);
  await screen.findByText(/lorem testum 2/g);
  expect(screen.queryByText(/lorem testum 1/g)).not.toBeInTheDocument();
});

// ✅ Test 4: Update correct answer via dropdown
test("updates the answer when the dropdown is changed", async () => {
  const { rerender } = render(<App />);

  await screen.findByText(/lorem testum 2/g);

  fireEvent.change(screen.queryAllByLabelText(/Correct Answer/)[0], {
    target: { value: "3" },
  });

  expect(screen.queryAllByLabelText(/Correct Answer/)[0].value).toBe("3");

  rerender(<App />);
  expect(screen.queryAllByLabelText(/Correct Answer/)[0].value).toBe("3");
});

import { afterEach, vi } from "vitest";

// Radix FocusScope dispatches a CustomEvent from a 0 ms timer when a dialog unmounts.
// If that timer fires after jsdom is torn down it surfaces as an unhandled
// "parameter 1 is not of type 'Event'" error. Flush pending macrotasks inside the
// live realm after every test so the timer runs in time.
afterEach(async () => {
  if (vi.isFakeTimers()) {
    vi.runOnlyPendingTimers();
    return;
  }
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
});

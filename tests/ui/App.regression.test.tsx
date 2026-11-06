/**
 * UI regression tests for the ORIGINAL src/App.tsx (before any refactoring).
 *
 * They drive the page the way a user does (fill in the time fields, pick a room,
 * click "Check availability") and assert on what is rendered. They deliberately
 * avoid exact full-sentence matches on messages so that the planned step-2
 * validation merge can reword messages without breaking them; they check the
 * Available/Unavailable headline plus key words in the reason/detail.
 *
 * Fixture data used (from INITIAL_BOOKINGS in App.tsx):
 *   lib-201 (default room): 09:00–10:00 Calc Study Group, 12:00–13:00 Project Standup,
 *                           17:00–18:00 Exam Review
 *   bus-305: 10:30–11:30 Case Discussion, 14:00–16:00 Guest Lecture, 19:00–21:00 Networking Night
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '@/App';

// --- helpers ---------------------------------------------------------------

// Step 4: TimeField labels are now linked to their inputs (htmlFor/id), so the
// inputs are found the accessible way. (Before, the tests had to go through the
// label's wrapper element because getByLabelText could not find them.)
function timeInput(label: 'Now' | 'Start' | 'End'): HTMLInputElement {
  return screen.getByLabelText<HTMLInputElement>(label);
}

function setTimes(times: { now?: string; start?: string; end?: string }) {
  if (times.now !== undefined) fireEvent.change(timeInput('Now'), { target: { value: times.now } });
  if (times.start !== undefined) fireEvent.change(timeInput('Start'), { target: { value: times.start } });
  if (times.end !== undefined) fireEvent.change(timeInput('End'), { target: { value: times.end } });
}

// Step 3b: the room <select> became a list of radio buttons (one per matching room).
function selectRoom(roomId: string) {
  const radio = screen
    .getAllByRole<HTMLInputElement>('radio')
    .find((r) => r.value === roomId);
  if (!radio) throw new Error(`Room "${roomId}" is not in the list`);
  fireEvent.click(radio);
}

function clickCheck() {
  fireEvent.click(screen.getByRole('button', { name: /check availability/i }));
}

function result(): HTMLElement {
  return screen.getByRole('status');
}

function check(times: { now?: string; start?: string; end?: string }) {
  setTimes(times);
  clickCheck();
  return result();
}

function bookingsSection(): HTMLElement {
  const heading = screen.getByRole('heading', { name: /existing bookings today/i });
  const section = heading.closest('section');
  if (!section) throw new Error('Bookings section not found');
  return section;
}

function bookingItems(): string[] {
  return within(bookingsSection())
    .getAllByRole('listitem')
    .map((li) => li.textContent ?? '');
}

function warnings(): HTMLElement | null {
  return screen.queryByText(/please fix these before checking/i)?.parentElement ?? null;
}

// --- AC1: time format, ordering, start strictly after now ------------------

describe('AC1 – valid time window and start strictly after now', () => {
  it('reports the default request (08:30 / 10:30–11:30, lib-201) as Available', () => {
    render(<App />);
    clickCheck();
    expect(result()).toHaveTextContent('Available');
    expect(result()).not.toHaveTextContent('Unavailable');
  });

  it('rejects an empty/invalid time field', () => {
    render(<App />);
    const r = check({ start: '' });
    expect(r).toHaveTextContent('Unavailable');
    expect(r).toHaveTextContent(/invalid time/i);
  });

  it('rejects start after end', () => {
    render(<App />);
    const r = check({ now: '08:00', start: '11:30', end: '10:30' });
    expect(r).toHaveTextContent('Unavailable');
    expect(r).toHaveTextContent(/invalid time window/i);
  });

  it('rejects start equal to end (zero-length booking)', () => {
    render(<App />);
    const r = check({ now: '08:00', start: '10:30', end: '10:30' });
    expect(r).toHaveTextContent('Unavailable');
    expect(r).toHaveTextContent(/invalid time window/i);
  });

  it('rejects start equal to now (must be strictly after)', () => {
    render(<App />);
    const r = check({ now: '10:30', start: '10:30', end: '11:30' });
    expect(r).toHaveTextContent('Unavailable');
    expect(r).toHaveTextContent(/not in the future/i);
  });

  it('rejects start before now', () => {
    render(<App />);
    const r = check({ now: '11:00', start: '10:30', end: '11:30' });
    expect(r).toHaveTextContent('Unavailable');
    expect(r).toHaveTextContent(/not in the future/i);
  });

  it('accepts start exactly one minute after now', () => {
    render(<App />);
    const r = check({ now: '10:29', start: '10:30', end: '11:30' });
    expect(r).toHaveTextContent('Available');
    expect(r).not.toHaveTextContent('Unavailable');
  });
});

// --- AC2: maximum duration 120 minutes -------------------------------------

describe('AC2 – maximum duration is 120 minutes', () => {
  it('accepts exactly 120 minutes (13:00–15:00 in a free gap)', () => {
    render(<App />);
    const r = check({ now: '08:00', start: '13:00', end: '15:00' });
    expect(r).toHaveTextContent('Available');
    expect(r).toHaveTextContent('120 min');
  });

  it('rejects 121 minutes (13:00–15:01)', () => {
    render(<App />);
    const r = check({ now: '08:00', start: '13:00', end: '15:01' });
    expect(r).toHaveTextContent('Unavailable');
    expect(r).toHaveTextContent(/too long/i);
    expect(r).toHaveTextContent('121');
  });
});

// --- AC3: blocked room rejects every request -------------------------------

// Step 3b (planned change): the global "Room is blocked" toggle was removed.
// Blocked now comes from the room data: med-014 (Media Studio 014) is blocked.
describe('AC3 – blocked room rejects every request', () => {
  it('rejects an otherwise free, valid slot when the room is blocked (med-014)', () => {
    render(<App />);
    selectRoom('med-014');
    const r = check({ now: '08:00', start: '13:00', end: '14:00' });
    expect(r).toHaveTextContent('Unavailable');
    expect(r).toHaveTextContent(/blocked/i);
  });

  it('accepts the same slot in a non-blocked room (lib-201)', () => {
    render(<App />);
    selectRoom('med-014');
    expect(check({ now: '08:00', start: '13:00', end: '14:00' })).toHaveTextContent('Unavailable');
    selectRoom('lib-201');
    const r = check({});
    expect(r).toHaveTextContent('Available');
    expect(r).not.toHaveTextContent('Unavailable');
  });
});

// --- AC4: no overlap; touching endpoints are not an overlap -----------------

describe('AC4 – overlap with existing bookings', () => {
  it('rejects a partial overlap and names the conflicting booking', () => {
    render(<App />);
    const r = check({ now: '08:00', start: '09:30', end: '10:30' });
    expect(r).toHaveTextContent('Unavailable');
    expect(r).toHaveTextContent(/overlap/i);
    expect(r).toHaveTextContent('Calc Study Group');
  });

  it('rejects a request that fully contains an existing booking', () => {
    render(<App />);
    const r = check({ now: '08:00', start: '11:30', end: '13:30' });
    expect(r).toHaveTextContent('Unavailable');
    expect(r).toHaveTextContent('Project Standup');
  });

  it('rejects a request fully inside an existing booking', () => {
    render(<App />);
    const r = check({ now: '08:00', start: '12:15', end: '12:45' });
    expect(r).toHaveTextContent('Unavailable');
    expect(r).toHaveTextContent('Project Standup');
  });

  it('accepts a request that starts exactly when a booking ends (10:00 after 09:00–10:00)', () => {
    render(<App />);
    const r = check({ now: '08:00', start: '10:00', end: '11:00' });
    expect(r).toHaveTextContent('Available');
    expect(r).not.toHaveTextContent('Unavailable');
  });

  it('accepts a request that ends exactly when a booking starts (until 12:00 before 12:00–13:00)', () => {
    render(<App />);
    const r = check({ now: '08:00', start: '11:00', end: '12:00' });
    expect(r).toHaveTextContent('Available');
    expect(r).not.toHaveTextContent('Unavailable');
  });

  it('accepts a request touching bookings on both sides (10:00–12:00, exactly 120 min)', () => {
    render(<App />);
    const r = check({ now: '08:00', start: '10:00', end: '12:00' });
    expect(r).toHaveTextContent('Available');
    expect(r).not.toHaveTextContent('Unavailable');
  });
});

// --- AC5: clear result, bookings never modified ----------------------------

describe('AC5 – clear result and existing bookings are never modified', () => {
  it('shows no result before the first check', () => {
    render(<App />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not add, remove or change bookings after an Available check', () => {
    render(<App />);
    const before = bookingItems();
    expect(before).toHaveLength(3);
    check({ now: '08:00', start: '13:00', end: '14:00' });
    expect(result()).toHaveTextContent('Available');
    expect(bookingItems()).toEqual(before);
  });

  it('does not change bookings after an Unavailable (overlap) check', () => {
    render(<App />);
    const before = bookingItems();
    check({ now: '08:00', start: '09:30', end: '10:30' });
    expect(result()).toHaveTextContent('Unavailable');
    expect(bookingItems()).toEqual(before);
  });
});

// --- AC6: understandable validation messages -------------------------------

describe('AC6 – validation messages', () => {
  it('shows no warning box for the valid default inputs', () => {
    render(<App />);
    expect(warnings()).toBeNull();
  });

  it('warns when start is not after now', () => {
    render(<App />);
    setTimes({ now: '10:30', start: '10:30', end: '11:30' });
    expect(warnings()).toHaveTextContent(/strictly after 'now'/i);
  });

  it('warns when start is not before end', () => {
    render(<App />);
    setTimes({ now: '08:00', start: '11:30', end: '10:30' });
    expect(warnings()).toHaveTextContent(/strictly before end/i);
  });

  it('warns when duration exceeds 120 minutes', () => {
    render(<App />);
    setTimes({ now: '08:00', start: '13:00', end: '15:01' });
    expect(warnings()).toHaveTextContent(/120 minutes/i);
  });

  it('warns when a field is empty', () => {
    render(<App />);
    setTimes({ end: '' });
    expect(warnings()).toHaveTextContent(/'End' must be a valid time/i);
  });

  it('keeps the Check button enabled even when there are warnings', () => {
    render(<App />);
    setTimes({ now: '10:30', start: '10:30', end: '11:30' });
    expect(screen.getByRole('button', { name: /check availability/i })).toBeEnabled();
  });
});

// --- Room switching (basis for F5) -----------------------------------------

describe('Room switching uses the selected room’s bookings', () => {
  it('same slot is Available in lib-201 but Unavailable in bus-305 (Case Discussion)', () => {
    render(<App />);
    let r = check({ now: '08:00', start: '10:30', end: '11:30' });
    expect(r).toHaveTextContent('Available');
    expect(r).not.toHaveTextContent('Unavailable');

    selectRoom('bus-305');
    r = check({});
    expect(r).toHaveTextContent('Unavailable');
    expect(r).toHaveTextContent('Case Discussion');
  });

  it('shows the selected room’s bookings in the list', () => {
    render(<App />);
    expect(bookingItems().join(' ')).toContain('Calc Study Group');
    selectRoom('bus-305');
    const items = bookingItems().join(' ');
    expect(items).toContain('Case Discussion');
    expect(items).not.toContain('Calc Study Group');
  });

  it('clears the previous result when the room changes', () => {
    render(<App />);
    clickCheck();
    expect(result()).toBeInTheDocument();
    selectRoom('eng-110');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

// --- Fixed in step 2c (was the KNOWN BUG characterization test) ------------

describe('FIXED (step 2c) – no stale result after editing times', () => {
  it('clears the old "Available" result as soon as the times are changed to an overlapping slot', () => {
    render(<App />);
    const r = check({ now: '08:00', start: '10:30', end: '11:30' });
    expect(r).toHaveTextContent('Available');

    // Change to 11:30–12:30, which overlaps Project Standup (12:00–13:00), without re-checking.
    setTimes({ start: '11:30', end: '12:30' });

    // The stale result must be gone; re-checking gives the correct answer.
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    const again = check({});
    expect(again).toHaveTextContent('Unavailable');
    expect(again).toHaveTextContent('Project Standup');
  });

  it.each(['Now', 'Start', 'End'] as const)('clears the result when only "%s" is edited', (field) => {
    render(<App />);
    clickCheck();
    expect(result()).toBeInTheDocument();
    const values = { Now: '08:00', Start: '10:45', End: '11:15' };
    fireEvent.change(timeInput(field), { target: { value: values[field] } });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

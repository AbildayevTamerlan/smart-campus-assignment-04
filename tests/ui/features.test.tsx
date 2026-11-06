/**
 * UI tests for the new features (F1–F5) and end-to-end flows through the page.
 * Catalog (src/data/rooms.ts), in display order:
 *   lib-201  Library Study Room 201     cap 6   Whiteboard
 *   eng-110  Engineering Lab 110        cap 24  Projector, Whiteboard, Computers
 *   bus-305  Business Seminar Room 305  cap 40  Projector, Video conferencing
 *   med-014  Media Studio 014           cap 10  Projector, Whiteboard, Video conferencing  BLOCKED
 *   hum-102  Humanities Quiet Room 102  cap 2   (none)
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '@/App';

// --- helpers ---------------------------------------------------------------

const radios = () => screen.queryAllByRole<HTMLInputElement>('radio');
const listedRoomIds = () => radios().map((r) => r.value);
const selectedRoomId = () => radios().find((r) => r.checked)?.value ?? null;

function roomRadio(roomId: string): HTMLInputElement {
  const radio = radios().find((r) => r.value === roomId);
  if (!radio) throw new Error(`Room "${roomId}" is not listed`);
  return radio;
}

// The card (label) that wraps a room's radio button.
const roomCard = (roomId: string) => roomRadio(roomId).closest('label') as HTMLElement;

const selectRoom = (roomId: string) => fireEvent.click(roomRadio(roomId));
const setAttendees = (value: string) =>
  fireEvent.change(screen.getByLabelText('Attendees'), { target: { value } });
const toggleEquipment = (name: string) =>
  fireEvent.click(screen.getByRole('checkbox', { name }));
const setTime = (label: 'Now' | 'Start' | 'End', value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

function setTimes(now: string, start: string, end: string) {
  setTime('Now', now);
  setTime('Start', start);
  setTime('End', end);
}

const clickCheck = () => fireEvent.click(screen.getByRole('button', { name: /check availability/i }));
const result = () => screen.getByRole('status');
const queryResult = () => screen.queryByRole('status');

const bookingsSection = () =>
  screen.getByRole('heading', { name: /existing bookings today/i }).closest('section') as HTMLElement;

// --- F1 / F2 through the UI --------------------------------------------------

describe('F1 – capacity filter in the UI', () => {
  it('lists every room by default (1 attendee, no equipment)', () => {
    render(<App />);
    expect(listedRoomIds()).toEqual(['lib-201', 'eng-110', 'bus-305', 'med-014', 'hum-102']);
  });

  it('10 attendees keeps rooms with capacity >= 10 (Media Studio has exactly 10)', () => {
    render(<App />);
    setAttendees('10');
    expect(listedRoomIds()).toEqual(['eng-110', 'bus-305', 'med-014']);
  });

  it('11 attendees drops the capacity-10 room', () => {
    render(<App />);
    setAttendees('11');
    expect(listedRoomIds()).toEqual(['eng-110', 'bus-305']);
  });
});

describe('F2 – equipment filter in the UI', () => {
  it('Projector + Video conferencing lists only rooms with both', () => {
    render(<App />);
    toggleEquipment('Projector');
    toggleEquipment('Video conferencing');
    expect(listedRoomIds()).toEqual(['bus-305', 'med-014']);
  });

  it('unchecking an item widens the list again', () => {
    render(<App />);
    toggleEquipment('Computers');
    expect(listedRoomIds()).toEqual(['eng-110']);
    toggleEquipment('Computers');
    expect(listedRoomIds()).toHaveLength(5);
  });
});

// --- F3 blocked room ---------------------------------------------------------

describe('F3 – blocked room is visible but never Available', () => {
  it('shows a "Blocked" badge on the blocked room only', () => {
    render(<App />);
    expect(within(roomCard('med-014')).getByText('Blocked')).toBeInTheDocument();
    expect(screen.getAllByText('Blocked')).toHaveLength(1);
    for (const id of ['lib-201', 'eng-110', 'bus-305', 'hum-102']) {
      expect(within(roomCard(id)).queryByText('Blocked')).not.toBeInTheDocument();
    }
  });

  it('checks as Unavailable for a valid slot that has no conflicting booking', () => {
    render(<App />);
    selectRoom('med-014');
    setTimes('08:00', '13:00', '14:00'); // Media Studio's only booking is 10:00–11:00
    clickCheck();
    expect(result()).toHaveTextContent('Unavailable');
    expect(result()).toHaveTextContent(/room is blocked/i);
  });

  it('stays Unavailable for several different slots', () => {
    render(<App />);
    selectRoom('med-014');
    for (const [start, end] of [['11:00', '12:00'], ['15:00', '17:00'], ['20:00', '20:30']]) {
      setTimes('08:00', start, end);
      clickCheck();
      expect(result()).toHaveTextContent('Unavailable');
    }
  });
});

// --- F4 empty state ------------------------------------------------------------

describe('F4 – empty state when no rooms match', () => {
  it('shows the empty state for impossible equipment and Clear filters brings rooms back', () => {
    render(<App />);
    toggleEquipment('Computers');
    toggleEquipment('Video conferencing');
    expect(listedRoomIds()).toEqual([]);
    expect(screen.getByText('No rooms match your filters')).toBeInTheDocument();
    expect(screen.getByText(/try fewer attendees or fewer required equipment/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(listedRoomIds()).toHaveLength(5);
    expect(screen.queryByText('No rooms match your filters')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Computers' })).not.toBeChecked();
    expect(screen.getByLabelText('Attendees')).toHaveValue(1);
  });

  it('shows the empty state when attendees exceed every capacity', () => {
    render(<App />);
    setAttendees('41');
    expect(screen.getByText('No rooms match your filters')).toBeInTheDocument();
  });

  it('explains an invalid attendee count', () => {
    render(<App />);
    setAttendees('0');
    expect(listedRoomIds()).toEqual([]);
    expect(screen.getByText(/enter a whole number, 1 or more/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid number of attendees/i)).toBeInTheDocument();
  });
});

// --- F5 room switching ---------------------------------------------------------

describe('F5 – result follows the selected room', () => {
  it('the same slot gives different results in different rooms, using each room’s bookings', () => {
    render(<App />);
    setTimes('08:00', '10:30', '11:30');

    selectRoom('lib-201');
    clickCheck();
    expect(result()).toHaveTextContent('Available');
    expect(result()).not.toHaveTextContent('Unavailable');

    selectRoom('bus-305');
    expect(queryResult()).not.toBeInTheDocument(); // refreshed, not stale
    clickCheck();
    expect(result()).toHaveTextContent('Unavailable');
    expect(result()).toHaveTextContent('Case Discussion'); // bus-305's own booking

    selectRoom('eng-110'); // its 08:00–10:00 booking does not touch 10:30–11:30
    clickCheck();
    expect(result()).toHaveTextContent('Available');
    expect(result()).not.toHaveTextContent('Unavailable');
  });

  it('the bookings panel shows the selected room’s bookings', () => {
    render(<App />);
    selectRoom('eng-110');
    const panel = within(bookingsSection());
    expect(panel.getByText('Engineering Lab 110')).toBeInTheDocument();
    const items = panel.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toHaveLength(2);
    expect(items.join(' ')).toContain('Robotics Workshop');
    expect(items.join(' ')).toContain('Office Hours');
    expect(panel.queryByText('Calc Study Group')).not.toBeInTheDocument();
  });

  it('when the selected room is filtered out, the selection and the result are cleared', () => {
    render(<App />);
    selectRoom('lib-201');
    clickCheck();
    expect(result()).toBeInTheDocument();

    setAttendees('10'); // lib-201 has capacity 6
    expect(listedRoomIds()).not.toContain('lib-201');
    expect(selectedRoomId()).toBeNull();
    expect(queryResult()).not.toBeInTheDocument();
    expect(within(bookingsSection()).getByText(/select a room to see its bookings/i)).toBeInTheDocument();

    // Loosening the filter again lists the room but does not silently re-select it.
    setAttendees('1');
    expect(listedRoomIds()).toContain('lib-201');
    expect(selectedRoomId()).toBeNull();
  });

  it('checking with no room selected says so instead of giving an answer', () => {
    render(<App />);
    setAttendees('10');
    clickCheck();
    expect(result()).toHaveTextContent('Unavailable');
    expect(result()).toHaveTextContent(/no room selected/i);
  });

  it('keeps the selection and result when a filter change still matches the selected room', () => {
    render(<App />);
    selectRoom('bus-305');
    clickCheck();
    toggleEquipment('Projector'); // bus-305 has a projector
    expect(selectedRoomId()).toBe('bus-305');
    expect(queryResult()).toBeInTheDocument();
  });
});

// --- End-to-end flows -----------------------------------------------------------

describe('End-to-end: filters -> pick a room -> check -> result', () => {
  it('20 people needing a projector: Engineering Lab 10:00–12:00 is Available, Seminar Room is not', () => {
    render(<App />);

    // 1. Filters
    setAttendees('20');
    toggleEquipment('Projector');
    expect(listedRoomIds()).toEqual(['eng-110', 'bus-305']);

    // 2. Pick a room
    selectRoom('eng-110');
    expect(selectedRoomId()).toBe('eng-110');

    // 3. Times: 10:00–12:00 touches Robotics Workshop (08:00–10:00), exactly 120 min
    setTimes('09:00', '10:00', '12:00');
    expect(screen.queryByText(/please fix these before checking/i)).not.toBeInTheDocument();

    // 4. Check -> Available
    clickCheck();
    expect(result()).toHaveTextContent('Available');
    expect(result()).toHaveTextContent('10:00–12:00 (120 min)');

    // 5. Switch to the other matching room -> result cleared, re-check -> Unavailable
    selectRoom('bus-305');
    expect(queryResult()).not.toBeInTheDocument();
    clickCheck();
    expect(result()).toHaveTextContent('Unavailable');
    expect(result()).toHaveTextContent('Case Discussion');
  });

  it('8 people needing video conferencing: picking the blocked studio gives Unavailable', () => {
    render(<App />);
    setAttendees('8');
    toggleEquipment('Video conferencing');
    expect(listedRoomIds()).toEqual(['bus-305', 'med-014']);
    expect(within(roomCard('med-014')).getByText('Blocked')).toBeInTheDocument();

    selectRoom('med-014');
    setTimes('08:00', '13:00', '14:00');
    clickCheck();
    expect(result()).toHaveTextContent('Unavailable');
    expect(result()).toHaveTextContent(/blocked/i);
  });

  it('Reset restores the default filters, room, times and clears the result', () => {
    render(<App />);
    setAttendees('20');
    toggleEquipment('Projector');
    selectRoom('bus-305');
    clickCheck();
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(listedRoomIds()).toHaveLength(5);
    expect(selectedRoomId()).toBe('lib-201');
    expect(screen.getByLabelText('Start')).toHaveValue('10:30');
    expect(queryResult()).not.toBeInTheDocument();
  });
});

// --- Housekeeping checks ---------------------------------------------------------

describe('Housekeeping', () => {
  it('the timeline ends with "24:00", not a second "00:00"', () => {
    render(<App />);
    const panel = within(bookingsSection());
    expect(panel.getAllByText('00:00')).toHaveLength(1);
    expect(panel.getByText('24:00')).toBeInTheDocument();
  });

  it('time inputs and the attendees input are reachable by their labels', () => {
    render(<App />);
    for (const label of ['Now', 'Start', 'End', 'Attendees']) {
      expect(screen.getByLabelText(label)).toBeInstanceOf(HTMLInputElement);
    }
  });
});

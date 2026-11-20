/**
 * Pins how the page DISPLAYS the AC1/AC2 rules outside the Check result:
 * the rules panel text, the time readout chips and the timeline overlay.
 * Written before the "shared rule helpers" refactor so it must pass unchanged
 * before and after it.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '@/App';

const setTime = (label: 'Now' | 'Start' | 'End', value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

function setTimes(now: string, start: string, end: string) {
  setTime('Now', now);
  setTime('Start', start);
  setTime('End', end);
}

const durationChip = () => screen.getByText(/^duration=/);
const proposedSlot = () => screen.queryByTitle('Your proposed booking');

describe('Rule texts show the AC1 / AC2 limits', () => {
  it('rules panel states the AC1 window and the AC2 maximum', () => {
    render(<App />);
    expect(
      screen.getByText('• Times are integer minutes after midnight (0 ≤ start < end ≤ 1440).'),
    ).toBeInTheDocument();
    expect(screen.getByText('• Duration ≤ 120 minutes (exactly 120 is allowed).')).toBeInTheDocument();
  });

  it('time readout states the AC1 range', () => {
    render(<App />);
    expect(screen.getByText('Times are minutes after midnight (0–1440).')).toBeInTheDocument();
  });
});

describe('Duration chip colour follows AC1 / AC2', () => {
  it('exactly 120 minutes is green (AC2 boundary allowed)', () => {
    render(<App />);
    setTimes('08:30', '13:00', '15:00');
    expect(durationChip()).toHaveTextContent('duration=120 min');
    expect(durationChip()).toHaveClass('bg-emerald-50');
  });

  it('121 minutes is red (AC2 exceeded)', () => {
    render(<App />);
    setTimes('08:30', '13:00', '15:01');
    expect(durationChip()).toHaveTextContent('duration=121 min');
    expect(durationChip()).toHaveClass('bg-red-50');
  });

  it('zero and negative durations are amber (AC1 start < end violated)', () => {
    render(<App />);
    setTimes('08:30', '13:00', '13:00');
    expect(durationChip()).toHaveTextContent('duration=0 min');
    expect(durationChip()).toHaveClass('bg-amber-50');

    setTimes('08:30', '15:00', '13:00');
    expect(durationChip()).toHaveTextContent('duration=-120 min');
    expect(durationChip()).toHaveClass('bg-amber-50');
  });
});

describe('Timeline overlay is drawn only for an AC1-valid window', () => {
  it('draws the proposed slot when start < end', () => {
    render(<App />);
    setTimes('08:30', '13:00', '14:00');
    expect(proposedSlot()).toBeInTheDocument();
  });

  it('draws the proposed slot even when it is too long (AC2 does not hide it)', () => {
    render(<App />);
    setTimes('08:30', '13:00', '16:00');
    expect(proposedSlot()).toBeInTheDocument();
  });

  it('hides the proposed slot when start == end or start > end', () => {
    render(<App />);
    setTimes('08:30', '13:00', '13:00');
    expect(proposedSlot()).not.toBeInTheDocument();
    setTimes('08:30', '15:00', '13:00');
    expect(proposedSlot()).not.toBeInTheDocument();
  });

  it('hides the proposed slot when a time field is empty', () => {
    render(<App />);
    setTimes('08:30', '13:00', '');
    expect(proposedSlot()).not.toBeInTheDocument();
  });
});

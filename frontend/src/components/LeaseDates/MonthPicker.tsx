import React, { useEffect, useRef, useState } from 'react';
import { Popover, makeStyles } from '@material-ui/core';
import { colors } from '../../colors';
import YearArrowSrc from '../../assets/year-arrow-icon.svg';
import { formatYearMonth, parseYearMonth } from '../../utils/leaseDates';

export const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const useStyles = makeStyles({
  paper: {
    boxSizing: 'border-box',
    width: '264px',
    marginTop: '8px',
    padding: '16px',
    borderRadius: '20px',
    backgroundColor: colors.white,
    boxShadow: '1px 2px 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 7px',
    marginBottom: '12px',
  },
  year: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '28px',
    color: colors.black,
  },
  arrow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    border: 'none',
    borderRadius: '100px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    '&:disabled': {
      opacity: 0.3,
      cursor: 'default',
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.black}`,
    },
    '& img': {
      maxWidth: 'none',
    },
  },
  arrowPrevious: {
    '& img': { transform: 'rotate(90deg)' },
  },
  arrowNext: {
    '& img': { transform: 'rotate(-90deg)' },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 52px)',
    gap: '8px',
  },
  cell: {
    boxSizing: 'border-box',
    width: '52px',
    height: '52px',
    padding: '8px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: colors.black,
    fontFamily: 'inherit',
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: '28px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: colors.gray5,
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.black}`,
      outlineOffset: '-2px',
    },
  },
  cellSelected: {
    backgroundColor: colors.red1,
    color: colors.white,
    fontWeight: 600,
    '&:hover': {
      backgroundColor: colors.selectedHoverRed,
    },
    '&:focus-visible': {
      outlineColor: colors.black,
    },
  },
  cellDisabled: {
    color: colors.gray2,
    cursor: 'default',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  clear: {
    display: 'block',
    margin: '12px auto 0',
    padding: '4px 8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.red1,
    fontFamily: 'inherit',
    fontSize: '14px',
    lineHeight: '20px',
    textDecoration: 'underline',
    cursor: 'pointer',
    '&:focus-visible': {
      outline: `2px solid ${colors.black}`,
    },
  },
});

interface Props {
  open: boolean;
  /** The button the picker opens below. */
  anchorEl: HTMLElement | null;
  /** Called when the user clicks outside the picker or presses Escape. Nothing has changed. */
  onClose: () => void;
  /** The selected month as "YYYY-MM", or null/undefined when nothing is selected. */
  value?: string | null;
  /** Called with the picked month as "YYYY-MM". The parent decides whether to close the picker. */
  onChange: (value: string) => void;
  /** When given, a "Clear" link shows under the grid while a month is selected. */
  onClear?: () => void;
  /** Whether a month is not allowed. Disabled months look gray and cannot be picked. */
  isMonthDisabled?: (year: number, month: number) => boolean;
  /** The first and last year the arrows can reach. */
  minYear: number;
  maxYear: number;
  /** Accessible name for the picker, e.g. "Choose the month you signed your lease". */
  label: string;
}

/**
 * MonthPicker – a calendar popover for choosing a month and year, anchored below a button.
 *
 * It opens on the selected month's year, or the current year when nothing is selected. Picking a month
 * calls onChange; clicking outside or pressing Escape calls onClose. A year arrow is disabled when every
 * month in that direction is disabled.
 *
 * @param props.open – Whether the picker is shown.
 * @param props.anchorEl – The button the picker opens below.
 * @param props.onClose – Called on outside click or Escape.
 * @param props.value – The selected month as "YYYY-MM", if any.
 * @param props.onChange – Called with the picked month as "YYYY-MM".
 * @param props.onClear – If given, shows a "Clear" link while a month is selected.
 * @param props.isMonthDisabled – Returns true for months that cannot be picked.
 * @param props.minYear – The earliest year the arrows can reach.
 * @param props.maxYear – The latest year the arrows can reach.
 * @param props.label – Accessible name for the picker.
 */
export default function MonthPicker({
  open,
  anchorEl,
  onClose,
  value,
  onChange,
  onClear,
  isMonthDisabled = () => false,
  minYear,
  maxYear,
  label,
}: Props) {
  const {
    paper,
    header,
    year: yearClass,
    arrow,
    arrowPrevious,
    arrowNext,
    grid,
    cell,
    cellSelected,
    cellDisabled,
    clear,
  } = useStyles();

  const selected = parseYearMonth(value);
  const clampYear = (y: number) => Math.min(Math.max(y, minYear), maxYear);
  const initialYear = () => clampYear(selected ? selected.year : new Date().getFullYear());

  const [viewYear, setViewYear] = useState(initialYear);
  const gridRef = useRef<HTMLDivElement>(null);

  // Each time the picker opens, show the selected month's year (or the current year).
  useEffect(() => {
    if (open) setViewYear(initialYear());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const hasEnabledMonth = (y: number) => MONTHS.some((m) => !isMonthDisabled(y, m));

  const canGoTo = (direction: -1 | 1) => {
    const limit = direction === -1 ? minYear : maxYear;
    for (let y = viewYear + direction; direction === -1 ? y >= limit : y <= limit; y += direction) {
      if (hasEnabledMonth(y)) return true;
    }
    return false;
  };

  const focusStartingMonth = () => {
    const buttons = gridRef.current?.querySelectorAll<HTMLButtonElement>('button');
    if (!buttons) return;
    const target =
      Array.from(buttons).find((b) => b.getAttribute('aria-pressed') === 'true') ??
      Array.from(buttons).find((b) => b.getAttribute('aria-disabled') !== 'true');
    target?.focus();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      TransitionProps={{ onEntered: focusStartingMonth }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      getContentAnchorEl={null}
      PaperProps={{ className: paper, role: 'dialog', 'aria-label': label }}
    >
      <div className={header}>
        <button
          type="button"
          className={`${arrow} ${arrowPrevious}`}
          aria-label="Previous year"
          disabled={!canGoTo(-1)}
          onClick={() => setViewYear(viewYear - 1)}
        >
          <img src={YearArrowSrc} alt="" />
        </button>
        <span className={yearClass} aria-live="polite">
          {viewYear}
        </span>
        <button
          type="button"
          className={`${arrow} ${arrowNext}`}
          aria-label="Next year"
          disabled={!canGoTo(1)}
          onClick={() => setViewYear(viewYear + 1)}
        >
          <img src={YearArrowSrc} alt="" />
        </button>
      </div>
      <div className={grid} ref={gridRef}>
        {MONTHS.map((month) => {
          const isSelected = selected?.year === viewYear && selected.month === month;
          const isDisabled = isMonthDisabled(viewYear, month);
          return (
            <button
              key={month}
              type="button"
              className={`${cell} ${isSelected ? cellSelected : isDisabled ? cellDisabled : ''}`}
              aria-label={`${MONTH_NAMES[month - 1]} ${viewYear}`}
              aria-pressed={isSelected}
              aria-disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) onChange(formatYearMonth({ year: viewYear, month }));
              }}
            >
              {MONTH_LABELS[month - 1]}
            </button>
          );
        })}
      </div>
      {onClear && selected && (
        <button type="button" className={clear} onClick={onClear}>
          Clear
        </button>
      )}
    </Popover>
  );
}

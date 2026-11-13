import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { colors } from '../../colors';
import CalendarIconSrc from '../../assets/calendar-icon.svg';
import ChevronDownSrc from '../../assets/form-chevron-icon.svg';
import { LEASE_DATE_MAX_YEAR, LEASE_DATE_MIN_YEAR, parseYearMonth } from '../../utils/leaseDates';
import MonthPicker, { MONTH_LABELS } from './MonthPicker';

const useStyles = makeStyles({
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    flexShrink: 0,
    width: '263.35px',
    height: '44px',
    padding: '8px 25px',
    border: 'none',
    borderRadius: '50px',
    backgroundColor: colors.gray5,
    color: colors.black,
    fontFamily: 'inherit',
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '28px',
    textAlign: 'left',
    cursor: 'pointer',
    '&:focus-visible': {
      outline: `2px solid ${colors.black}`,
      outlineOffset: '2px',
    },
    '@media (max-width:600px)': { width: '100%' },
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  icon: {
    position: 'relative',
    flexShrink: 0,
    width: '21.09px',
    height: '18px',
    '& img': {
      position: 'absolute',
      top: '-0.84px',
      left: '-0.84px',
      width: '22.25px',
      height: '19.68px',
      maxWidth: 'none',
    },
  },
  chevron: {
    position: 'relative',
    flexShrink: 0,
    width: '16px',
    height: '8px',
    '& img': {
      position: 'absolute',
      top: '-1px',
      left: '-1px',
      width: '18px',
      height: '10.41px',
      maxWidth: 'none',
    },
  },
  chevronOpen: {
    transform: 'scaleY(-1)',
  },
});

/** Formats "YYYY-MM" for display, e.g. "2024-02" becomes "Feb 2024". Returns null if there is no valid month. */
const formatMonthLabel = (value?: string | null): string | null => {
  const parsed = parseYearMonth(value);
  return parsed ? `${MONTH_LABELS[parsed.month - 1]} ${parsed.year}` : null;
};

interface Props {
  /** Id for the button. */
  id: string;
  /** Id of the element that labels this field, e.g. the row's question. */
  labelId: string;
  /** The chosen month as "YYYY-MM", or null/undefined when nothing is chosen. */
  value?: string | null;
  /** Called with the picked month as "YYYY-MM", or null when the user clears the field. */
  onChange: (value: string | null) => void;
  /** Whether a month cannot be chosen. Disabled months look gray and cannot be picked. */
  isMonthDisabled: (year: number, month: number) => boolean;
}

/**
 * LeaseDateField – a pill button showing "Select Time" or the chosen month (e.g. "Feb 2024").
 * It opens a MonthPicker below it. The button opens with Enter or Space, and the chevron flips while open.
 *
 * @param props.id – Id for the button.
 * @param props.labelId – Id of the element that labels this field.
 * @param props.value – The chosen month as "YYYY-MM", if any.
 * @param props.onChange – Called with the picked month, or null when the field is cleared.
 * @param props.isMonthDisabled – Returns true for months that cannot be chosen.
 */
export default function LeaseDateField({ id, labelId, value, onChange, isMonthDisabled }: Props) {
  const { button, content, icon, chevron, chevronOpen } = useStyles();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const label = formatMonthLabel(value);

  return (
    <>
      <button
        type="button"
        id={id}
        ref={buttonRef}
        className={button}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${id}`}
        onClick={() => setOpen(true)}
      >
        <span className={content}>
          <span className={icon}>
            <img src={CalendarIconSrc} alt="" />
          </span>
          {label ?? 'Select Time'}
        </span>
        <span className={`${chevron} ${open ? chevronOpen : ''}`}>
          <img src={ChevronDownSrc} alt="" />
        </span>
      </button>
      <MonthPicker
        open={open}
        anchorEl={buttonRef.current}
        onClose={() => setOpen(false)}
        value={value}
        onChange={(picked) => {
          onChange(picked);
          setOpen(false);
        }}
        onClear={() => {
          onChange(null);
          setOpen(false);
        }}
        isMonthDisabled={isMonthDisabled}
        minYear={LEASE_DATE_MIN_YEAR}
        maxYear={LEASE_DATE_MAX_YEAR}
        label={`Choose a month, currently ${label ?? 'none selected'}`}
      />
    </>
  );
}

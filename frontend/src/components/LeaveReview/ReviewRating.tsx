import React from 'react';
import { FormLabel, makeStyles } from '@material-ui/core';
import HeartRating from '../utils/HeartRating';

interface Props {
  name: string;
  label: string;
  onChange: (event: React.ChangeEvent<{}>, value: number | null) => void;
  defaultValue?: number;
  error?: boolean;
  labelOffset?: number;
}

// The heart glyph fills 20 of the 24 units in a Material icon, so an 18.1px icon box gives the 15.1px
// wide hearts in the design. 1.05px of horizontal padding on each icon gives the 20.2px spacing
// between hearts, and the -2.55px margin removes the empty space (padding plus the glyph's own inset)
// at both ends so the visible row is 95.74px wide.
const HEART_ICON_SIZE = 18.1;

const useStyles = makeStyles({
  row: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    minHeight: '26px',
  },
  hearts: {
    flexShrink: 0,
    margin: '0 -2.55px',
    '& .MuiRating-icon': {
      padding: '0 1.05px',
    },
  },
  label: {
    fontSize: '18px',
    lineHeight: '26px',
  },
});

/**
 * ReviewRating component renders a rating system using hearts and a label.
 *
 * @component
 * @param {string} props.name - The name attribute for the HeartRating component.
 * @param {string} props.label - The label to be displayed next to the HeartRating component.
 * @param {function} props.onChange - Callback function to handle the change event when the rating is modified.
 * @param {number} [props.defaultValue] - The default value for the HeartRating component.
 * @param {boolean} props.error - If true, displays the label in an error state (typically red).
 * @param {number} [props.labelOffset] - Space in px between the hearts and the label. Defaults to 27.79.
 * @returns {JSX.Element} The rendered ReviewRating component.
 */

const ReviewRating = ({
  name,
  label,
  onChange,
  defaultValue,
  error,
  labelOffset = 27.79,
}: Props) => {
  const { row, hearts, label: labelClass } = useStyles();
  return (
    <div className={row}>
      <div className={hearts}>
        <HeartRating
          name={name}
          onChange={onChange}
          defaultValue={defaultValue || 0}
          fontSize={HEART_ICON_SIZE}
        />
      </div>
      <FormLabel error={error} className={labelClass} style={{ marginLeft: `${labelOffset}px` }}>
        {label}
      </FormLabel>
    </div>
  );
};

export default ReviewRating;

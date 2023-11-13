import React, { ReactElement } from 'react';
import { colors } from '../../colors';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';

type Props = {
  readonly value: number;
};

const useStyles = makeStyles((theme) => ({
  barContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  barSegment: {
    flex: 1,
    height: '8px', // Adjust the height as needed
    borderRadius: '4px', // Adjust the border radius as needed
    marginRight: '4px', // Add a small gap between segments
  },
  aveRating: {
    marginLeft: '8px', // Add spacing between the segments and the rating
  },
}));

export default function LabeledLinearProgress({ value }: Props): ReactElement {
  const { barContainer, barSegment, aveRating } = useStyles();
  let rating_value = value - 1;

  const segments = Array.from({ length: 5 }, (_, index) => (
    /**
     * This JSX code represents a rendering of a bar segment for a rating display. The rating value is used to determine the visual appearance of the segment.
     *
     * @param {number} index - The index of the segment within the rating bar.
     * @param {string} barSegment - The CSS class name for styling the segment.
     * @param {number} rating_value - The rating value to be displayed.
     *
     * The background style of the div is set based on the index and rating value:
     * - If the index is less than or equal to the rating_value, the background is set to colors.red1.
     * - If the index is greater than the rating_value and is exactly 0.5 more than the rating_value, a gradient background is applied. The gradient transitions from colors.red1 to colors.gray4, creating a partial fill effect.
     * - For all other cases, the background is set to colors.gray4.
     */
    /**
     * Make it so the segments fill, and when there is a decimal leftover, the segment gets filled to that decimal.
     */
    <div
      key={index}
      className={barSegment}
      style={{
        background:
          index <= rating_value
            ? colors.red1
            : index > rating_value && index - 1 < rating_value
            ? `linear-gradient(to right, ${colors.red1} ${(rating_value - index + 1 / 1) * 100}%, ${
                colors.gray4
              } 0%)`
            : colors.gray4,
      }}
    ></div>
  ));

  return (
    <div className={barContainer}>
      {segments}
      <Typography className={aveRating} variant="body2" color="textSecondary">
        {value !== null && value !== undefined ? value.toFixed(1) : ''}
      </Typography>
    </div>
  );
}

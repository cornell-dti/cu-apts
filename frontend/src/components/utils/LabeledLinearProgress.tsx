import React, { ReactElement } from 'react';
import { colors } from '../../colors';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';

type Props = {
  readonly value: number;
  readonly isAptCard?: boolean;
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
  aptCardBarSegment: {
    flex: 1,
    height: '5.6px', // Adjust the height as needed
    borderRadius: '4px', // Adjust the border radius as needed
    marginRight: '4px', // Add a small gap between segments
  },
  aveRating: {
    marginLeft: '8px', // Add spacing between the segments and the rating
    color: 'textSecondary',
  },
  aptCardAveRating: {
    fontSize: '12.631px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: 'normal',
  },
}));

/**
 * Renders a linear progress bar that displays a rating value using colored segments.
 * Each segment represents one rating point, with partial segments shown for decimal values.
 *
 * The bar consists of 5 segments that fill from left to right based on the rating value:
 * - Segments before the rating value are filled solid red (colors.red1)
 * - The segment containing any decimal portion shows a gradient fill
 * - Remaining segments are gray (colors.gray4)
 *
 * For example:
 * - A rating of 3.5 shows 3 solid red segments, 1 half-filled segment, and 1 gray segment
 * - A rating of 4.2 shows 4 solid red segments and 1 segment filled 20% red
 *
 * @param {number} value - The rating value to display (1-5)
 * @param {boolean} isAptCard - Whether this is being rendered in an apartment card
 * @returns {ReactElement} The linear progress bar component
 */
export default function LabeledLinearProgress({ value, isAptCard = false }: Props): ReactElement {
  const { barContainer, barSegment, aveRating, aptCardAveRating, aptCardBarSegment } = useStyles();
  let rating_value = value - 1;

  const segments = Array.from({ length: 5 }, (_, index) => (
    <div
      key={index}
      className={isAptCard ? aptCardBarSegment : barSegment}
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
      <Typography className={isAptCard ? aptCardAveRating : aveRating} variant="body2">
        {value !== null && value !== undefined ? value.toFixed(1) : ''}
      </Typography>
    </div>
  );
}

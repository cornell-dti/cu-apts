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
  let rating_value = value * 2;
  rating_value = Math.round(rating_value);
  rating_value = rating_value / 2 - 1;
  console.log(rating_value);
  const segments = Array.from({ length: 5 }, (_, index) => (
    <div
      key={index}
      className={barSegment}
      style={{
        background:
          index <= rating_value
            ? colors.red1
            : index > rating_value && rating_value + 0.5 === index
            ? `linear-gradient(to right, ${colors.red1} 0%, ${colors.red1} 50%, ${colors.gray4} 50%, ${colors.gray4} 100%)`
            : colors.gray4,
      }}
    ></div>
  ));

  return (
    <div className={barContainer}>
      {segments}
      <Typography className={aveRating} variant="body2" color="textSecondary">
        {`${value.toFixed(1)}`}
      </Typography>
    </div>
  );
}

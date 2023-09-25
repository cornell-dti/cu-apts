import React, { ReactElement } from 'react';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import styles from '../Review/Review.module.scss';
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

  const segments = Array.from({ length: 5 }, (_, index) => (
    <div
      key={index}
      className={barSegment}
      style={{
        backgroundColor: index < value ? '#B94630' : 'gray', // Change color based on the rating
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

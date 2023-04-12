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
  bar: {
    width: '90%',
  },
}));

export default function LabeledLinearProgress({ value }: Props): ReactElement {
  const { bar } = useStyles();
  return (
    <Box className={styles.barContainer} display="flex" alignItems="center">
      <Box width="90%" mr={1}>
        <LinearProgress className={bar} variant="determinate" value={value * 20} />
      </Box>
      <Box minWidth={35}>
        <Typography
          className={styles.aveRating}
          variant="body2"
          color="textSecondary"
        >{`${value.toFixed(1)}`}</Typography>
      </Box>
    </Box>
  );
}

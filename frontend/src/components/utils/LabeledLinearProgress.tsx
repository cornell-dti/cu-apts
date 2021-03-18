import React, { ReactElement } from 'react';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import styles from '../Review/Review.module.scss';

type Props = {
  readonly value: number;
};

export default function LabeledLinearProgress({ value }: Props): ReactElement {
  return (
    <Box className={styles.barContainer} display="flex" alignItems="center">
      <Box width="90%" mr={1}>
        <LinearProgress className={styles.bar} variant="determinate" value={value * 20} />
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

import React, { ReactElement } from 'react';
import Grid from '@material-ui/core/Grid';
import styles from './Review.module.scss';
import LabeledLinearProgress from '../utils/LabeledLinearProgress';

type Props = {
  readonly aveRatingInfo: string[];
};

export default function PropertyInfo({ aveRatingInfo }: Props): ReactElement {
  return (
    <div>
      <h2 className={styles.headerTitle}>Reviews(12)</h2>
      <div className={styles.detail}>
        <Grid container spacing={1} direction="row">
          {aveRatingInfo.map((info, index) => (
            <Grid item xs={12} md={6} lg={6} key={index}>
              <Grid container spacing={0} direction="row">
                <Grid item xs={5} md={5} lg={5} key={index}>
                  {info}
                </Grid>
                <Grid item xs={7} md={7} lg={7} key={index}>
                  <LabeledLinearProgress value={4.9} />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}

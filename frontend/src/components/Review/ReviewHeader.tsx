import React, { ReactElement } from 'react';
import Grid from '@material-ui/core/Grid';
import styles from './Review.module.scss';
import LabeledLinearProgress from '../utils/LabeledLinearProgress';
import Button from '@material-ui/core/Button';
import { RatingInfo } from '../../pages/LandlordPage';

type Props = {
  readonly numReviews: number;
  readonly aveRatingInfo: RatingInfo[];
};

export default function PropertyInfo({ numReviews, aveRatingInfo }: Props): ReactElement {
  return (
    <div>
      <div className={styles.headerContainer}>
        <h2 className={styles.headerTitle}>Reviews ({numReviews})</h2>
        <Button className={styles.button} variant="contained">
          Leave a Review
        </Button>
      </div>

      <div className={styles.detail}>
        <Grid className={styles.infoContainer} container spacing={2} direction="row">
          {aveRatingInfo.map(({ feature, rating }: RatingInfo, index) => (
            <Grid className={styles.info} item xs={12} md={6} lg={6} key={index}>
              <Grid className={styles.individualInfo} container spacing={0} direction="row">
                <Grid item xs={5} md={5} lg={5} key={index}>
                  {feature}
                </Grid>
                <Grid item xs={7} md={7} lg={7} key={index}>
                  <LabeledLinearProgress value={rating} />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}

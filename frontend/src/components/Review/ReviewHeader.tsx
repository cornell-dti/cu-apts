import React, { ReactElement } from 'react';
import { Grid, Typography } from '@material-ui/core';
import styles from './Review.module.scss';
import LabeledLinearProgress from '../utils/LabeledLinearProgress';
import { RatingInfo } from '../../pages/LandlordPage';
import { useEffect, useState } from 'react';

type Props = {
  readonly aveRatingInfo: RatingInfo[];
};

export default function ReviewHeader({ aveRatingInfo }: Props): ReactElement {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 750);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.detail}>
      <Grid className={styles.infoContainer} container spacing={2} direction="row">
        {aveRatingInfo.map(({ feature, rating }: RatingInfo, index) => (
          <Grid className={styles.info} item xs={12} md={6} lg={6} key={index}>
            <Grid className={styles.individualInfo} container spacing={0} direction="row">
              <Grid item xs={5} md={5} lg={5}>
                <Typography variant="body2">
                  {feature.charAt(0).toUpperCase() + feature.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={7} style={{ marginLeft: isMobile ? '0%' : '-4%' }}>
                <LabeledLinearProgress value={rating} />
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

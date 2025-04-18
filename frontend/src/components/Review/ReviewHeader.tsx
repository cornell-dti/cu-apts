import React, { ReactElement } from 'react';
import { colors, Grid, makeStyles, Typography } from '@material-ui/core';
import styles from './Review.module.scss';
import LabeledLinearProgress from '../utils/LabeledLinearProgress';
import { RatingInfo } from '../../pages/LandlordPage';
import { useEffect, useState } from 'react';

type Props = {
  readonly aveRatingInfo: RatingInfo[];
  readonly isAptCard?: boolean;
};

const useStyles = makeStyles((theme) => ({
  statsTitle: {
    fontSize: '12.9px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: 'normal',
  },
}));

/**
 * Renders a header component displaying average ratings for different features.
 * Each feature rating is shown with a labeled linear progress bar.
 *
 * The component adapts its layout based on:
 * - Screen size (mobile vs desktop)
 * - Whether it's being rendered in an apartment card
 *
 * Features shown include:
 * - Location rating
 * - Maintenance rating
 * - Safety rating
 * - Conditions rating
 *
 * @param {RatingInfo[]} aveRatingInfo - Array of feature ratings to display
 * @param {boolean} isAptCard - Whether this is being rendered in an apartment card
 * @returns {ReactElement} The review header component with rating bars
 */
export default function ReviewHeader({ aveRatingInfo, isAptCard = false }: Props): ReactElement {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { statsTitle } = useStyles();
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
          <Grid
            className={styles.info}
            item
            xs={12}
            md={isAptCard ? 12 : 6}
            lg={isAptCard ? 12 : 6}
            key={index}
          >
            <Grid className={styles.individualInfo} container spacing={0} direction="row">
              <Grid item xs={5} md={isAptCard ? 4 : 5} lg={isAptCard ? 4 : 5}>
                <Typography variant="body2" className={isAptCard ? statsTitle : ''}>
                  {feature.charAt(0).toUpperCase() + feature.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={7} style={{ marginLeft: isMobile ? '0%' : '-4%' }}>
                <LabeledLinearProgress isAptCard={isAptCard} value={rating} />
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

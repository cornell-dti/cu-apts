import React, { ReactElement } from 'react';
import { Grid, Typography, makeStyles } from '@material-ui/core';
import HeartRating from '../utils/HeartRating';
import LabeledLinearProgress from '../utils/LabeledLinearProgress';
import { RatingInfo } from '../../pages/ApartmentPage';
import { colors } from '../../colors';

type Props = {
  readonly aveRatingInfo: RatingInfo[];
  readonly averageRating: number;
  readonly numReviews: number;
};

const useStyles = makeStyles({
  card: {
    background: colors.white,
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 16,
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: `1px solid ${colors.gray5}`,
    paddingRight: 24,
    minWidth: 120,
  },
  avgNumber: {
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1,
    color: colors.black,
    marginBottom: 8,
  },
  naText: {
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1,
    color: colors.gray4,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  rightPanel: {
    flex: 1,
    paddingLeft: 24,
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  featureLabel: {
    width: 100,
    flexShrink: 0,
    fontSize: 14,
    color: colors.black,
  },
  barWrapper: {
    flex: 1,
  },
});

/**
 * RatingSummary displays the overall average rating for an apartment alongside
 * per-category (Location, Maintenance, Safety, Conditions) progress bars.
 *
 * Two states:
 * - Active (numReviews > 0): large bold average number, filled HeartRating, colored bars
 * - N/A (numReviews === 0): "N/A" in gray, empty HeartRating, all bars empty
 */
const RatingSummary = ({ aveRatingInfo, averageRating, numReviews }: Props): ReactElement => {
  const { card, leftPanel, avgNumber, naText, rightPanel, featureRow, featureLabel, barWrapper } =
    useStyles();

  const hasReviews = numReviews > 0 && aveRatingInfo.length > 0;

  return (
    <div className={card}>
      <Grid container alignItems="center" wrap="nowrap">
        <Grid item className={leftPanel}>
          {hasReviews ? (
            <>
              <Typography className={avgNumber} data-testid="rating-average">
                {averageRating.toFixed(1)}
              </Typography>
              <HeartRating value={averageRating} precision={0.5} readOnly />
            </>
          ) : (
            <>
              <Typography className={naText} data-testid="rating-na">
                N/A
              </Typography>
              <HeartRating value={0} precision={0.5} readOnly />
            </>
          )}
        </Grid>

        <Grid item className={rightPanel}>
          {hasReviews
            ? aveRatingInfo.map(({ feature, rating }) => (
                <div key={feature} className={featureRow}>
                  <Typography className={featureLabel}>
                    {feature.charAt(0).toUpperCase() + feature.slice(1)}
                  </Typography>
                  <div className={barWrapper}>
                    <LabeledLinearProgress value={rating} />
                  </div>
                </div>
              ))
            : ['Location', 'Maintenance', 'Safety', 'Conditions'].map((label) => (
                <div key={label} className={featureRow}>
                  <Typography className={featureLabel}>{label}</Typography>
                  <div className={barWrapper}>
                    <LabeledLinearProgress value={0} />
                  </div>
                </div>
              ))}
        </Grid>
      </Grid>
    </div>
  );
};

export default RatingSummary;

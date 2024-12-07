import React, { ReactElement, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Button,
  Link,
} from '@material-ui/core';
import HeartRating from '../utils/HeartRating';
import { format } from 'date-fns';
import { makeStyles } from '@material-ui/styles';
import {
  ApartmentWithId,
  DetailedRating,
  Landlord,
  ReviewWithId,
} from '../../../../common/types/db-types';
import { colors } from '../../colors';
import { get } from '../../utils/call';
import { Link as RouterLink } from 'react-router-dom';
import ReviewHeader from '../Review/ReviewHeader';
import axios from 'axios';
import getPriceRange from '../../utils/priceRange';
import { createAuthHeaders, getUser } from '../../utils/firebase';

/**
 * Component Props for AdminReviewComponent.
 */
type Props = {
  /** The review to be displayed. */
  readonly review: ReviewWithId;
  /** Function to toggle the display. */
  readonly setToggle: React.Dispatch<React.SetStateAction<boolean>>;
  /** Indicates whether to show decline button. */
  readonly showDecline?: boolean;
  /** Indicates whether to show delete button. */
  readonly showDelete?: boolean;
  /** Indicates whether to show ignore button for reported reviews. */
  readonly showIgnore?: boolean;
  /** Indicates whether to show approve button for pending reviews. */
  readonly showApprove?: boolean;
  /** Function to trigger the photo carousel. */
  readonly triggerPhotoCarousel: (photos: readonly string[], startIndex: number) => void;
};

/**
 * Information about a specific rating feature.
 */
export type RatingInfo = {
  /** The name of the feature. */
  feature: string;
  /** The numerical rating for the feature. */
  rating: number;
};

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: '10px',
  },
  dateText: {
    color: colors.gray1,
  },
  bedroomsPriceText: {
    marginTop: '10px',
    marginBottom: '10px',
    display: 'flex',
    gap: '30px',
  },
  ratingInfo: {
    marginTop: '10px',
    marginBottom: '30px',
  },
  photoStyle: {
    borderRadius: '4px',
    height: '15em',
    width: '15em',
    cursor: 'pointer',
    transition: '0.3s ease-in-out',
    '&:hover': {
      filter: 'brightness(0.85)',
      boxShadow: '0 4px 4px rgba(0, 0, 0, 0.1)',
      transform: 'scale(1.02)',
    },
  },
  photoRowStyle: {
    overflowX: 'auto',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    gap: '1vw',
    paddingTop: '2%',
    paddingLeft: '0.6%',
    paddingRight: '0.6%',
    paddingBottom: '2%',
  },
}));

/**
 * AdminReviewComponent - Displays a review card with approval/deletion controls for administrators.
 *
 * @remarks
 * Renders a review's details including ratings, text, photos, and apartment info along with
 * buttons for admins to approve, decline or delete the review. Fetches associated apartment
 * and landlord data on mount.
 *
 * @param {ReviewWithId} props.review - The review object containing all review data to display
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setToggle - Function to control visibility of the review
 * @param {boolean} props.showDecline - Optional flag to show decline button, defaults to false
 * @param {boolean} props.showDelete - Optional flag to show delete button, defaults to false
 * @param {boolean} props.showIgnore - Optional flag to show ignore button, defaults to false
 * @param {boolean} props.showApprove - Optional flag to show approve button, defaults to false
 *
 * @returns {ReactElement} - A Material-UI Card component containing the review details and admin controls
 */
const AdminReviewComponent = ({
  review,
  setToggle,
  showDecline = false,
  showDelete = false,
  showIgnore = false,
  showApprove = false,
  triggerPhotoCarousel,
}: Props): ReactElement => {
  const { detailedRatings, overallRating, bedrooms, price, date, reviewText, photos } = review;
  const formattedDate = format(new Date(date), 'MMM dd, yyyy').toUpperCase();
  const { root, dateText, bedroomsPriceText, ratingInfo, photoStyle, photoRowStyle } = useStyles();
  const [apt, setApt] = useState<ApartmentWithId[]>([]);
  const [landlord, setLandlord] = useState<Landlord>();

  useEffect(() => {
    if (review.aptId !== null) {
      get<ApartmentWithId[]>(`/api/apts/${review.aptId}`, {
        callback: setApt,
      });
    }
    get<Landlord>(`/api/landlord/${review.landlordId}`, {
      callback: setLandlord,
    });
  }, [review]);

  /**
   * Get an array of rating information from detailed ratings.
   *
   * @param ratings - The detailed ratings object.
   * @returns An array of rating information.
   */
  const getRatingInfo = (ratings: DetailedRating): RatingInfo[] => {
    return [
      { feature: 'Location', rating: ratings.location },
      { feature: 'Safety', rating: ratings.safety },
      { feature: 'Value', rating: ratings.value },
      { feature: 'Maintenance', rating: ratings.maintenance },
      { feature: 'Communication', rating: ratings.communication },
      { feature: 'Conditions', rating: ratings.conditions },
    ];
  };

  /**
   * Change the status of the review and trigger a re-render.
   *
   * @param newStatus - The new status for the review.
   * @returns A promise representing the completion of the operation.
   */
  const changeStatus = async (newStatus: string) => {
    const endpoint = `/api/update-review-status/${review.id}/${newStatus}`;
    let user = await getUser(true);
    if (user) {
      const token = await user.getIdToken(true);
      await axios.put(endpoint, {}, createAuthHeaders(token));
      setToggle((cur) => !cur);
    }
  };

  return (
    <Card className={root} variant="outlined">
      <Box minHeight="200px">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container justifyContent="space-between">
              <Grid item>
                <HeartRating value={overallRating} readOnly />
              </Grid>
              <Grid>
                {apt.length > 0 ? (
                  <Link
                    {...{
                      to: `/apartment/${review.aptId}`,
                      style: {
                        fontWeight: 'bold',
                      },
                      component: RouterLink,
                    }}
                  >
                    {'Apartment  -  ' + apt[0].name}
                  </Link>
                ) : (
                  <Link
                    {...{
                      to: `/landlord/${review.landlordId}`,
                      style: {
                        fontWeight: 'bold',
                      },
                      component: RouterLink,
                    }}
                  >
                    {'Landlord  -  ' + landlord?.name}
                  </Link>
                )}
              </Grid>

              <Grid item>
                <Typography className={dateText}>{formattedDate}</Typography>
              </Grid>

              <Grid item xs={12} className={bedroomsPriceText}>
                {bedrooms > 0 && (
                  <Typography style={{ fontWeight: '600' }}>Bedroom(s): {bedrooms}</Typography>
                )}
                {price > 0 && (
                  <Typography style={{ fontWeight: '600' }}>
                    {' '}
                    Price: {getPriceRange(price) || 0}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} className={ratingInfo}>
                <ReviewHeader aveRatingInfo={getRatingInfo(detailedRatings)} />
              </Grid>

              <Grid item container alignContent="center">
                <Typography>{reviewText}</Typography>
              </Grid>

              {photos.length > 0 && (
                <Grid container>
                  <Grid item className={photoRowStyle}>
                    {photos.map((photo, i) => {
                      return (
                        <CardMedia
                          component="img"
                          alt="Apt image"
                          image={photo}
                          title="Apt image"
                          className={photoStyle}
                          onClick={() => triggerPhotoCarousel(photos, i)}
                          loading="lazy"
                        />
                      );
                    })}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Box>

      <CardActions>
        <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
          {showDelete && (
            <Grid item>
              <Button
                onClick={() => changeStatus('DELETED')}
                variant="contained"
                style={{ color: colors.black }}
              >
                <strong>Delete</strong>
              </Button>
            </Grid>
          )}
          {showDecline && (
            <Grid item>
              <Button
                onClick={() => changeStatus('DECLINED')}
                variant="outlined"
                style={{ color: colors.red1 }}
              >
                <strong>Decline</strong>
              </Button>
            </Grid>
          )}
          {showIgnore && (
            <Grid item>
              <Button
                onClick={() => changeStatus('APPROVED')}
                variant="outlined"
                style={{ color: colors.gray2 }}
              >
                <strong>Ignore</strong>
              </Button>
            </Grid>
          )}
          {showApprove && (
            <Grid item>
              <Button
                onClick={() => changeStatus('APPROVED')}
                variant="contained"
                style={{ backgroundColor: colors.green1 }}
              >
                <strong>Approve</strong>
              </Button>
            </Grid>
          )}
        </Grid>
      </CardActions>
    </Card>
  );
};

export default AdminReviewComponent;

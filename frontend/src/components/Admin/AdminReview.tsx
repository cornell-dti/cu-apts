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

/**
 * Component Props for AdminReviewComponent.
 */
type Props = {
  /** The review to be displayed. */
  readonly review: ReviewWithId;
  /** Function to toggle the display. */
  readonly setToggle: React.Dispatch<React.SetStateAction<boolean>>;
  /** Indicates if the review is in the declined section. */
  readonly declinedSection: boolean;
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
  ratingInfo: {
    marginTop: '10px',
    marginBottom: '30px',
  },
  photoStyle: {
    borderRadius: '4px',
    height: '15em',
    width: '15em',
  },
  photoRowStyle: {
    overflowX: 'auto',
    display: 'flex',
    flexDirection: 'row',
    gap: '1vw',
    paddingTop: '2%',
    paddingLeft: '0.6%',
  },
}));

/**
 * AdminReviewComponent displays an individual review for admin approval or deletion.
 *
 * @param review review - The review to approve
 * @returns The rendered component.
 */
const AdminReviewComponent = ({ review, setToggle, declinedSection }: Props): ReactElement => {
  const { detailedRatings, overallRating, date, reviewText, photos } = review;
  const formattedDate = format(new Date(date), 'MMM dd, yyyy').toUpperCase();
  const { root, dateText, ratingInfo, photoStyle, photoRowStyle } = useStyles();
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
    await axios.put(endpoint);
    setToggle((cur) => !cur);
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

              <Grid item xs={12} className={ratingInfo}>
                <ReviewHeader aveRatingInfo={getRatingInfo(detailedRatings)} />
              </Grid>

              <Grid item container alignContent="center">
                <Typography>{reviewText}</Typography>
              </Grid>

              {photos.length > 0 && (
                <Grid container>
                  <Grid item className={photoRowStyle}>
                    {photos.map((photo) => {
                      return (
                        <CardMedia
                          component="img"
                          alt="Apt image"
                          image={photo}
                          title="Apt image"
                          className={photoStyle}
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
          {declinedSection && (
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
          <Grid item>
            <Button
              onClick={() => changeStatus('DECLINED')}
              variant="outlined"
              style={{ color: colors.red1 }}
            >
              <strong>Decline</strong>
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => changeStatus('APPROVED')}
              variant="contained"
              style={{ backgroundColor: colors.green1 }}
            >
              <strong>Approve</strong>
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default AdminReviewComponent;

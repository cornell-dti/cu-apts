// Importing necessary modules and components from Material-UI and other libraries
import React, { useEffect, ReactElement, useState, useCallback } from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PhotoCarousel from '../../components/PhotoCarousel/PhotoCarousel';

import {
  // Material-UI components
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Button,
  IconButton,
  Collapse,
  Link,
} from '@material-ui/core';
import HeartRating from '../utils/HeartRating';
import { format } from 'date-fns';
import { makeStyles } from '@material-ui/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';

import {
  DetailedRating,
  ReviewWithId,
  ApartmentWithId,
  Landlord,
} from '../../../../common/types/db-types';
import axios from 'axios';
import { colors } from '../../colors';
import { RatingInfo } from '../../pages/LandlordPage';
import ReviewHeader from './ReviewHeader';
import { Link as RouterLink } from 'react-router-dom';
import { getUser } from '../../utils/firebase';
import { get } from '../../utils/call';
import ReviewModal from '../../components/LeaveReview/ReviewModal';

// Define the prop types for the component
type Props = {
  readonly review: ReviewWithId;
  readonly liked: boolean;
  readonly likeLoading: boolean;
  readonly addLike: (reviewId: string) => Promise<void>;
  readonly removeLike: (reviewId: string) => Promise<void>;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
  readonly isLandlord: boolean;
  readonly allowEdit: boolean;
  readonly showLabel: boolean;
};

// Define the styles for the component using Material-UI's makeStyles
const useStyles = makeStyles(() => ({
  root: {
    borderRadius: '10px',
  },
  // styling for apartment indicator text
  apartmentIndicator: {
    display: 'inline-flex',
    marginTop: '7px',
    marginBottom: '7px',
    fontSize: '19px',
  },
  bottomborder: {
    borderBottom: '1px #E8E8E8 solid',
    marginBottom: '5px',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    borderColor: colors.black,
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  dateText: {
    color: colors.gray1,
  },
  heartSpacing: {
    marginBottom: '10px',
  },
  button: {
    textTransform: 'none',
    '&.Mui-disabled': {
      color: 'inherit',
    },
  },
  photoStyle: {
    borderRadius: '4px',
    height: '15em',
    width: '15em',
  },
  photoRowStyle: {
    overflowX: 'auto',
    display: 'flex',
    lexDirection: 'row',
    gap: '1vw',
    paddingTop: '2%',
    paddingLeft: '0.6%',
  },
}));

// Define the main functional component
const ReviewComponent = ({
  review,
  liked,
  likeLoading,
  addLike,
  removeLike,
  setToggle,
  user,
  setUser,
  isLandlord,
  showLabel,
  allowEdit,
}: Props): ReactElement => {
  // Set the duration for toast notifications
  const toastTime = 3500;

  // Destructure properties from the review object
  const { id, detailedRatings, overallRating, date, reviewText, likes, photos } = review;

  // Format the date using date-fns library
  const formattedDate = format(new Date(date), 'MMM dd, yyyy').toUpperCase();

  // Destructure styles from the useStyles hook
  const {
    root,
    expand,
    expandOpen,
    dateText,
    button,
    photoStyle,
    photoRowStyle,
    bottomborder,
    heartSpacing,
    apartmentIndicator,
  } = useStyles();

  // State variables for handling expansion, apartment data, review modal, etc.
  const [expanded, setExpanded] = useState(false);
  const [expandedText, setExpandedText] = useState(false);
  const [apt, setApt] = useState<ApartmentWithId[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [showSignInError, setShowSignInError] = useState(false);
  const [landlordData, setLandlordData] = useState<Landlord>();
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Function to handle expand/collapse click
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Retrieve apartment data when the review's aptId changes
  useEffect(() => {
    if (review.aptId !== null) {
      get<ApartmentWithId[]>(`/api/apts/${review.aptId}`, {
        callback: setApt,
      });
    }
  }, [review]);

  // Function to get an array of rating information from detailed ratings
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

  // Function to report abuse on a review
  const reportAbuseHanler = async (reviewId: string) => {
    if (user) {
      const endpoint = `/api/update-review-status/${reviewId}/PENDING`;
      await axios.put(endpoint);
      setToggle((cur) => !cur);
    } else {
      let user = await getUser(true);
      setUser(user);
    }
  };

  // Function to handle like/unlike of a review
  const likeHandler = async (id: string) => {
    if (user) {
      (liked ? removeLike : addLike)(id);
    } else {
      let user = await getUser(true);
      setUser(user);
    }
  };

  // Function to handle scrolling to the top of the page
  const handleLinkClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Function to show a toast notification
  const showToast = (setState: (value: React.SetStateAction<boolean>) => void) => {
    setState(true);
    setTimeout(() => {
      setState(false);
    }, toastTime);
  };

  // Function to show a sign-in error toast
  const showSignInErrorToast = () => {
    showToast(setShowSignInError);
  };

  // Function to open the review modal
  const openReviewModal = async (initialValues: ReviewWithId) => {
    let user = await getUser(true);
    setUser(user);
    if (!user) {
      showSignInErrorToast();
      return;
    }
    setReviewOpen(true);
  };

  // Function to show a confirmation toast
  const showConfirmationToast = () => {
    showToast(setShowConfirmation);
  };

  // Conditional rendering of modals based on landlordData and apt
  const Modals = landlordData && apt && (
    <>
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        setOpen={setReviewOpen}
        landlordId={review.landlordId}
        onSuccess={showConfirmationToast}
        toastTime={toastTime}
        aptId={review.aptId!}
        aptName={apt.length > 0 ? apt[0].name : ''}
        user={user}
      />
      <PhotoCarousel
        photos={landlordData.photos}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
      />
    </>
  );

  // Function to handle editing of a review
  const handleEdit = (id: string) => {
    // Review popup modal
    let rev = {
      id: id,
      landlordId: review.landlordId,
      aptId: review.aptId,
      reviewText: review.reviewText,
      detailedRatings: review.detailedRatings,
      overallRating: review.overallRating,
      photos: review.photos,
      date: review.date,
    };

    openReviewModal(rev);
  };

  // Callback for when a landlord is not found
  const landlordNotFound = useCallback(() => {
    console.error('Landlord with id ' + review.landlordId + ' not found.');
  }, [review.landlordId]);

  // Fetch landlord data when the component mounts or when landlordId changes
  useEffect(() => {
    get<Landlord>(`/api/landlord/${review.landlordId}`, {
      callback: setLandlordData,
      errorHandler: landlordNotFound,
    });
  }, [review.landlordId, landlordNotFound]);

  // Function to render the label for property or landlord
  const propertyLandlordLabel = () => {
    return (
      showLabel && (
        <>
          <Grid style={{ fontWeight: 'bold', marginRight: '5px' }}>
            {apt.length > 0 ? 'Property: ' : 'Landlord: '}
          </Grid>
          <Link
            {...{
              to: apt.length > 0 ? `/apartment/${review.aptId}` : `/landlord/${review.landlordId}`,
              style: {
                color: 'black',
                textDecoration: 'underline',
                paddingBottom: '3px',
              },
              component: RouterLink,
            }}
            onClick={handleLinkClick}
          >
            {apt.length > 0 ? apt[0].name : landlordData ? landlordData.name : ''}
          </Link>
        </>
      )
    );
  };

  // Render the main component
  return (
    <>
      <Card className={root} variant="outlined">
        <Box minHeight="200px">
          <CardContent>
            <Grid container spacing={2}>
              <Grid item container justifyContent="space-between">
                <Grid item container justifyContent="space-between" className={bottomborder}>
                  <Grid container item spacing={1}>
                    <Grid item className={heartSpacing}>
                      <HeartRating value={overallRating} readOnly />
                    </Grid>
                    <Grid item>
                      <IconButton
                        className={clsx(expand, {
                          [expandOpen]: expanded,
                        })}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                        size="small"
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Grid>

                    <Grid item style={{ marginLeft: 'auto' }}>
                      <Typography className={dateText}>{formattedDate}</Typography>
                    </Grid>
                    {allowEdit && (
                      <Grid item style={{ marginTop: '-10px' }}>
                        <IconButton aria-label="edit" onClick={() => handleEdit(review.id)}>
                          <MoreVertIcon />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>

                  <Grid item>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                      <CardContent>
                        <ReviewHeader aveRatingInfo={getRatingInfo(detailedRatings)} />
                      </CardContent>
                    </Collapse>
                  </Grid>
                </Grid>

                <Grid>
                  <Typography className={apartmentIndicator}>{propertyLandlordLabel()}</Typography>
                </Grid>

                <Grid item container alignContent="center">
                  <Typography>
                    {expandedText ? reviewText : reviewText.substring(0, 500)}
                    {!expandedText && reviewText.length > 500 && '...'}
                    {reviewText.length > 500 ? (
                      <Button className={button} onClick={() => setExpandedText(!expandedText)}>
                        {expandedText ? 'Read Less' : 'Read More'}
                      </Button>
                    ) : null}
                  </Typography>
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
          <Grid item container justifyContent="space-between">
            <Grid item>
              <Button
                color={liked ? 'primary' : 'default'}
                onClick={() => likeHandler(id)}
                className={button}
                size="small"
                disabled={likeLoading}
              >
                Helpful {`(${likes || 0})`}
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={() => reportAbuseHanler(review.id)} className={button} size="small">
                Report Abuse
              </Button>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
      {Modals}
    </>
  );
};

export default ReviewComponent;

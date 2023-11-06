import { Box, Button, Container, Grid, Hidden, makeStyles, Typography } from '@material-ui/core';
import React, { ReactElement, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReviewModal from '../components/LeaveReview/ReviewModal';
import PhotoCarousel from '../components/PhotoCarousel/PhotoCarousel';
import InfoFeatures from '../components/Review/InfoFeatures';
import ReviewComponent from '../components/Review/Review';
import ReviewHeader from '../components/Review/ReviewHeader';
import { useTitle } from '../utils';
import LandlordHeader from '../components/Landlord/Header';
import { get } from '../utils/call';
import { Landlord } from '../../../common/types/db-types';
import Toast from '../components/LeaveReview/Toast';
import LinearProgress from '../components/utils/LinearProgress';
import { Likes, ReviewWithId } from '../../../common/types/db-types';
import axios from 'axios';
import { createAuthHeaders, subscribeLikes, getUser } from '../utils/firebase';
import DropDown from '../components/utils/DropDown';
import NotFoundPage from './NotFoundPage';
import { CardData } from '../App';
import { getAverageRating } from '../utils/average';
import HeartRating from '../components/utils/HeartRating';
import { colors } from '../colors';

export type RatingInfo = {
  feature: string;
  rating: number;
};

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: '20px',
  },
  leaveReviewContainer: {
    marginTop: '16px',
    marginBottom: '24px',
  },
  horizontalLine: {
    borderTop: '1px solid #C4C4C4',
    width: '95%',
    marginTop: '20px',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: 'none',
  },
  heartRating: {
    marginTop: '3px',
    marginRight: '10px',
  },
  aptRating: {
    color: colors.black,
  },
  reviewButton: {
    borderRadius: '30px',
    marginTop: '10px',
    marginBottom: '10px',
  },
  sortByButton: {
    background: '#E8E8E8',
    border: 'none',
    borderRadius: '10px',
    paddingRight: '5px',
    paddingLeft: '5px',
  },
}));

/**
 * LandlordPage Component
 *
 * This component represents a page for viewing and leaving reviews for landlords.
 * It displays landlords information, reviews, and provides functionality to leave new reviews,
 * sort reviews. Additionally, it contains information about other properties the landloard owns.
 *
 * @component
 * @param setUser - Function to set the current user.
 * @returns LandlordPage The LandlordPage component.
 */
const LandlordPage = ({ user, setUser }: Props): ReactElement => {
  const { landlordId } = useParams<Record<string, string>>();
  const [landlordData, setLandlordData] = useState<Landlord>();
  const [aveRatingInfo] = useState<RatingInfo[]>([]);
  const [reviewData, setReviewData] = useState<ReviewWithId[]>([]);
  const [likedReviews, setLikedReviews] = useState<Likes>({});
  const [likeStatuses, setLikeStatuses] = useState<Likes>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [buildings, setBuildings] = useState<CardData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showSignInError, setShowSignInError] = useState(false);
  const toastTime = 4750;
  const [sortBy, setSortBy] = useState<Fields>('date');
  const [notFound, setNotFound] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [resultsToShow, setResultsToShow] = useState<number>(reviewData.length);
  const {
    container,
    leaveReviewContainer,
    horizontalLine,
    heartRating,
    aptRating,
    reviewButton,
    sortByButton,
  } = useStyles();

  // useEffect hook to control the number of results to show based on screen size and reviewData length
  useEffect(() => {
    if (isMobile) {
      setResultsToShow(5);
    } else {
      setResultsToShow(reviewData.length);
    }
  }, [isMobile, reviewData.length]);

  // Function to handle "Show More" button click
  const handleShowMore = () => {
    setResultsToShow(resultsToShow + 5);
  };

  // Function to handle page not found
  const handlePageNotFound = () => {
    console.log('Page not found');
    setNotFound(true);
  };

  // Set the page title using the useTitle custom hook
  useTitle(
    () => (loaded && landlordData !== undefined ? `${landlordData.name}` : 'Landlord Reviews'),
    [loaded, landlordData]
  );

  // Fetch review data when the component mounts or when showConfirmation or toggle change
  useEffect(() => {
    get<ReviewWithId[]>(`/api/review/landlordId/${landlordId}/APPROVED`, {
      callback: setReviewData,
    });
  }, [landlordId, showConfirmation, toggle]);

  // Fetch landlord data when the component mounts or when landlordId changes
  useEffect(() => {
    get<Landlord>(`/api/landlord/${landlordId}`, {
      callback: setLandlordData,
      errorHandler: handlePageNotFound,
    });
  }, [landlordId]);

  // Fetch building data when the component mounts or when landlordId changes
  useEffect(() => {
    get<CardData[]>(`/api/buildings/all/${landlordId}`, {
      callback: setBuildings,
    });
  }, [landlordId]);

  // useEffect hook to handle screen size changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if the necessary data is loaded to render the component
  useEffect(() => {
    if (landlordData && buildings && reviewData) {
      setLoaded(true);
    }
  }, [landlordData, buildings, reviewData]);

  // Subscribe to liked reviews using Firebase
  useEffect(() => {
    return subscribeLikes(setLikedReviews);
  }, []);

  // Function to sort reviews based on a specific property
  const sortReviews = useCallback((arr: ReviewWithId[], property: Fields) => {
    let unsorted = arr;
    return unsorted.sort((r1, r2) => {
      const first = r1?.[property] === undefined ? 0 : r1?.[property];
      const second = r2?.[property] === undefined ? 0 : r2?.[property];
      // @ts-ignore: Object possibly null or undefined
      return first < second ? 1 : -1;
    });
  }, []);

  // Define the type of the properties used for sorting reviews
  type Fields = keyof typeof reviewData[0];

  // Function to display a toast message and hide it after a certain time
  const showToast = (setState: (value: React.SetStateAction<boolean>) => void) => {
    setState(true);
    setTimeout(() => {
      setState(false);
    }, toastTime);
  };

  // Function to show a confirmation toast
  const showConfirmationToast = () => {
    showToast(setShowConfirmation);
  };

  // Function to show a sign-in error toast
  const showSignInErrorToast = () => {
    showToast(setShowSignInError);
  };

  // Function to handle liking or disliking a review
  const likeHelper = (dislike = false) => {
    return async (reviewId: string) => {
      setLikeStatuses((reviews) => ({ ...reviews, [reviewId]: true }));
      try {
        const user = await getUser(true);
        if (!user) {
          throw new Error('Failed to login');
        }
        const defaultLikes = dislike ? 1 : 0;
        const offsetLikes = dislike ? -1 : 1;
        const token = await user.getIdToken(true);
        const endpoint = dislike ? '/api/remove-like' : '/api/add-like';
        await axios.post(endpoint, { reviewId }, createAuthHeaders(token));
        setLikedReviews((reviews) => ({ ...reviews, [reviewId]: !dislike }));
        setReviewData((reviews) =>
          reviews.map((review) =>
            review.id === reviewId
              ? { ...review, likes: (review.likes || defaultLikes) + offsetLikes }
              : review
          )
        );
      } catch (err) {
        throw new Error('Error with liking review');
      }
      setLikeStatuses((reviews) => ({ ...reviews, [reviewId]: false }));
    };
  };

  // Define two functions for handling likes and dislikes
  const addLike = likeHelper(false);

  const removeLike = likeHelper(true);

  const openReviewModal = async () => {
    let user = await getUser(true);
    setUser(user);
    if (!user) {
      showSignInErrorToast();
      return;
    }
    setReviewOpen(true);
  };

  // Define a component 'Modals' conditionally based on landlordData existence
  const Modals = landlordData && (
    <>
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        setOpen={setReviewOpen}
        landlordId={landlordId}
        onSuccess={showConfirmationToast}
        toastTime={toastTime}
        aptId={''}
        aptName={''}
        user={user}
      />
      <PhotoCarousel
        photos={landlordData.photos}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
      />
    </>
  );

  // Define a component 'Header' for displaying information at the top of the landlord page
  const Header = (
    <>
      <Grid container alignItems="center">
        <Grid container spacing={1}>
          <Grid item>
            <Typography variant="h6">Reviews ({reviewData.length})</Typography>
            {reviewData.length === 0 && (
              <Typography>No reviews available. Be the first to leave one!</Typography>
            )}
          </Grid>

          {reviewData.length > 0 && (
            <Grid item>
              <Grid container alignItems="center">
                <Grid item className={heartRating}>
                  <HeartRating value={getAverageRating(reviewData)} precision={0.5} readOnly />
                </Grid>
                <Grid item className={aptRating}>
                  <Typography variant="h6">
                    {getAverageRating(reviewData).toFixed(1) + ' / 5'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>

        {landlordData && landlordData.photos.length > 0 && (
          <Button
            color="secondary"
            variant="contained"
            disableElevation
            onClick={() => setCarouselOpen(true)}
          >
            Show all photos
          </Button>
        )}

        <Grid item className={leaveReviewContainer} xs={12}>
          <Grid container spacing={1} alignItems="center" justifyContent="space-between">
            <Grid item>
              <Button
                color="primary"
                className={reviewButton}
                variant="contained"
                disableElevation
                onClick={openReviewModal}
              >
                Leave a Review
              </Button>
            </Grid>
            <Grid item>
              <Grid container spacing={1} direction="row" alignItems="center">
                <Grid item>
                  <Typography>Sort by:</Typography>
                </Grid>
                <Grid item className={sortByButton}>
                  <DropDown
                    menuItems={[
                      {
                        item: 'Recent',
                        callback: () => {
                          setSortBy('date');
                        },
                      },
                      {
                        item: 'Helpful',
                        callback: () => {
                          setSortBy('likes');
                        },
                      },
                    ]}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} style={{ marginTop: '2%' }}>
        <ReviewHeader aveRatingInfo={aveRatingInfo} />
      </Grid>
    </>
  );

  // Define a component 'MobileHeader' for displaying information on mobile at the top of the landlord page
  const MobileHeader = (
    <>
      <Grid container alignItems="center">
        <Grid container spacing={1}>
          <Grid item style={{ marginTop: '4px' }}>
            <Typography style={{ marginLeft: '5px', fontSize: '18px', fontWeight: 500 }}>
              Reviews ({reviewData.length})
            </Typography>
            {reviewData.length === 0 && (
              <Typography style={{ marginLeft: '5px', fontSize: '18px' }}>
                No reviews available. Be the first to leave one!
              </Typography>
            )}
          </Grid>
          {reviewData.length > 0 && (
            <Grid item style={{ marginTop: '4px' }}>
              <Grid container alignItems="center">
                <Grid item className={heartRating}>
                  <HeartRating value={getAverageRating(reviewData)} precision={0.5} readOnly />
                </Grid>
                <Grid item className={aptRating}>
                  <Typography style={{ fontSize: '18px', fontWeight: 500 }}>
                    {getAverageRating(reviewData).toFixed(1) + ' / 5  '}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
        <Grid container spacing={4}>
          {landlordData && landlordData.photos.length > 0 && (
            <Button
              color="secondary"
              variant="contained"
              disableElevation
              onClick={() => setCarouselOpen(true)}
            >
              Show all photos
            </Button>
          )}
        </Grid>
        <Grid item className={leaveReviewContainer} xs={12}>
          <Grid container spacing={1} alignItems="center" justifyContent="space-between">
            <Grid item>
              <Button
                style={{ borderRadius: 20, fontSize: '14px' }}
                color="primary"
                variant="contained"
                disableElevation
                onClick={openReviewModal}
              >
                Leave a Review
              </Button>
            </Grid>
            <Grid item style={{ marginRight: '8px' }}>
              <Grid container spacing={1} direction="row" alignItems="center">
                <Grid item>
                  <Typography style={{ fontSize: '15px' }}>Sort by:</Typography>
                </Grid>
                <Grid item>
                  <DropDown
                    menuItems={[
                      {
                        item: 'Recent',
                        callback: () => {
                          setSortBy('date');
                        },
                      },
                      {
                        item: 'Helpful',
                        callback: () => {
                          setSortBy('likes');
                        },
                      },
                    ]}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );

  // Define an 'InfoSection' component for displaying landlord information
  const InfoSection = landlordData && (
    <Grid item xs={12} sm={4} style={{ marginBottom: '20px' }}>
      <InfoFeatures {...landlordData} buildings={buildings} />
    </Grid>
  );

  return notFound ? (
    <NotFoundPage />
  ) : !loaded ? (
    <LinearProgress />
  ) : (
    <>
      {landlordData && (
        <Container>
          <LandlordHeader landlord={landlordData} handleClick={() => setCarouselOpen(true)} />
        </Container>
      )}

      <Container className={container}>
        <Grid container spacing={5} justifyContent="center" style={{ marginBottom: '20px' }}>
          <Grid item xs={12} sm={8}>
            {isMobile ? MobileHeader : Header}
            {!isMobile && <Hidden smUp>{InfoSection}</Hidden>}

            {showConfirmation && (
              <Toast
                isOpen={showConfirmation}
                severity="success"
                message="Review successfully submitted!"
                time={toastTime}
              />
            )}
            {showSignInError && (
              <Toast
                isOpen={showSignInError}
                severity="error"
                message="Error: Please sign in with a Cornell email."
                time={toastTime}
              />
            )}

            <Grid container item spacing={3}>
              {sortReviews(reviewData, sortBy)
                .slice(0, resultsToShow)
                .map((review, index) => (
                  <Grid item xs={12} key={index}>
                    <ReviewComponent
                      review={review}
                      liked={likedReviews[review.id]}
                      likeLoading={likeStatuses[review.id]}
                      addLike={addLike}
                      removeLike={removeLike}
                      setToggle={setToggle}
                      user={user}
                      setUser={setUser}
                    />
                  </Grid>
                ))}
            </Grid>

            {isMobile && reviewData.length > resultsToShow && (
              <Box textAlign="center">
                <Grid item xs={12}>
                  <hr className={horizontalLine} />
                </Grid>
                <Grid item style={{ padding: '30px' }}>
                  <Button
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #A3A3A3',
                      borderRadius: '9px',
                      width: '10em',
                      textTransform: 'initial',
                    }}
                    variant="contained"
                    disableElevation
                    onClick={handleShowMore}
                  >
                    Show More
                  </Button>
                </Grid>
              </Box>
            )}
          </Grid>
          {isMobile && <Hidden smUp>{InfoSection}</Hidden>}
          <Hidden xsDown>{InfoSection}</Hidden>
        </Grid>
      </Container>
      {Modals}
    </>
  );
};

export default LandlordPage;

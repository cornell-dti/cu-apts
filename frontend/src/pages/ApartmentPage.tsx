import React, { ReactElement, useState, useEffect, useCallback } from 'react';
import {
  IconButton,
  Button,
  Container,
  Grid,
  Hidden,
  Typography,
  makeStyles,
  Box,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ReviewModal from '../components/LeaveReview/ReviewModal';
import PhotoCarousel from '../components/PhotoCarousel/PhotoCarousel';
import ReviewComponent from '../components/Review/Review';
import ReviewHeader from '../components/Review/ReviewHeader';
import { useTitle } from '../utils';
import ApartmentHeader from '../components/Apartment/Header';
import AptInfo from '../components/Apartment/AptInfo';
import { get } from '../utils/call';
import {
  Landlord,
  Apartment,
  ApartmentWithId,
  DetailedRating,
} from '../../../common/types/db-types';
import Toast from '../components/LeaveReview/Toast';
import LinearProgress from '../components/utils/LinearProgress';
import { Likes, ReviewWithId } from '../../../common/types/db-types';
import axios from 'axios';
import { createAuthHeaders, subscribeLikes, getUser } from '../utils/firebase';
import DropDown from '../components/utils/DropDown';
import { useParams } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';
import HeartRating from '../components/utils/HeartRating';
import { CardData } from '../App';
import { getAverageRating } from '../utils/average';
import { colors } from '../colors';
import clsx from 'clsx';

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

export type RatingInfo = {
  feature: string;
  rating: number;
};

const useStyles = makeStyles((theme) => ({
  sortByButton: {
    background: '#E8E8E8',
    border: 'none',
    borderRadius: '10px',
    paddingRight: '5px',
    paddingLeft: '5px',
  },
  reviewButton: {
    borderRadius: '30px',
    marginTop: '10px',
    marginBottom: '10px',
  },
  aptRating: {
    color: colors.black,
  },
  heartRating: {
    marginTop: '3px',
    marginRight: '10px',
  },
  leaveReviewContainer: {
    marginTop: '16px',
    marginBottom: '24px',
  },
  ratingInfo: {
    marginBottom: '30px',
  },
  container: {
    marginTop: '20px',
  },
  root: {
    borderRadius: '10px',
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
  button: {
    textTransform: 'none',
    '&.Mui-disabled': {
      color: 'inherit',
    },
  },
  horizontalLine: {
    borderTop: '1px solid #C4C4C4',
    width: '95%',
    marginTop: '20px',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: 'none',
  },
}));

/**
 * ApartmentPage Component
 *
 * This component represents a page for viewing and leaving reviews for apartments.
 * It displays apartment information, reviews, and provides functionality to leave new reviews,
 * sort reviews, and interact with existing reviews (like/dislike). Additionally, it contains information
 * about the landloard and other related properties.
 *
 * @component
 * @param props - The props for the ApartmentPage component.
 * @param user props.user - The current user, null if not logged in.
 * @param setUser - Function to set the current user.
 * @returns ApartmentPage The ApartmentPage component.
 */
const ApartmentPage = ({ user, setUser }: Props): ReactElement => {
  const { aptId } = useParams<Record<string, string>>();
  const [landlordData, setLandlordData] = useState<Landlord>();
  const [aveRatingInfo, setAveRatingInfo] = useState<RatingInfo[]>([]);
  const [reviewData, setReviewData] = useState<ReviewWithId[]>([]);
  const [likedReviews, setLikedReviews] = useState<Likes>({});
  const [likeStatuses, setLikeStatuses] = useState<Likes>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [buildings, setBuildings] = useState<Apartment[]>([]);
  const [aptData, setAptData] = useState<ApartmentWithId[]>([]);
  const [apt, setApt] = useState<ApartmentWithId | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [showSignInError, setShowSignInError] = useState(false);
  const [sortBy, setSortBy] = useState<Fields>('date');
  const toastTime = 3500;
  const [notFound, setNotFound] = useState(false);
  const [otherProperties, setOtherproperties] = useState<CardData[]>([]);
  const [toggle, setToggle] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isClicked, setIsClicked] = useState<boolean>(true);
  const [resultsToShow, setResultsToShow] = useState<number>(reviewData.length);

  // Set the number of results to show based on mobile or desktop view.
  useEffect(() => {
    if (isMobile) {
      setResultsToShow(5);
    } else {
      setResultsToShow(reviewData.length);
    }
  }, [isMobile, reviewData.length]);

  // const handleShowMore = () => {
  //   setResultsToShow(resultsToShow + 5);
  // };


  // Set 'notFound' to true when a page is not found.
  const handlePageNotFound = () => {
    setNotFound(true);
  };

  const {
    sortByButton,
    reviewButton,
    aptRating,
    heartRating,
    leaveReviewContainer,
    ratingInfo,
    container,
    expand,
    expandOpen,
  } = useStyles();

  // Set the page title based on whether apartment data is loaded.
  useTitle(
    () => (loaded && apt !== undefined ? `${apt.name}` : 'Apartment Reviews'),
    [loaded, apt]
  );

  // Fetch apartment data based on the 'aptId' parameter and handle page not found error.
  useEffect(() => {
    get<ApartmentWithId[]>(`/api/apts/${aptId}`, {
      callback: setAptData,
      errorHandler: handlePageNotFound,
    });
  }, [aptId]);

  // Set the apartment data once it's fetched.
  useEffect(() => {
    setApt(aptData[0]);
  }, [aptData]);

  // Fetch approved reviews for the current apartment.
  useEffect(() => {
    get<ReviewWithId[]>(`/api/review/aptId/${aptId}/APPROVED`, {
      callback: setReviewData,
    });
  }, [aptId, showConfirmation, toggle]);

  // Fetch information about buildings related to the apartment and the landlord's data.
  useEffect(() => {
    get<Apartment[]>(`/api/buildings/${apt?.landlordId}`, {
      callback: setBuildings,
    });
    apt?.landlordId &&
      get<Landlord>(`/api/landlord/${apt?.landlordId}`, {
        callback: setLandlordData,
      });
  }, [apt]);

  // Handle resizing of the window depending on mobile and if it is clicked.
  useEffect(() => {
    const handleResize = () => {
      setIsClicked(window.innerWidth <= 600);
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set the average rating after calculating it from the data.
  useEffect(() => {
    setAveRatingInfo(calculateAveRating(reviewData));
  }, [reviewData]);

  // If all the information is there, then setLoaded to be true.
  useEffect(() => {
    if (
      aptData &&
      apt &&
      reviewData &&
      landlordData &&
      buildings &&
      aveRatingInfo &&
      otherProperties
    ) {
      setLoaded(true);
    }
  }, [aptData, apt, landlordData, buildings, reviewData, aveRatingInfo, otherProperties]);

  // Use setLikedReviews to indicate the number of likes.
  useEffect(() => {
    return subscribeLikes(setLikedReviews);
  }, []);

  useEffect(() => {
    get<CardData[]>(`/api/buildings/all/${apt?.landlordId}`, {
      callback: setOtherproperties,
    });
  }, [apt]);

  const calculateAveRating = (reviews: ReviewWithId[]): RatingInfo[] => {
    const features = ['location', 'safety', 'value', 'maintenance', 'communication', 'conditions'];
    return features.map((feature) => {
      let key = feature as keyof DetailedRating;
      let rating =
        reviews.reduce((sum, review) => sum + review.detailedRatings[key], 0) / reviews.length;

      return { feature, rating };
    });
  };

  const sortReviews = useCallback((arr: ReviewWithId[], property: Fields) => {
    let unsorted = arr;
    return unsorted.sort((r1, r2) => {
      const first = r1?.[property] === undefined ? 0 : r1?.[property];
      const second = r2?.[property] === undefined ? 0 : r2?.[property];
      // @ts-ignore: Object possibly null or undefined
      return first < second ? 1 : -1;
    });
  }, []);

  type Fields = keyof typeof reviewData[0];

  const showToast = (setState: (value: React.SetStateAction<boolean>) => void) => {
    setState(true);
    setTimeout(() => {
      setState(false);
    }, toastTime);
  };

  const showConfirmationToast = () => {
    showToast(setShowConfirmation);
  };

  const showSignInErrorToast = () => {
    showToast(setShowSignInError);
  };

  const likeHelper = (dislike = false) => {
    return async (reviewId: string) => {
      setLikeStatuses((reviews) => ({ ...reviews, [reviewId]: true }));
      try {
        if (!user) {
          let user = await getUser(true);
          setUser(user);
        }
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

  const Modals = landlordData && apt && (
    <>
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        setOpen={setReviewOpen}
        landlordId={apt!.landlordId!}
        onSuccess={showConfirmationToast}
        toastTime={toastTime}
        aptId={apt.id}
        aptName={apt.name}
        user={user}
      />
      <PhotoCarousel
        photos={landlordData.photos}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
      />
    </>
  );

  const Header = (
    // Header section with review count, average rating, and leave review button

    <>
      <Grid container alignItems="center">
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h6">Reviews ({reviewData.length})</Typography>
            {reviewData.length === 0 && (
              <Typography>No reviews available. Be the first to leave one!</Typography>
            )}
          </Grid>

          {reviewData.length > 0 && (
            <Grid item style={{ paddingLeft: '20px' }}>
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

          <Grid item style={{ marginLeft: 'auto' }}>
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
            <Grid item></Grid>
            <Grid item></Grid>
          </Grid>
        </Grid>
      </Grid>

      {reviewData && reviewData.length > 0 && (
        <Grid item xs={12} className={ratingInfo}>
          <ReviewHeader aveRatingInfo={aveRatingInfo} />
        </Grid>
      )}
    </>
  );

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
            <>
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
              <Grid item style={{ marginLeft: 'auto' }}>
                <IconButton
                  color="primary"
                  className={clsx(expand, {
                    [expandOpen]: !isClicked,
                  })}
                  onClick={() => setIsClicked(!isClicked)}
                  aria-expanded={!isClicked}
                  aria-label="show more"
                  size="small"
                  style={{ marginTop: '3px' }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Grid>
            </>
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

        {!isClicked && reviewData && reviewData.length > 0 && (
          <Box m={1} pt={1}>
            <Grid item xs={12} className={ratingInfo}>
              <ReviewHeader aveRatingInfo={aveRatingInfo} />
            </Grid>
          </Box>
        )}
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
  const InfoSection = landlordData && (
    <Grid item xs={12}>
      <AptInfo
        landlord={landlordData.name}
        contact={landlordData.contact}
        address={apt!.address}
        buildings={otherProperties.filter((prop) => prop.buildingData.name !== apt!.name)}
      />
    </Grid>
  );

  return notFound ? (
    // Display Not Found page if the apartment is not found
    <NotFoundPage />
  ) : !loaded ? (
    // Display Not Found page if the apartment is not found
    <LinearProgress />
  ) : (
    // Display Not Found page if the apartment is not found
    <>
      {landlordData && (
        <Container>
          <ApartmentHeader
            averageRating={getAverageRating(reviewData)}
            apartment={apt!}
            numReviews={reviewData.length}
            handleClick={() => setCarouselOpen(true)}
          />
        </Container>
      )}

      <Container className={container}>
        <Grid container spacing={5} justifyContent="center" style={{ marginBottom: '20px' }}>
          <Grid item xs={12}>
            {isMobile ? MobileHeader : Header}
            {!isMobile && <Hidden smUp>{InfoSection}</Hidden>}
            {showConfirmation && (
              <Toast
                isOpen={showConfirmation}
                severity="success"
                message="Review submitted! Your review is awaiting approval from the admin."
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
            <Grid container alignItems="flex-start" justifyContent="center" spacing={3}>
              <Grid item xs={12} sm={8}>
                {!isMobile && (
                  <Grid
                    container
                    spacing={1}
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    style={{ paddingBottom: '10px' }}
                  >
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
                )}
                {/* Rest of your Review List content */}
                <Grid container spacing={3}>
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
              </Grid>

              {/* Second Grid item (InfoSection) */}
              {isMobile && (
                <Hidden smUp>
                  <Grid item xs={12}>
                    {InfoSection}
                  </Grid>
                </Hidden>
              )}
              <Hidden xsDown>
                <Grid item xs={4}>
                  {InfoSection}
                </Grid>
              </Hidden>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      {Modals}
    </>
  );
};

export default ApartmentPage;

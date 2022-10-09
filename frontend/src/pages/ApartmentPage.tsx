import React, { ReactElement, useState, useEffect, useCallback } from 'react';
import { Button, Container, Grid, Hidden, Typography, makeStyles } from '@material-ui/core';
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

export type RatingInfo = {
  feature: string;
  rating: number;
};

const useStyles = makeStyles((theme) => ({
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
}));

const ApartmentPage = (): ReactElement => {
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
  const [user, setUser] = useState<firebase.User | null>(null);
  const [showSignInError, setShowSignInError] = useState(false);
  const [sortBy, setSortBy] = useState<Fields>('date');
  const toastTime = 3500;
  const [notFound, setNotFound] = useState(false);
  const [otherProperties, setOtherproperties] = useState<CardData[]>([]);

  const handlePageNotFound = () => {
    setNotFound(true);
  };
  const { aptRating, heartRating, leaveReviewContainer, ratingInfo, container } = useStyles();
  useTitle(
    () => (loaded && apt !== undefined ? `${apt.name}` : 'Apartment Reviews'),
    [loaded, apt]
  );
  useEffect(() => {
    get<ApartmentWithId[]>(`/apts/${aptId}`, {
      callback: setAptData,
      errorHandler: handlePageNotFound,
    });
  }, [aptId]);

  useEffect(() => {
    setApt(aptData[0]);
  }, [aptData]);

  useEffect(() => {
    get<ReviewWithId[]>(`/review/aptId/${aptId}`, {
      callback: setReviewData,
    });
  }, [aptId, showConfirmation]);
  useEffect(() => {
    get<Apartment[]>(`/buildings/${apt?.landlordId}`, {
      callback: setBuildings,
    });
    get<Landlord>(`/landlord/${apt?.landlordId}`, {
      callback: setLandlordData,
    });
  }, [apt]);

  useEffect(() => {
    setAveRatingInfo(calculateAveRating(reviewData));
  }, [reviewData]);

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

  useEffect(() => {
    return subscribeLikes(setLikedReviews);
  }, []);

  useEffect(() => {
    get<CardData[]>(`/buildings/all/${apt?.landlordId}`, {
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

  // const likeHelper = (dislike = false) => {
  //   return async (reviewId: string) => {
  //     setLikeStatuses((reviews) => ({ ...reviews, [reviewId]: true }));
  //     try {
  //       const user = await getUser(true);
  //       if (!user) {
  //         throw new Error('Failed to login');
  //       }
  //       const defaultLikes = dislike ? 1 : 0;
  //       const offsetLikes = dislike ? -1 : 1;
  //       const token = await user.getIdToken(true);
  //       const endpoint = dislike ? '/remove-like' : '/add-like';
  //       await axios.post(endpoint, { reviewId }, createAuthHeaders(token));
  //       setLikedReviews((reviews) => ({ ...reviews, [reviewId]: !dislike }));
  //       setReviewData((reviews) =>
  //         reviews.map((review) =>
  //           review.id === reviewId
  //             ? { ...review, likes: (review.likes || defaultLikes) + offsetLikes }
  //             : review
  //         )
  //       );
  //     } catch (err) {
  //       throw new Error('Error with liking review');
  //     }
  //     setLikeStatuses((reviews) => ({ ...reviews, [reviewId]: false }));
  //   };
  // };

  // const addLike = likeHelper(false);

  // const removeLike = likeHelper(true);

  const openReviewModal = async () => {
    if (!user) {
      let user = await getUser(true);
      setUser(user);
      if (!user) {
        showSignInErrorToast();
        return;
      }
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
    <>
      <Grid container alignItems="center">
        <Grid container spacing={1} sm={12}>
          <Grid item>
            <Typography variant="h6">Reviews ({reviewData.length})</Typography>
            {reviewData.length === 0 && (
              <Typography>No reviews available. Be the first to leave one!</Typography>
            )}
          </Grid>
          {!!getAverageRating(reviewData) && (
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
                  <Typography>Sort reviews by:</Typography>
                </Grid>
                <Grid item>
                  <DropDown
                    menuItems={[
                      {
                        item: 'Most recent',
                        callback: () => {
                          setSortBy('date');
                        },
                      },
                      {
                        item: 'Most helpful',
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

      {reviewData && reviewData.length > 0 && (
        <Grid item xs={12} className={ratingInfo}>
          <ReviewHeader aveRatingInfo={aveRatingInfo} />
        </Grid>
      )}
    </>
  );

  const InfoSection = landlordData && (
    <Grid item xs={12} sm={4}>
      <AptInfo
        landlord={landlordData.name}
        contact={landlordData.contact}
        address={apt!.address}
        buildings={otherProperties.filter((prop) => prop.buildingData.name !== apt!.name)}
      />
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
          <ApartmentHeader
            averageRating={getAverageRating(reviewData)}
            apartment={apt!}
            numReviews={reviewData.length}
            handleClick={() => setCarouselOpen(true)}
          />
        </Container>
      )}

      <Container className={container}>
        <Grid container spacing={5} justify="center">
          <Grid item xs={12} sm={8}>
            {Header}
            <Hidden smUp>{InfoSection}</Hidden>
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
              {sortReviews(reviewData, sortBy).map((review, index) => (
                <Grid item xs={12} key={index}>
                  <ReviewComponent
                    review={review}
                    liked={likedReviews[review.id]}
                    likeLoading={likeStatuses[review.id]}
                    // addLike={addLike}
                    // removeLike={removeLike}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Hidden xsDown>{InfoSection}</Hidden>
        </Grid>
      </Container>
      {Modals}
    </>
  );
};

export default ApartmentPage;

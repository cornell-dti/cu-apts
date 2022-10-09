import { Button, Container, Grid, Hidden, Typography } from '@material-ui/core';
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
import styles from './LandlordPage.module.scss';
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

export type RatingInfo = {
  feature: string;
  rating: number;
};

const LandlordPage = (): ReactElement => {
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
  const [user, setUser] = useState<firebase.User | null>(null);
  const [showSignInError, setShowSignInError] = useState(false);
  const toastTime = 4750;
  const [sortBy, setSortBy] = useState<Fields>('date');
  const [notFound, setNotFound] = useState(false);
  const handlePageNotFound = () => {
    console.log('Page not found');
    setNotFound(true);
  };

  useTitle(
    () => (loaded && landlordData !== undefined ? `${landlordData.name}` : 'Landlord Reviews'),
    [loaded, landlordData]
  );

  useEffect(() => {
    get<ReviewWithId[]>(`/review/landlordId/${landlordId}`, {
      callback: setReviewData,
    });
  }, [landlordId, showConfirmation]);

  useEffect(() => {
    get<Landlord>(`/landlord/${landlordId}`, {
      callback: setLandlordData,
      errorHandler: handlePageNotFound,
    });
  }, [landlordId]);

  useEffect(() => {
    get<CardData[]>(`/buildings/all/${landlordId}`, {
      callback: setBuildings,
    });
  }, [landlordId]);

  useEffect(() => {
    if (landlordData && buildings && reviewData) {
      setLoaded(true);
    }
  }, [landlordData, buildings, reviewData]);

  useEffect(() => {
    return subscribeLikes(setLikedReviews);
  }, []);

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
        const user = await getUser(true);
        if (!user) {
          throw new Error('Failed to login');
        }
        const defaultLikes = dislike ? 1 : 0;
        const offsetLikes = dislike ? -1 : 1;
        const token = await user.getIdToken(true);
        const endpoint = dislike ? '/remove-like' : '/add-like';
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

  const Header = (
    <>
      <Grid container item spacing={3} justify="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h4">Reviews ({reviewData.length})</Typography>
          {reviewData.length === 0 && (
            <Typography>No reviews available. Be the first to leave one!</Typography>
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
        <Grid item sm={4} md={8}>
          <Grid container spacing={1} justify="flex-end" alignItems="center">
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
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <ReviewHeader aveRatingInfo={aveRatingInfo} />
      </Grid>
    </>
  );

  const InfoSection = landlordData && (
    <Grid item xs={12} sm={4}>
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
          <LandlordHeader
            averageRating={getAverageRating(reviewData)}
            landlord={landlordData}
            numReviews={reviewData.length}
            handleClick={() => setCarouselOpen(true)}
          />
        </Container>
      )}

      <Container className={styles.OuterContainer}>
        <Grid container spacing={5} justify="center">
          <Grid container spacing={3} item xs={12} sm={8}>
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

export default LandlordPage;

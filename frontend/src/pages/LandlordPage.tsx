import { Button, Container, Grid, Hidden, Typography } from '@material-ui/core';
import React, { ReactElement, useState, useEffect } from 'react';
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
import { Landlord, Apartment } from '../../../common/types/db-types';
import Toast from '../components/LeaveReview/Toast';
import LinearProgress from '../components/utils/LinearProgress';
import { Likes, ReviewWithId } from '../../../common/types/db-types';
import axios from 'axios';
import { createAuthHeaders, subscribeLikes, getUser } from '../utils/firebase';

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
  const [buildings, setBuildings] = useState<Apartment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const toastTime = 3500;

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
    });
  }, [landlordId]);

  useEffect(() => {
    get<Apartment[]>(`/buildings/${landlordId}`, {
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

  const showConfirmationToast = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, toastTime);
  };

  const getAverageRating = (reviewData: ReviewWithId[]) =>
    reviewData.reduce(
      (currSum, { overallRating }) => (overallRating > 0 ? currSum + overallRating : currSum),
      0
    ) / reviewData.length;

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

  const addLike = likeHelper(false);

  const removeLike = likeHelper(true);

  const Modals = landlordData && (
    <>
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        setOpen={setReviewOpen}
        landlordId={landlordId}
        onSuccess={showConfirmationToast}
        toastTime={toastTime}
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

        <Grid item>
          <Button
            color="primary"
            variant="contained"
            disableElevation
            onClick={() => setReviewOpen(true)}
          >
            Leave a Review
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <ReviewHeader aveRatingInfo={aveRatingInfo} />
      </Grid>
    </>
  );

  const InfoSection = landlordData && (
    <Grid item xs={12} sm={4}>
      <InfoFeatures {...landlordData} buildings={buildings.map((b) => b.name)} />
    </Grid>
  );

  return !loaded ? (
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
            <Grid container item spacing={3}>
              {reviewData.map((review, index) => (
                <Grid item xs={12} key={index}>
                  <ReviewComponent
                    review={review}
                    liked={likedReviews[review.id]}
                    likeLoading={likeStatuses[review.id]}
                    addLike={addLike}
                    removeLike={removeLike}
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

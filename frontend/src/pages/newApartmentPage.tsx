import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { Button, Container, Grid, Typography, makeStyles } from '@material-ui/core';
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar';
import LocalLaundryServiceIcon from '@material-ui/icons/LocalLaundryService';
import KitchenIcon from '@material-ui/icons/Kitchen';
import WifiIcon from '@material-ui/icons/Wifi';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import PetsIcon from '@material-ui/icons/Pets';
import WeekendIcon from '@material-ui/icons/Weekend';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import {
  ApartmentWithId,
  Landlord,
  LocationTravelTimes,
  ReviewWithId,
} from '../../../common/types/db-types';
import { getAverageRating } from '../utils/average';
import { get } from '../utils/call';
import { colors } from '../colors';
import { CardData } from '../App';
import { createAuthHeaders, getUser, subscribeLikes } from '../utils/firebase';
import { Likes } from '../../../common/types/db-types';
import { sortReviews } from '../utils/sortReviews';
import { RatingInfo } from './ApartmentPage';

import ReviewComponent from '../components/Review/Review';
import ReviewModal from '../components/LeaveReview/ReviewModal';
import PhotoCarousel from '../components/PhotoCarousel/PhotoCarousel';
import usePhotoCarousel from '../components/PhotoCarousel/usePhotoCarousel';
import MapInfo from '../components/Apartment/MapInfo';
import MapModal from '../components/Apartment/MapModal';
import NewApartmentCard from '../components/ApartmentCard/NewApartmentCard';
import RatingSummary from '../components/Apartment/RatingSummary';
import FloorPlanCard from '../components/Apartment/FloorPlanCard';
import Toast from '../components/utils/Toast';
import savedIcon from '../assets/saved-icon-filled.svg';
import unsavedIcon from '../assets/saved-icon-unfilled.svg';

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

type Fields = keyof ReviewWithId;

const AMENITY_ICONS: Record<string, ReactElement> = {
  parking: <DirectionsCarIcon fontSize="small" />,
  heat: <WhatshotIcon fontSize="small" />,
  internet: <WifiIcon fontSize="small" />,
  furnished: <WeekendIcon fontSize="small" />,
  laundry: <LocalLaundryServiceIcon fontSize="small" />,
  kitchen: <KitchenIcon fontSize="small" />,
  'no pets': <PetsIcon fontSize="small" />,
};

const useStyles = makeStyles({
  page: {
    backgroundColor: colors.gray3,
    minHeight: '100vh',
    paddingBottom: 48,
  },
  innerPage: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 16px',
  },

  /* ── Hero ── */
  heroPrimary: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 12,
    display: 'block',
  },
  heroSecondaryCol: {
    display: 'grid',
    gridTemplateRows: '1fr 1fr',
    gap: 6,
  },
  heroSecondary: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 12,
    display: 'block',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    background: colors.gray5,
    display: 'block',
  },
  galleryBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    background: 'rgba(0,0,0,0.72)',
    color: colors.white,
    borderRadius: 999,
    padding: '6px 14px',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    border: 0,
    '&:hover': { background: 'rgba(0,0,0,0.88)' },
  },

  /* ── Apt header row ── */
  aptHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 12,
  },
  aptTitle: {
    fontWeight: 700,
    fontSize: 32,
    lineHeight: 1.15,
    margin: 0,
    marginBottom: 8,
    color: colors.black,
  },
  aptDescription: {
    fontSize: 15,
    color: colors.gray1,
    marginBottom: 0,
    maxWidth: 680,
    lineHeight: 1.55,
  },
  actionBtns: {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
    alignItems: 'flex-start',
    paddingTop: 4,
  },
  saveBtn: {
    background: colors.red1,
    color: colors.white,
    borderRadius: 999,
    padding: '8px 16px',
    fontWeight: 600,
    fontSize: 14,
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    '&:hover': { background: colors.red7 },
  },
  outlineBtn: {
    background: 'transparent',
    border: `1.5px solid ${colors.gray4}`,
    color: colors.black,
    borderRadius: 999,
    padding: '7px 16px',
    fontWeight: 500,
    fontSize: 14,
    textTransform: 'none',
    '&:hover': { background: colors.gray5 },
  },
  outlineBtnRed: {
    background: 'transparent',
    border: `1.5px solid ${colors.red1}`,
    color: colors.red1,
    borderRadius: 999,
    padding: '7px 16px',
    fontWeight: 600,
    fontSize: 14,
    textTransform: 'none',
    '&:hover': { background: colors.red6 },
  },
  bookmarkIcon: {
    width: 16,
    height: 20,
    filter: 'brightness(0) invert(1)',
  },

  /* ── Section headings ── */
  sectionHeading: {
    fontWeight: 700,
    fontSize: 22,
    marginBottom: 12,
    marginTop: 4,
    color: colors.black,
  },

  /* ── Reviews ── */
  reviewsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: colors.gray1,
    fontSize: 15,
    marginBottom: 12,
  },
  showMoreBtn: {
    width: '100%',
    borderRadius: 999,
    border: `1.5px solid ${colors.gray4}`,
    color: colors.gray1,
    fontWeight: 600,
    textTransform: 'none',
    marginTop: 8,
    marginBottom: 8,
    '&:hover': { background: colors.gray5 },
  },

  /* ── Amenities ── */
  amenitiesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  amenityPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: colors.white,
    border: `1px solid ${colors.gray5}`,
    borderRadius: 999,
    padding: '6px 14px',
    fontSize: 14,
    color: colors.black,
  },

  /* ── Landlord card ── */
  landlordCard: {
    background: colors.white,
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 8,
  },
  landlordInfoLabel: {
    fontWeight: 500,
    fontSize: 14,
    color: colors.gray1,
    marginBottom: 4,
  },
  landlordName: {
    fontWeight: 600,
    fontSize: 15,
    color: colors.black,
    marginBottom: 2,
  },
  landlordAddress: {
    fontSize: 14,
    color: colors.gray1,
    marginBottom: 12,
  },
  msgLandlordBtn: {
    background: colors.red1,
    color: colors.white,
    borderRadius: 999,
    width: '100%',
    marginBottom: 8,
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': { background: colors.red7 },
  },
  visitBtn: {
    border: `1.5px solid ${colors.red1}`,
    color: colors.red1,
    borderRadius: 999,
    width: '100%',
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': { background: colors.red6 },
  },

  /* ── Similar properties ── */
  similarRow: {
    display: 'flex',
    gap: 16,
    overflowX: 'auto',
    paddingBottom: 8,
  },
  similarCardWrapper: {
    flexShrink: 0,
  },

  /* ── Loading / padding ── */
  loadingText: {
    padding: 40,
    textAlign: 'center',
    color: colors.gray1,
  },
});

/**
 * NewApartmentPage is the fully-redesigned apartment detail page.
 *
 * Displays: hero image gallery, apartment title/description, rating summary,
 * reviews, floor plans, amenities, location map, landlord info, and similar properties.
 * Matches the Figma design with edge-case handling for missing data.
 */
const NewApartmentPage = ({ user, setUser }: Props): ReactElement => {
  const classes = useStyles();
  const { aptId } = useParams<Record<string, string>>();
  const history = useHistory();

  /* ── State ── */
  const [apt, setApt] = useState<ApartmentWithId | null>(null);
  const [reviewData, setReviewData] = useState<ReviewWithId[]>([]);
  const [landlordData, setLandlordData] = useState<Landlord | null>(null);
  const [otherProperties, setOtherProperties] = useState<CardData[]>([]);
  const [travelTimes, setTravelTimes] = useState<LocationTravelTimes | undefined>(undefined);
  const [isSaved, setIsSaved] = useState(false);
  const sortBy: Fields = 'date';
  const [resultsToShow, setResultsToShow] = useState(5);
  const [likedReviews, setLikedReviews] = useState<Likes>({});
  const [likeStatuses, setLikeStatuses] = useState<Likes>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapToggle, setMapToggle] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSignInError, setShowSignInError] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const toastTime = 3500;

  const {
    carouselPhotos,
    carouselStartIndex,
    carouselOpen,
    showPhotoCarousel,
    closePhotoCarousel,
  } = usePhotoCarousel(apt?.photos ?? []);

  /* ── Data fetching ── */
  useEffect(() => {
    get<ApartmentWithId[]>(`/api/apts/${aptId}`, {
      callback: (data) => setApt(data[0] ?? null),
    });
    get<LocationTravelTimes>(`/api/travel-times-by-id/${aptId}`, {
      callback: setTravelTimes,
    });
  }, [aptId]);

  useEffect(() => {
    const fetchReviews = async () => {
      const [approved, reported] = await Promise.all([
        axios.get<ReviewWithId[]>(`/api/review/aptId/${aptId}/APPROVED`),
        axios.get<ReviewWithId[]>(`/api/review/aptId/${aptId}/REPORTED`),
      ]);
      setReviewData([...approved.data, ...reported.data]);
    };
    fetchReviews();
  }, [aptId, toggle]);

  useEffect(() => {
    if (!apt?.landlordId) return;
    get<Landlord>(`/api/landlord/${apt.landlordId}`, { callback: setLandlordData });
    get<CardData[]>(`/api/buildings/all/${apt.landlordId}`, {
      callback: (data) => setOtherProperties(data.filter((p) => p.buildingData.id !== apt.id)),
    });
  }, [apt]);

  useEffect(() => {
    const checkSaved = async () => {
      if (!user) {
        setIsSaved(false);
        return;
      }
      try {
        const token = await user.getIdToken(true);
        const res = await axios.post(
          '/api/check-saved-apartment',
          { apartmentId: aptId },
          createAuthHeaders(token)
        );
        setIsSaved(res.data.result);
      } catch {
        /* silent */
      }
    };
    checkSaved();
  }, [user, aptId]);

  useEffect(() => subscribeLikes(setLikedReviews), []);

  useEffect(() => {
    getUser(false).then((u) => {
      if (!u) return;
      u.getIdToken(true).then((token) => {
        get<ReviewWithId[]>(
          `/api/review/like/${u.uid}`,
          {
            callback: (reviews) => {
              const liked: Likes = {};
              const statuses: Likes = {};
              reviews.forEach((r) => {
                liked[r.id] = true;
                statuses[r.id] = false;
              });
              setLikedReviews(liked);
              setLikeStatuses(statuses);
            },
          },
          createAuthHeaders(token)
        );
      });
    });
  }, []);

  /* ── Derived ── */
  const averageRating = useMemo(
    () => (reviewData.length ? getAverageRating(reviewData) : 0),
    [reviewData]
  );

  const aveRatingInfo: RatingInfo[] = useMemo(() => {
    if (!reviewData.length) return [];
    return ['location', 'safety', 'maintenance', 'conditions'].map((feature) => ({
      feature,
      rating:
        reviewData.reduce(
          (s, r) => s + r.detailedRatings[feature as keyof typeof r.detailedRatings],
          0
        ) / reviewData.length,
    }));
  }, [reviewData]);

  const heroPhotos = useMemo(() => apt?.photos ?? [], [apt]);

  const heroGridStyle = (count: number): React.CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: count >= 3 ? '5fr 3fr' : count === 2 ? '1fr 1fr' : '1fr',
    gap: 6,
    height: 420,
    position: 'relative',
    marginBottom: 20,
  });

  /* ── Toast helpers ── */
  const showToast = (set: React.Dispatch<React.SetStateAction<boolean>>) => {
    set(true);
    setTimeout(() => set(false), toastTime);
  };

  /* ── Like helpers ── */
  const likeHelper =
    (dislike = false) =>
    async (reviewId: string) => {
      setLikeStatuses((prev) => ({ ...prev, [reviewId]: true }));
      try {
        let u = user;
        if (!u) {
          u = await getUser(true);
          setUser(u);
        }
        if (!u) throw new Error('not logged in');
        const token = await u.getIdToken(true);
        await axios.post(
          dislike ? '/api/remove-like' : '/api/add-like',
          { reviewId },
          createAuthHeaders(token)
        );
        const defaultLikes = dislike ? 1 : 0;
        const offset = dislike ? -1 : 1;
        setLikedReviews((prev) => ({ ...prev, [reviewId]: !dislike }));
        setReviewData((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, likes: (r.likes || defaultLikes) + offset } : r
          )
        );
      } catch {
        /* silent */
      }
      setLikeStatuses((prev) => ({ ...prev, [reviewId]: false }));
    };

  const addLike = likeHelper(false);
  const removeLike = likeHelper(true);

  /* ── Save ── */
  const handleSaveToggle = async () => {
    try {
      let u = user;
      if (!u) {
        u = await getUser(true);
        setUser(u);
      }
      if (!u) throw new Error('not logged in');
      const token = await u.getIdToken(true);
      const endpoint = !isSaved ? '/api/add-saved-apartment' : '/api/remove-saved-apartment';
      await axios.post(endpoint, { apartmentId: aptId }, createAuthHeaders(token));
      setIsSaved((prev) => !prev);
      if (!isSaved) showToast(setShowSaveSuccess);
    } catch {
      /* silent */
    }
  };

  /* ── Review modal ── */
  const openReviewModal = async () => {
    let u = await getUser(true);
    setUser(u);
    if (!u) {
      showToast(setShowSignInError);
      return;
    }
    setReviewOpen(true);
  };

  if (!apt) {
    return (
      <div className={classes.page}>
        <Typography className={classes.loadingText}>Loading...</Typography>
      </div>
    );
  }

  return (
    <div className={classes.page}>
      <Container maxWidth="lg" style={{ paddingTop: 20 }}>
        {/* ─────────── Hero ─────────── */}
        <div style={heroGridStyle(heroPhotos.length)} data-testid="hero-section">
          {/* 0 photos: full-width placeholder */}
          {heroPhotos.length === 0 && (
            <div className={classes.heroPlaceholder} data-testid="hero-image-primary" />
          )}

          {/* 1+ photos: primary image always rendered */}
          {heroPhotos.length >= 1 && (
            <img
              src={heroPhotos[0]}
              alt="Apartment main"
              className={classes.heroPrimary}
              data-testid="hero-image-primary"
            />
          )}

          {/* 2 photos: second image fills right column equally */}
          {heroPhotos.length === 2 && (
            <img
              src={heroPhotos[1]}
              alt="Apartment secondary"
              className={classes.heroPrimary}
              data-testid="hero-image-secondary-top"
            />
          )}

          {/* 3+ photos: two smaller images stacked in right column */}
          {heroPhotos.length >= 3 && (
            <div className={classes.heroSecondaryCol}>
              <img
                src={heroPhotos[1]}
                alt="Apartment secondary"
                className={classes.heroSecondary}
                data-testid="hero-image-secondary-top"
              />
              <img
                src={heroPhotos[2]}
                alt="Apartment tertiary"
                className={classes.heroSecondary}
                data-testid="hero-image-secondary-bottom"
              />
            </div>
          )}

          <button
            type="button"
            className={classes.galleryBtn}
            data-testid="gallery-button"
            onClick={() => showPhotoCarousel()}
          >
            Gallery
          </button>
        </div>

        {/* ─────────── Two-column body ─────────── */}
        <Grid container spacing={3}>
          {/* Left column */}
          <Grid item xs={12} md={7}>
            {/* Apt header */}
            <div className={classes.aptHeaderRow} data-testid="apt-header-section">
              <Typography component="h1" className={classes.aptTitle}>
                {apt.name}
              </Typography>
              <div className={classes.actionBtns}>
                <Button
                  className={classes.saveBtn}
                  onClick={handleSaveToggle}
                  disableElevation
                  disableRipple
                >
                  <img
                    src={isSaved ? savedIcon : unsavedIcon}
                    alt="save"
                    className={classes.bookmarkIcon}
                  />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button className={classes.outlineBtn} disableElevation disableRipple>
                  Share
                </Button>
                <Button
                  className={classes.outlineBtn}
                  disableElevation
                  disableRipple
                  onClick={() => history.push(`/compare?aptIds=${aptId}`)}
                >
                  Compare
                </Button>
              </div>
            </div>
            <Typography className={classes.aptDescription} style={{ marginBottom: 16 }}>
              {apt.description}
            </Typography>

            {/* Rating summary */}
            <RatingSummary
              aveRatingInfo={aveRatingInfo}
              averageRating={averageRating}
              numReviews={reviewData.length}
            />

            {/* Reviews */}
            <div style={{ marginBottom: 24 }}>
              <div className={classes.reviewsHeader}>
                <Typography className={classes.sectionHeading}>Reviews</Typography>
                <Button
                  className={classes.outlineBtnRed}
                  onClick={openReviewModal}
                  disableElevation
                  disableRipple
                >
                  Leave a review
                </Button>
              </div>

              {reviewData.length === 0 ? (
                <Typography className={classes.emptyText}>No reviews yet</Typography>
              ) : (
                <>
                  {sortReviews([...reviewData], sortBy)
                    .slice(0, resultsToShow)
                    .map((review) => (
                      <ReviewComponent
                        key={review.id}
                        showLabel={false}
                        review={review}
                        liked={likedReviews[review.id]}
                        likeLoading={likeStatuses[review.id]}
                        addLike={addLike}
                        removeLike={removeLike}
                        setToggle={setToggle}
                        triggerEditToast={() => showToast(setShowEditSuccess)}
                        triggerDeleteToast={() => showToast(setShowDeleteSuccess)}
                        triggerReportToast={() => showToast(setShowReportSuccess)}
                        triggerPhotoCarousel={showPhotoCarousel}
                        user={user}
                        setUser={setUser}
                      />
                    ))}
                  {resultsToShow < reviewData.length && (
                    <Button
                      className={classes.showMoreBtn}
                      onClick={() => setResultsToShow((n) => n + 5)}
                      disableElevation
                      disableRipple
                    >
                      Show more
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Floor Plan */}
            <div style={{ marginBottom: 24 }} data-testid="floor-plan-section">
              <Typography className={classes.sectionHeading}>Floor Plan</Typography>
              {(apt.floorplans ?? []).length === 0 ? (
                <Typography className={classes.emptyText}>No floor plan data available</Typography>
              ) : (
                (apt.floorplans ?? []).map((plan, i) => <FloorPlanCard key={i} plan={plan} />)
              )}
            </div>

            {/* Amenities */}
            <div style={{ marginBottom: 24 }} data-testid="amenities-section">
              <Typography className={classes.sectionHeading}>Amenities</Typography>
              {(apt.amenities ?? []).length === 0 ? (
                <Typography className={classes.emptyText}>No available amenities</Typography>
              ) : (
                <div className={classes.amenitiesGrid}>
                  {(apt.amenities ?? []).map((amenity) => (
                    <div key={amenity} className={classes.amenityPill}>
                      {AMENITY_ICONS[amenity.toLowerCase()] ?? null}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Grid>

          {/* Right column */}
          <Grid item xs={12} md={5}>
            {/* Location */}
            <div data-testid="location-section" style={{ marginBottom: 8 }}>
              <Typography className={classes.sectionHeading}>Location</Typography>
              <MapInfo
                address={apt.address}
                latitude={apt.latitude}
                longitude={apt.longitude}
                travelTimes={travelTimes}
                handleClick={() => setMapOpen(true)}
                mapToggle={mapToggle}
                isMobile={false}
              />
            </div>

            {/* Landlord */}
            {landlordData && (
              <div data-testid="landlord-section">
                <Typography className={classes.sectionHeading}>Landlord</Typography>
                <div className={classes.landlordCard}>
                  <Typography className={classes.landlordInfoLabel}>
                    Landlord information
                  </Typography>
                  <Typography className={classes.landlordName}>{landlordData.name}</Typography>
                  {landlordData.address && (
                    <Typography className={classes.landlordAddress}>
                      Address: {landlordData.address}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    className={classes.msgLandlordBtn}
                    href={`/landlord/${apt.landlordId}`}
                    disableElevation
                  >
                    Message Landlord
                  </Button>
                  {landlordData.contact && (
                    <Button
                      variant="outlined"
                      className={classes.visitBtn}
                      href={landlordData.contact}
                      target="_blank"
                      rel="noreferrer"
                      disableElevation
                    >
                      Visit Property Website
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Grid>
        </Grid>

        {/* ─────────── Other Similar Properties ─────────── */}
        {otherProperties.length > 0 && (
          <div style={{ marginTop: 24 }} data-testid="similar-properties-section">
            <Typography className={classes.sectionHeading}>Other Similar Properties</Typography>
            <div className={classes.similarRow}>
              {otherProperties.map(({ buildingData, numReviews, avgRating }) => (
                <div key={buildingData.id} className={classes.similarCardWrapper}>
                  <NewApartmentCard
                    buildingData={buildingData}
                    numReviews={numReviews}
                    avgRating={avgRating ?? 0}
                    user={user}
                    setUser={setUser}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* ─────────── Modals ─────────── */}
      <MapModal
        aptName={apt.name}
        open={mapOpen}
        onClose={() => {
          setMapOpen(false);
          setMapToggle((p) => !p);
        }}
        address={apt.address}
        longitude={apt.longitude}
        latitude={apt.latitude}
        travelTimes={travelTimes}
        isMobile={false}
      />

      {apt.landlordId && (
        <ReviewModal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          setOpen={setReviewOpen}
          landlordId={apt.landlordId}
          onSuccess={() => showToast(setShowConfirmation)}
          toastTime={toastTime}
          aptId={apt.id}
          aptName={apt.name}
          user={user}
        />
      )}

      <PhotoCarousel
        photos={carouselPhotos}
        open={carouselOpen}
        startIndex={carouselStartIndex}
        onClose={closePhotoCarousel}
      />

      {/* ─────────── Toasts ─────────── */}
      <Toast
        isOpen={showConfirmation}
        severity="success"
        message="Review submitted! Awaiting admin approval."
        time={toastTime}
      />
      <Toast
        isOpen={showSignInError}
        severity="error"
        message="Please sign in with a Cornell email."
        time={toastTime}
      />
      <Toast
        isOpen={showEditSuccess}
        severity="success"
        message="Review edited successfully."
        time={toastTime}
      />
      <Toast
        isOpen={showDeleteSuccess}
        severity="success"
        message="Review deleted successfully."
        time={toastTime}
      />
      <Toast
        isOpen={showReportSuccess}
        severity="success"
        message="Review reported."
        time={toastTime}
      />
      <Toast
        isOpen={showSaveSuccess}
        severity="success"
        message={`You have bookmarked ${apt.name}. View your bookmarks `}
        time={toastTime}
        linkMessage="here"
        link="/bookmarks"
      />
    </div>
  );
};

export default NewApartmentPage;

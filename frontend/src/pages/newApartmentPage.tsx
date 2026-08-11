import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { Button, Container, Grid, Typography, makeStyles, useMediaQuery } from '@material-ui/core';
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
  ApartmentFloorPlan,
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
import NotFoundPage from './NotFoundPage';

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
import DropDownWithLabel from '../components/utils/DropDownWithLabel';
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

const useStyles = makeStyles((theme) => ({
  page: {
    backgroundColor: colors.gray3,
    minHeight: '100vh',
    paddingBottom: 48,
    [theme.breakpoints.down('xs')]: {
      paddingBottom: 32,
    },
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
    // Below sm the title and the three action buttons cannot share a row
    // without the buttons collapsing to unreadable widths.
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      gap: 12,
    },
  },
  aptTitle: {
    fontWeight: 700,
    fontSize: 32,
    lineHeight: 1.15,
    margin: 0,
    marginBottom: 8,
    color: colors.black,
    [theme.breakpoints.down('xs')]: {
      fontSize: 24,
      marginBottom: 6,
    },
  },
  aptDescription: {
    fontSize: 15,
    color: colors.gray1,
    marginBottom: 0,
    maxWidth: 680,
    lineHeight: 1.55,
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
  actionBtns: {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
    alignItems: 'flex-start',
    paddingTop: 4,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      paddingTop: 0,
      flexWrap: 'wrap',
      '& > *': { flex: '1 1 auto' },
    },
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
    [theme.breakpoints.down('xs')]: {
      fontSize: 19,
      marginBottom: 10,
    },
  },

  /* ── Reviews ── */
  reviewsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    // The sort dropdown and "Leave a review" button wrap under the heading
    // rather than squeezing onto one line.
    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap',
      gap: 8,
    },
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
    [theme.breakpoints.down('xs')]: {
      padding: '14px 16px',
    },
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
}));

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
  const isMobile = useMediaQuery('(max-width:600px)');

  /* ── State ── */
  const [apt, setApt] = useState<ApartmentWithId | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewWithId[]>([]);
  const [reviewsFailed, setReviewsFailed] = useState(false);
  const [landlordData, setLandlordData] = useState<Landlord | null>(null);
  const [otherProperties, setOtherProperties] = useState<CardData[]>([]);
  const [travelTimes, setTravelTimes] = useState<LocationTravelTimes | undefined>(undefined);
  const [isSaved, setIsSaved] = useState(false);
  const [sortBy, setSortBy] = useState<Fields>('date');
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
  // Every fetch below is guarded by a `stale` flag so a slow response for a
  // previously viewed apartment cannot overwrite the current one. Navigating
  // between apartments reuses this component instance (only `aptId` changes),
  // so state must also be cleared up front rather than left showing the
  // previous apartment while the new one loads.
  useEffect(() => {
    let stale = false;

    setApt(null);
    setNotFound(false);
    setTravelTimes(undefined);
    setLandlordData(null);
    setOtherProperties([]);
    setReviewData([]);
    setResultsToShow(5);

    get<ApartmentWithId[]>(`/api/apts/${aptId}`, {
      callback: (data) => {
        if (stale) return;
        const found = data[0];
        if (found) {
          setApt(found);
        } else {
          setNotFound(true);
        }
      },
      errorHandler: () => {
        if (!stale) setNotFound(true);
      },
    });
    get<LocationTravelTimes>(`/api/travel-times-by-id/${aptId}`, {
      callback: (data) => {
        if (!stale) setTravelTimes(data);
      },
      // Travel times are supplementary; a failure here leaves the map section
      // empty rather than failing the whole page.
      errorHandler: () => undefined,
    });

    return () => {
      stale = true;
    };
  }, [aptId]);

  useEffect(() => {
    let stale = false;
    const fetchReviews = async () => {
      try {
        const [approved, reported] = await Promise.all([
          axios.get<ReviewWithId[]>(`/api/review/aptId/${aptId}/APPROVED`),
          axios.get<ReviewWithId[]>(`/api/review/aptId/${aptId}/REPORTED`),
        ]);
        if (!stale) {
          setReviewData([...approved.data, ...reported.data]);
          setReviewsFailed(false);
        }
      } catch (err) {
        // Distinguish "this apartment has no reviews" from "we could not load
        // them", so the empty state does not misreport a server error.
        console.error(err);
        if (!stale) {
          setReviewData([]);
          setReviewsFailed(true);
        }
      }
    };
    fetchReviews();
    return () => {
      stale = true;
    };
  }, [aptId, toggle]);

  useEffect(() => {
    if (!apt?.landlordId) return undefined;
    let stale = false;
    get<Landlord>(`/api/landlord/${apt.landlordId}`, {
      callback: (data) => {
        if (!stale) setLandlordData(data);
      },
      errorHandler: () => undefined,
    });
    get<CardData[]>(`/api/buildings/all/${apt.landlordId}`, {
      callback: (data) => {
        if (!stale) setOtherProperties(data.filter((p) => p.buildingData.id !== apt.id));
      },
      errorHandler: () => undefined,
    });
    return () => {
      stale = true;
    };
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
    // detailedRatings is optional-chained because a malformed review missing
    // the field would otherwise make the whole page throw, not just this panel.
    return (['location', 'safety', 'maintenance', 'conditions'] as const).map((feature) => ({
      feature,
      rating:
        reviewData.reduce((s, r) => s + (r.detailedRatings?.[feature] ?? 0), 0) / reviewData.length,
    }));
  }, [reviewData]);

  const heroPhotos = useMemo(() => apt?.photos ?? [], [apt]);

  /**
   * Floor plans to display, falling back to the apartment's room types.
   *
   * @remarks
   * No current data source populates `floorplans`: the room data collected by
   * the PM team and the agency scrapers both supply bed/bath/price only. Rather
   * than show an empty section, derive rows from `roomTypes` when no true floor
   * plans exist. Square footage, unit counts, and imagery are simply absent from
   * derived rows, and FloorPlanCard omits those lines. Real floor plans always
   * take precedence once they exist.
   */
  const floorPlans: ApartmentFloorPlan[] = useMemo(() => {
    const existing = apt?.floorplans ?? [];
    if (existing.length > 0) return [...existing];
    return (apt?.roomTypes ?? []).map((roomType) => ({
      bedrooms: roomType.beds,
      bathrooms: roomType.baths,
      costPerPerson: roomType.price,
    }));
  }, [apt]);

  const landlordContactUrl = useMemo(() => {
    const contact = landlordData?.contact;
    return contact && /^https?:\/\//i.test(contact) ? contact : null;
  }, [landlordData]);

  /**
   * heroGridStyle – Builds the hero photo grid layout for a given photo count.
   *
   * @remarks
   * On narrow screens the secondary column is dropped entirely: at phone width
   * the 3fr column renders thumbnails too small to be useful, and the full
   * 420px height consumes most of the viewport before any content is visible.
   *
   * @param {number} count – Number of photos available for the apartment.
   *
   * @return {React.CSSProperties} – Inline grid styles for the hero container.
   */
  const heroGridStyle = (count: number): React.CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: isMobile || count < 2 ? '1fr' : count >= 3 ? '5fr 3fr' : '1fr 1fr',
    gap: 6,
    height: isMobile ? 240 : 420,
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

  if (notFound) {
    return <NotFoundPage />;
  }

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

          {/* 2 photos: second image fills right column equally.
              Suppressed on mobile, where the grid collapses to one column and
              the extra images are reachable through the gallery instead. */}
          {!isMobile && heroPhotos.length === 2 && (
            <img
              src={heroPhotos[1]}
              alt="Apartment secondary"
              className={classes.heroPrimary}
              data-testid="hero-image-secondary-top"
            />
          )}

          {/* 3+ photos: two smaller images stacked in right column */}
          {!isMobile && heroPhotos.length >= 3 && (
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

          {/* Hidden with no photos: the carousel would open on an empty list. */}
          {heroPhotos.length > 0 && (
            <button
              type="button"
              className={classes.galleryBtn}
              data-testid="gallery-button"
              onClick={() => showPhotoCarousel()}
            >
              Gallery
            </button>
          )}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DropDownWithLabel
                    label="Sort by"
                    menuItems={[
                      { item: 'Recent', callback: () => setSortBy('date') },
                      { item: 'Helpful', callback: () => setSortBy('likes') },
                    ]}
                    isMobile={isMobile}
                  />
                  {/* A review is filed against a landlord, so an apartment with
                      no landlord on record cannot accept one. */}
                  <Button
                    className={classes.outlineBtnRed}
                    onClick={openReviewModal}
                    disabled={!apt.landlordId}
                    disableElevation
                    disableRipple
                  >
                    Leave a review
                  </Button>
                </div>
              </div>

              {reviewData.length === 0 ? (
                <Typography className={classes.emptyText}>
                  {reviewsFailed ? 'Could not load reviews. Please try again.' : 'No reviews yet'}
                </Typography>
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
              {floorPlans.length === 0 ? (
                <Typography className={classes.emptyText}>No floor plan data available</Typography>
              ) : (
                floorPlans.map((plan, i) => <FloorPlanCard key={i} plan={plan} />)
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
                isMobile={isMobile}
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
                  {/* `contact` holds an email address for some landlords and a
                      website for others. Only link it when it is an absolute
                      URL; an email address here would resolve as a relative
                      path and navigate within the app. */}
                  {landlordContactUrl && (
                    <Button
                      variant="outlined"
                      className={classes.visitBtn}
                      href={landlordContactUrl}
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
        isMobile={isMobile}
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
      {/* Toast latches its `isOpen` prop into state on mount and never syncs
          it again, so each toast must be mounted only while its flag is set.
          Rendering them unconditionally makes them permanently invisible. */}
      {showConfirmation && (
        <Toast
          isOpen={showConfirmation}
          severity="success"
          message="Review submitted! Awaiting admin approval."
          time={toastTime}
        />
      )}
      {showSignInError && (
        <Toast
          isOpen={showSignInError}
          severity="error"
          message="Please sign in with a Cornell email."
          time={toastTime}
        />
      )}
      {showEditSuccess && (
        <Toast
          isOpen={showEditSuccess}
          severity="success"
          message="Review edited successfully."
          time={toastTime}
        />
      )}
      {showDeleteSuccess && (
        <Toast
          isOpen={showDeleteSuccess}
          severity="success"
          message="Review deleted successfully."
          time={toastTime}
        />
      )}
      {showReportSuccess && (
        <Toast
          isOpen={showReportSuccess}
          severity="success"
          message="Review reported."
          time={toastTime}
        />
      )}
      {showSaveSuccess && (
        <Toast
          isOpen={showSaveSuccess}
          severity="success"
          message={`You have bookmarked ${apt.name}. View your bookmarks `}
          time={toastTime}
          linkMessage="here"
          link="/bookmarks"
        />
      )}
    </div>
  );
};

export default NewApartmentPage;

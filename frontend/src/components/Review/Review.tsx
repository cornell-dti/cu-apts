import React, { useEffect, ReactElement, useState, useCallback } from 'react';
import {
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
  useMediaQuery,
} from '@material-ui/core';
import HeartRating from '../utils/HeartRating';
import { format } from 'date-fns';
import { makeStyles } from '@material-ui/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HelpfulIcon from '../../assets/helpful-icon.svg';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogContentText,
} from '@material-ui/core';
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
import ReviewModal from '../LeaveReview/ReviewModal';
import { Link as RouterLink } from 'react-router-dom';
import { createAuthHeaders, getUser } from '../../utils/firebase';
import { get } from '../../utils/call';
import getPriceRange from '../../utils/priceRange';
import OptionMenu from '../utils/OptionMenu';
import { ReactComponent as BedIcon } from '../../assets/bed-icon.svg';
import { ReactComponent as MoneyIcon } from '../../assets/money-icon.svg';
import { exists } from 'fs';

type Props = {
  readonly review: ReviewWithId;
  readonly liked: boolean;
  readonly likeLoading: boolean;
  readonly addLike: (reviewId: string) => Promise<void>;
  readonly removeLike: (reviewId: string) => Promise<void>;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
  readonly triggerEditToast: () => void;
  readonly triggerDeleteToast: () => void;
  readonly triggerReportToast: () => void;
  readonly triggerPhotoCarousel: (photos: readonly string[], startIndex: number) => void;
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
  readonly showLabel: boolean;
};

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
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
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
    display: 'flex',
    flexDirection: 'row',
    gap: '1vw',
    paddingTop: '2%',
    paddingLeft: '0.6%',
    overflowY: 'hidden',
    paddingRight: '0.6%',
    paddingBottom: '2%',
  },
  bedroomsPrice: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
  },
  bedroomsWithIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  priceWithIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  bedroomsPriceText: {
    fontWeight: 600,
  },
  bedPriceIcon: {
    width: '21px',
    height: '21px',
  },
  helpfulIcon: {
    width: '21px',
    height: '21px',
    marginRight: '5px',
  },
  submitButton: {
    borderRadius: '30px',
    minWidth: '80px',
    color: colors.white,
    backgroundColor: colors.red1,
    '&:hover': {
      backgroundColor: colors.red7,
    },
  },
  hollowRedButton: {
    minWidth: '80px',
    height: '35px',
    borderRadius: '30px',
    border: '2px solid',
    borderColor: `${colors.red1} !important`,
    backgroundColor: 'transparent',
    color: colors.red1,
    '&:hover': {
      backgroundColor: colors.red5,
    },
  },
  deleteDialogTitle: {
    padding: '20px 24px 0 24px',
    '& .MuiTypography-h6': {
      color: colors.black,
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: '28px',
    },
  },
  deleteDialogDesc: {
    color: colors.black,
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
  },
  deleteDialogActions: {
    padding: '0 20px 24px',
  },
}));

/**
 * ReviewComponent is a React component that displays a review card with various functionalities
 * such as liking, editing, deleting, and reporting a review. It also shows detailed information
 * about the review, including ratings, text, and associated property or landlord details.
 *
 * @component
 * @param {Props} props - The props for the ReviewComponent.
 * @param {ReviewWithId} props.review - The review data to display.
 * @param {boolean} props.liked - Indicates if the current user has liked the review.
 * @param {boolean} props.likeLoading - Indicates if the like action is in progress.
 * @param {function} props.addLike - Function to add a like to the review.
 * @param {function} props.removeLike - Function to remove a like from the review.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setToggle - Function to toggle a state.
 * @param {function} props.triggerEditToast - function to trigger a toast notification on edit.
 * @param {function} props.triggerDeleteToast - function to trigger a toast notification on delete.
 * @param {function} props.triggerReportToast - function to trigger a toast notification on report.
 * @param {firebase.User | null} props.user - The current logged-in user.
 * @param {React.Dispatch<React.SetStateAction<firebase.User | null>>} props.setUser - Function to set the current user.
 * @param {boolean} props.showLabel - Indicates if the property or landlord label should be shown.
 * @returns {ReactElement} The rendered ReviewComponent.
 */
const ReviewComponent = ({
  review,
  liked,
  likeLoading,
  addLike,
  removeLike,
  setToggle,
  triggerEditToast,
  triggerDeleteToast,
  triggerReportToast,
  triggerPhotoCarousel,
  user,
  setUser,
  showLabel,
}: Props): ReactElement => {
  const formattedDate = format(new Date(review.date), 'MMM dd, yyyy').toUpperCase();
  const shortenedDate = format(new Date(review.date), 'MMM yyyy').toUpperCase();
  const {
    root,
    expand,
    expandOpen,
    dateText,
    button,
    photoStyle,
    photoRowStyle,
    bottomborder,
    reviewHeader,
    apartmentIndicator,
    bedroomsPrice,
    bedroomsWithIcon,
    priceWithIcon,
    bedPriceIcon,
    bedroomsPriceText,
    helpfulIcon,
    deleteDialogTitle,
    deleteDialogDesc,
    deleteDialogActions,
    submitButton,
    hollowRedButton,
  } = useStyles();
  const [expanded, setExpanded] = useState(false);
  const [expandedText, setExpandedText] = useState(false);
  const [apt, setApt] = useState<ApartmentWithId[]>([]);
  const [landlordData, setLandlordData] = useState<Landlord>();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const isSmallScreen = useMediaQuery('(max-width:391px)');
  const toastTime = 3500;

  const updateReviewData = () => {
    get<ReviewWithId>(`/api/review-by-id/${review.id}`, {
      callback: (updatedReview: ReviewWithId) => {
        // Update the review state with the new data
        review = updatedReview;
        setToggle((cur) => !cur);
      },
    });
  };
  const onSuccessfulEdit = () => {
    updateReviewData();
    if (triggerEditToast) triggerEditToast();
  };
  const deleteModal = () => {
    return (
      <Dialog
        open={deleteModalOpen}
        onClose={() => {
          handleDeleteModalClose(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ style: { borderRadius: '12px' } }}
      >
        <DialogTitle className={deleteDialogTitle} id="alert-dialog-title">
          Delete this review?
        </DialogTitle>
        <DialogContent>
          <DialogContentText className={deleteDialogDesc} id="alert-dialog-description">
            You will not be able to recover deleted reviews.
          </DialogContentText>
        </DialogContent>
        <DialogActions className={deleteDialogActions}>
          <Button
            className={hollowRedButton}
            onClick={() => {
              handleDeleteModalClose(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className={submitButton}
            onClick={() => {
              handleDeleteModalClose(true);
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const reportModal = () => {
    return (
      <Dialog
        open={reportModalOpen}
        onClose={() => {
          handleReportModalClose(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ style: { borderRadius: '12px' } }}
      >
        <DialogTitle className={deleteDialogTitle} id="alert-dialog-title">
          Report this review?
        </DialogTitle>
        <DialogContent>
          <DialogContentText className={deleteDialogDesc} id="alert-dialog-description">
            This review will be sent to admins for review.
          </DialogContentText>
        </DialogContent>
        <DialogActions className={deleteDialogActions}>
          <Button
            className={hollowRedButton}
            onClick={() => {
              handleReportModalClose(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className={submitButton}
            onClick={() => {
              handleReportModalClose(true);
            }}
            autoFocus
          >
            Report
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const Modals = (
    <>
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        setOpen={setReviewOpen}
        landlordId={review.landlordId}
        onSuccess={onSuccessfulEdit}
        toastTime={toastTime}
        aptId={review.aptId ?? ''}
        aptName={apt?.[0]?.name ?? ''}
        user={user}
        initialReview={review}
      />
      {deleteModal()}
      {reportModal()}
    </>
  );
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  //Retrieving apartment data
  useEffect(() => {
    if (review.aptId !== null) {
      get<ApartmentWithId[]>(`/api/apts/${review.aptId}`, {
        callback: setApt,
      });
    }
  }, [review]);

  const getRatingInfo = (ratings: DetailedRating): RatingInfo[] => {
    return [
      { feature: 'Location', rating: ratings.location },
      { feature: 'Safety', rating: ratings.safety },
      { feature: 'Maintenance', rating: ratings.maintenance },
      { feature: 'Conditions', rating: ratings.conditions },
    ];
  };

  // Open review modal
  const openReviewModal = async () => {
    if (!user) {
      return;
    }
    setReviewOpen(true);
  };

  const openDeleteModal = async () => {
    if (!user) {
      return;
    }
    setDeleteModalOpen(true);
  };

  const handleReportModalOpen = async () => {
    if (user) {
      setReportModalOpen(true);
    } else {
      let user = await getUser(true);
      setUser(user);
    }
  };

  /**
   * handleReportModalClose - Handles the closing of the report modal and processes the report if confirmed.
   *
   * @remarks
   * If report is true, updates the review status to 'REPORTED' in the backend. Requires user authentication
   * and handles error cases like missing review ID. Triggers a toast notification on successful report.
   *
   * @param {Boolean} report - Whether the user confirmed reporting the review
   * @return {Promise<void>} - A promise that resolves when the report handling is complete
   */
  const handleReportModalClose = async (report: Boolean) => {
    try {
      if (report) {
        if (!review.id) {
          console.error('No review ID found');
          return;
        }

        const endpoint = `/api/update-review-status/${review.id}/REPORTED`;

        if (user) {
          const token = await user.getIdToken(true);
          const headers = createAuthHeaders(token);

          await axios.put(endpoint, {}, headers);
          setToggle((cur) => !cur);
        } else {
          let user = await getUser(true);
          setUser(user);
        }
        if (triggerReportToast) triggerReportToast();
      }
    } catch (error: any) {
      console.error('Error reporting review:', error.response?.data || error.message);
    } finally {
      setReportModalOpen(false);
    }
  };

  /**
   * likeHandler - Adds a like to a comment after clicking the like button
   *
   * @remarks A user is not allowed to like their own comment, hence the extra identification in
   * the method to ensure the comment wasn't created by the current user.
   *
   * @param {Number} id - Id of the comment who's like counter is being added to.
   */
  const likeHandler = async (id: string) => {
    if (user) {
      if (!(review.userId != null && review.userId == user.uid)) {
        (liked ? removeLike : addLike)(id);
      }
    } else {
      let user = await getUser(true);
      setUser(user);
    }
  };

  const handleDeleteModalClose = async (deleteit: Boolean) => {
    if (deleteit) {
      const endpoint = `/api/update-review-status/${review.id}/DELETED`;
      if (user) {
        const token = await user.getIdToken(true);
        await axios.put(endpoint, {}, createAuthHeaders(token));
        sessionStorage.setItem('showDeleteSuccessToast', 'true');
        setToggle((curr) => !curr);
      } else {
        let user = await getUser(true);
        setUser(user);
      }
    }
    setDeleteModalOpen(false);
  };

  const handleLinkClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

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
  const editDeleteButtons = () => {
    return (
      <Grid item>
        <OptionMenu
          options={[
            {
              icon: <EditIcon fontSize="small" />,
              text: 'Edit Review',
              onClick: openReviewModal,
            },
            {
              icon: <DeleteIcon fontSize="small" />,
              text: 'Delete Review',
              onClick: openDeleteModal,
            },
          ]}
        />
      </Grid>
    );
  };
  const bedroomsPriceLabel = (rowNum: number) => {
    return (
      <Grid item className={bedroomsPrice} style={isMobile ? { width: '100%' } : {}}>
        {review.bedrooms > 0 && (
          <div
            className={bedroomsWithIcon}
            style={rowNum === 2 || isMobile ? {} : { marginLeft: '30px' }}
          >
            <BedIcon className={bedPriceIcon} />
            <Typography className={bedroomsPriceText}>
              {review.bedrooms}{' '}
              {review.bedrooms === 1
                ? isSmallScreen
                  ? 'Bed'
                  : 'Bedroom'
                : isSmallScreen
                ? 'Beds'
                : 'Bedrooms'}
            </Typography>
          </div>
        )}
        {review.price > 0 && (
          <div
            className={priceWithIcon}
            style={rowNum === 2 || isMobile ? {} : { marginLeft: '30px' }}
          >
            <MoneyIcon className={bedPriceIcon} />
            <Typography className={bedroomsPriceText}>
              {' '}
              {getPriceRange(review.price) || 0}
            </Typography>
          </div>
        )}
      </Grid>
    );
  };
  const reportAbuseButton = () => {
    return (
      <Grid item>
        <Button onClick={handleReportModalOpen} className={button} size="small">
          Report Abuse
        </Button>
      </Grid>
    );
  };
  return (
    <Card className={root} variant="outlined">
      <Box minHeight="200px">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container justifyContent="space-between">
              <Grid item container justifyContent="space-between" className={bottomborder}>
                <Grid container item spacing={1} className={reviewHeader}>
                  <Grid item>
                    <HeartRating value={review.overallRating} readOnly />
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
                  {useMediaQuery(
                    user && review.userId && user.uid === review.userId
                      ? '(min-width:1410px)'
                      : '(min-width:1075px)'
                  ) && bedroomsPriceLabel(1)}
                  <Grid item style={{ marginLeft: 'auto' }}>
                    <Typography className={dateText}>
                      {isSmallScreen ? shortenedDate : formattedDate}
                    </Typography>
                  </Grid>
                  {user &&
                    review.userId &&
                    user.uid === review.userId &&
                    review.status !== 'REPORTED' &&
                    editDeleteButtons()}
                </Grid>
                {useMediaQuery(
                  user && review.userId && user.uid === review.userId
                    ? '(max-width:1409px)'
                    : '(max-width:1074px)'
                ) && bedroomsPriceLabel(2)}
                <Grid item>
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                      <ReviewHeader aveRatingInfo={getRatingInfo(review.detailedRatings)} />
                    </CardContent>
                  </Collapse>
                </Grid>
              </Grid>

              <Grid>
                <Typography className={apartmentIndicator}>{propertyLandlordLabel()}</Typography>
              </Grid>

              <Grid item container alignContent="center">
                <Typography>
                  {expandedText ? review.reviewText : review.reviewText.substring(0, 500)}
                  {!expandedText && review.reviewText.length > 500 && '...'}
                  {review.reviewText.length > 500 ? (
                    <Button className={button} onClick={() => setExpandedText(!expandedText)}>
                      {expandedText ? 'Read Less' : 'Read More'}
                    </Button>
                  ) : null}
                </Typography>
              </Grid>
              {review.photos.length > 0 && (
                <Grid container>
                  <Grid item className={photoRowStyle}>
                    {review.photos.map((photo, i) => {
                      return (
                        <CardMedia
                          component="img"
                          alt="Apt image"
                          image={photo}
                          title="Apt image"
                          className={photoStyle}
                          onClick={() => triggerPhotoCarousel(review.photos, i)}
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
        <Grid item container justifyContent="space-between">
          <Grid item>
            <Button
              onClick={() => likeHandler(review.id)}
              className={button}
              size="small"
              disabled={likeLoading}
              style={liked ? { color: colors.red1 } : { color: colors.gray1 }}
            >
              <img
                src={HelpfulIcon}
                alt="Helpful icon"
                className={helpfulIcon}
                loading="lazy"
                style={liked ? {} : { filter: 'grayscale(100%)' }}
              />
              {`Helpful (${review.likes})`}
            </Button>
          </Grid>
          {/* If user is logged in and the review is not theirs, show report abuse button.
           * If user is not logged in, show report abuse button.
           */}
          {((user && review.userId && review.userId !== user?.uid) || !user) && reportAbuseButton()}
        </Grid>
      </CardActions>
      {Modals}
    </Card>
  );
};

export default ReviewComponent;

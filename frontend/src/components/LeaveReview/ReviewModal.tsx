import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Input,
  FormLabel,
  Typography,
  makeStyles,
  IconButton,
  CardMedia,
  Icon,
  useMediaQuery,
} from '@material-ui/core';
import axios from 'axios';
import React, { Dispatch, SetStateAction, useReducer, useState, useRef, useEffect } from 'react';
import { DetailedRating, Review } from '../../../../common/types/db-types';
import { createAuthHeaders, uploadFile } from '../../utils/firebase';
import ReviewRating from './ReviewRating';
import { includesProfanity } from '../../utils/profanity';
import Toast from './Toast';
import styles from './ReviewModal.module.scss';
import DropDown from '../utils/DropDown';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ReactComponent as XIcon } from '../../assets/xIcon.svg';
import { colors } from '../../colors';
import getPriceRange from '../../utils/priceRange';

const REVIEW_CHARACTER_LIMIT = 2000;
const REVIEW_PHOTOS_LIMIT = 3;
const REVIEW_PHOTO_MAX_MB = 10;

interface Props {
  open: boolean;
  onClose: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  landlordId: string;
  onSuccess: () => void;
  toastTime: number;
  aptId: string;
  aptName: string;
  user: firebase.User | null;
}

const useStyle = makeStyles({
  modalWidth: {
    maxWidth: '750px',
  },
  leaveAReviewTitle: {
    fontSize: '23px',
    fontWeight: 600,
    marginTop: '15px',
  },
  dropDownButton: {
    backgroundColor: '#E8E8E8',
    border: 'none',
    borderRadius: '50px',
    paddingRight: '5px',
    paddingLeft: '5px',
    position: 'relative',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
  },
  dropDownStyle: {
    fontWeight: 600,
    width: '100%',
    height: '100%',
    borderRadius: '50px !important',
    backgroundColor: 'transparent',
    top: '0',
    left: '0',
    textTransform: 'none',
    fontSize: '18px',
    textAlign: 'left',
    position: 'absolute',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'left',
    paddingLeft: '25px',
  },
  expandMoreIcon: {
    right: '10px',
    position: 'absolute',
  },
  promptBox: {
    borderRadius: '8px',
    boxShadow: '0px 0px 4px 0px rgba(0, 0, 0, 0.25)',
    padding: '16px',
  },
  promptTitle: {
    fontSize: '17px',
    fontWeight: 600,
  },
  promptList: {
    marginBottom: '8px',
  },
  submitButton: {
    borderRadius: '30px',
    marginTop: '10px',
    marginBottom: '10px',
    width: '80px',
    marginRight: '15px',
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
      backgroundColor: 'rgba(0,0,0,0.1)',
      opacity: 0.8,
    },
  },
  disabledButton: {
    minWidth: '80px',
    height: '35px',
    borderRadius: '30px',
    border: '2px solid',
    borderColor: '#ced4da',
    backgroundColor: 'transparent',
    color: '#ced4da',
    pointerEvents: 'none',
    cursor: 'default',
  },
  photoHover: {
    backgroundColor: 'black',
    position: 'absolute',
    borderRadius: '6px',
    height: '100%',
    width: '100%',
  },
  photosContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  photoRemoveButton: {
    fill: 'white',
    cursor: 'pointer',
    display: 'none',
    position: 'absolute',
    zIndex: 1,
  },
  photoAndButton: {
    position: 'relative',
    borderRadius: '6px',
    '&:hover $photoRemoveButton': {
      display: 'block',
    },
    '&:hover $photo': {
      opacity: 0.8,
    },
  },
  photo: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    borderRadius: '6px',
    '&:hover': {
      opacity: 0.8,
    },
  },
});

interface FormData {
  bedrooms: number;
  price: number;
  overallRating: number;
  address: string;
  ratings: DetailedRating;
  localPhotos: File[];
  body: string;
}

const defaultReview: FormData = {
  bedrooms: 0,
  price: 0,
  overallRating: 0,
  address: '',
  ratings: {
    location: 0,
    safety: 0,
    value: 0,
    maintenance: 0,
    communication: 0,
    conditions: 0,
  },
  localPhotos: [],
  body: '',
};

type Action =
  | { type: 'updateBedrooms'; bedrooms: number }
  | { type: 'updatePrice'; price: number }
  | { type: 'updateOverall'; rating: number }
  | { type: 'updateAddress'; address: string }
  | { type: 'updateRating'; category: keyof DetailedRating; rating: number }
  | { type: 'updatePhotos'; photos: File[] }
  | { type: 'updateBody'; body: string }
  | { type: 'reset' };

const reducer = (state: FormData, action: Action): FormData => {
  switch (action.type) {
    case 'updateBedrooms':
      return { ...state, bedrooms: action.bedrooms };
    case 'updatePrice':
      return { ...state, price: action.price };
    case 'updateOverall':
      return { ...state, overallRating: action.rating };
    case 'updateAddress':
      return { ...state, address: action.address };
    case 'updateRating':
      return { ...state, ratings: { ...state.ratings, [action.category]: action.rating } };
    case 'updatePhotos':
      return { ...state, localPhotos: action.photos ? [...action.photos] : [] };
    case 'updateBody':
      return { ...state, body: action.body };
    case 'reset':
      return defaultReview;
    default:
      throw new Error('invalid action type');
  }
};

/**
 * ReviewModal Component
 *
 * This component displays a modal for users to input information for their review about a specific apartment.
 * This includes the bedroom(s), price per person, overall rating, detailed ratings (location, safety, maintenance,
 * conditions), review text/body, pictures (up to 3 pictures). The information that is required are: overall experience
 * and review text/body, all other information are optional.
 * The submit button will add the review to the database and set the status as PENDING until an admin approves it.
 * The modal is responsive for all screen sizes and mobile display.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {boolean} props.open – The boolean for whether the modal is open or not.
 * @param props.onClose – The function to be called when the modal is closed.
 * @param props.setOpen – The function to set the modal open.
 * @param {string} props.landlordId – The landlord ID of the apartment that is being reviewed.
 * @param props.onSuccess – The function to be called when the review has been successfully submitted.
 * @param {number} props.toastTime – The time in milliseconds which the review successfully submitted toast is shown.
 * @param {string} props.aptId – The Apartment ID of the apartment being reviewed.
 * @param {string} props.aptName – The name of the apartment being reviewed.
 * @param props.user – The current user, null if not logged in.
 * @returns
 */

const ReviewModal = ({
  open,
  onClose,
  setOpen,
  landlordId,
  onSuccess,
  toastTime,
  aptId,
  aptName,
  user,
}: Props) => {
  const [review, dispatch] = useReducer(reducer, defaultReview);
  const [showError, setShowError] = useState(false);
  const [emptyTextError, setEmptyTextError] = useState(false);
  const [ratingError, setRatingError] = useState(false);
  const [includesProfanityError, setIncludesProfanityError] = useState(false);
  const [addedPhoto, setAddedPhoto] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  const {
    modalWidth,
    leaveAReviewTitle,
    dropDownButton,
    dropDownStyle,
    expandMoreIcon,
    promptBox,
    promptTitle,
    promptList,
    submitButton,
    hollowRedButton,
    disabledButton,
    photo,
    photoHover,
    photosContainer,
    photoRemoveButton,
    photoAndButton,
  } = useStyle();

  const updateBedrooms = (bedrooms: number) => {
    dispatch({ type: 'updateBedrooms', bedrooms });
  };

  const updatePrice = (price: number) => {
    dispatch({ type: 'updatePrice', price });
  };

  const updateOverall = () => {
    return (_: React.ChangeEvent<{}>, value: number | null) => {
      const rating = value || 0;
      dispatch({ type: 'updateOverall', rating });
    };
  };
  const [sending, setSending] = useState(false);

  const updateRating = (category: keyof DetailedRating) => {
    return (_: React.ChangeEvent<{}>, value: number | null) => {
      const rating = value || 0;
      dispatch({ type: 'updateRating', category, rating });
    };
  };

  const updatePhotos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files) return;
    const availablePhotos = REVIEW_PHOTOS_LIMIT - review.localPhotos.length;
    if (availablePhotos <= 0) {
      console.log(`Max file limit of ${REVIEW_PHOTOS_LIMIT} exceeded`);
      return;
    }

    const newFiles = [...files].slice(0, availablePhotos);
    const bigPhoto = newFiles.find(
      (newFiles) => newFiles.size > REVIEW_PHOTO_MAX_MB * Math.pow(1024, 2)
    );
    if (bigPhoto) {
      console.log(`File ${bigPhoto.name} exceeds max size of ${REVIEW_PHOTO_MAX_MB}`);
      return;
    }
    dispatch({ type: 'updatePhotos', photos: [...review.localPhotos, ...newFiles] });
  };

  const updateBody = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateBody', body: event.target.value });
  };

  const formDataToReview = async ({
    bedrooms,
    price,
    overallRating,
    ratings,
    body,
    localPhotos,
  }: FormData): Promise<Review> => {
    const photos = await Promise.all(localPhotos.map(uploadFile));
    return {
      aptId: aptId,
      date: new Date(),
      detailedRatings: ratings,
      landlordId: landlordId,
      bedrooms: bedrooms,
      price: price,
      overallRating,
      photos,
      reviewText: body,
      //added userId to the data
      userId: user?.uid,
    };
  };

  const onSubmit = async () => {
    try {
      setSending(true);
      const token = await user!.getIdToken(true);
      const data = await formDataToReview(review);
      if (
        data.reviewText === '' ||
        data.overallRating === 0 ||
        includesProfanity(data.reviewText)
      ) {
        data.overallRating === 0 ? setRatingError(true) : setRatingError(false);
        data.reviewText === '' ? setEmptyTextError(true) : setEmptyTextError(false);
        includesProfanity(data.reviewText)
          ? setIncludesProfanityError(true)
          : setIncludesProfanityError(false);
        if (modalRef.current) {
          modalRef.current.scrollTop = 0;
        }
        return;
      }
      const res = await axios.post('/api/new-review', data, createAuthHeaders(token));
      if (res.status !== 201) {
        throw new Error('Failed to submit review');
      }
      setOpen(false);
      dispatch({ type: 'reset' });
      onSuccess();
    } catch (err) {
      console.log(err);
      console.log('Failed to submit form');
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, toastTime);
    } finally {
      setSending(false);
    }
  };

  const onCloseClearPhotos = () => {
    dispatch({ type: 'updatePhotos', photos: [] });
    onClose();
  };

  const removePhoto = (index: number) => {
    const newPhotos = review.localPhotos.filter((_, photoIndex) => index !== photoIndex);
    dispatch({ type: 'updatePhotos', photos: newPhotos });
  };

  useEffect(() => {
    const updateScrollPosition = () => {
      if (modalRef.current) {
        const { scrollHeight, clientHeight } = modalRef.current;
        const maxScrollTop = scrollHeight - clientHeight;
        modalRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
      }
    };
    const timer = setTimeout(updateScrollPosition, 100);
    return () => clearTimeout(timer);
  }, [addedPhoto]);

  /**
   * Returns the "Things to consider in your review:" prompt box. Function serves to help mobile display.
   */
  const reviewPromptBox = () => {
    return (
      <div
        className={promptBox}
        style={!isMobile ? { marginLeft: '20px' } : { marginBottom: '10px' }}
      >
        <Typography className={promptTitle}>Things to consider in your review:</Typography>
        <ul style={{ fontSize: '13px', marginTop: '5px' }}>
          <li className={promptList}>What do you like/dislike about your apartment?</li>
          <li className={promptList}>Is there a lot of noise?</li>
          <li className={promptList}>What amenities are included?</li>
          <li className={promptList}>Is laundry convenient?</li>
          <li className={promptList}>How responsive is your landlord?</li>
          <li>Are there maintenance or other additional fees?</li>
        </ul>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onCloseClearPhotos}
      fullWidth
      PaperProps={{ className: modalWidth }}
    >
      <DialogTitle disableTypography className={leaveAReviewTitle}>
        Leave a Review{aptName.length > 0 && `: ${aptName}`}
      </DialogTitle>
      <DialogContent ref={modalRef}>
        {/* This div padding prevents the scrollbar from displaying unnecessarily */}

        <div>
          {showError && (
            <Toast
              isOpen={true}
              severity="error"
              message="Error submitting review. Please try again."
              time={toastTime}
            />
          )}
          <Grid
            container
            spacing={1}
            direction="row"
            alignItems="center"
            justifyContent="center"
            style={{ paddingBottom: '25px', paddingTop: '5px' }}
          >
            <Grid
              item
              xs={12}
              sm={6}
              container
              spacing={1}
              direction="row"
              alignItems="center"
              justifyContent="flex-start"
            >
              <Grid item style={{ marginRight: '10px', paddingLeft: '0' }}>
                <Typography>Bedroom(s)</Typography>
              </Grid>
              <Grid
                item
                className={dropDownButton}
                style={isMobile ? { minWidth: '100%' } : { minWidth: '185px' }}
              >
                <DropDown
                  menuItems={Array.from({ length: 6 }, (_, i) => ({
                    item: `${i + 1} Bedroom${i > 0 ? 's' : ''}`,
                    callback: () => updateBedrooms(i + 1),
                  }))}
                  defaultValue="Select"
                  className={dropDownStyle}
                  icon={false}
                />
                <ExpandMoreIcon className={expandMoreIcon} />
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              container
              spacing={1}
              direction="row"
              alignItems="center"
              justifyContent="flex-start"
            >
              <Grid
                item
                style={
                  !isMobile ? { marginRight: '10px', marginLeft: 'auto' } : { marginRight: '10px' }
                }
              >
                <Typography>Price Per Person</Typography>
              </Grid>
              <Grid
                item
                className={dropDownButton}
                style={isMobile ? { minWidth: '100%' } : { minWidth: '185px' }}
              >
                <DropDown
                  menuItems={Array.from({ length: 6 }, (_, i) => ({
                    item: getPriceRange(i + 1),
                    callback: () => updatePrice(i + 1),
                  }))}
                  defaultValue="Select"
                  className={dropDownStyle}
                  icon={false}
                />
                <ExpandMoreIcon className={expandMoreIcon} />
              </Grid>
            </Grid>
          </Grid>
          <Grid container direction="column" justifyContent="space-evenly" spacing={4}>
            <Grid container item>
              <ReviewRating
                name="overall"
                label="Overall Experience"
                onChange={updateOverall()}
              ></ReviewRating>
              {ratingError && <Typography color="error">*This field is required</Typography>}
            </Grid>
            <div className={styles.div}></div>
            {/* <Grid container item justifyContent="space-between" xs={12} sm={6}>
              <TextField
                fullWidth
                autoFocus
                label="Property Address (optional)"
                value={review.address}
                onChange={updateAddress}
              />
            </Grid> */}
            <Grid container item>
              <Grid container spacing={1} justifyContent="center">
                <ReviewRating
                  name="location"
                  label="Location"
                  onChange={updateRating('location')}
                ></ReviewRating>
                <ReviewRating
                  name="safety"
                  label="Safety"
                  onChange={updateRating('safety')}
                ></ReviewRating>
                <ReviewRating
                  name="maintenance"
                  label="Maintenance"
                  onChange={updateRating('maintenance')}
                ></ReviewRating>
                <ReviewRating
                  name="conditions"
                  label="Conditions"
                  onChange={updateRating('conditions')}
                ></ReviewRating>
              </Grid>
            </Grid>

            <div className={styles.div}></div>

            <Grid
              container
              item
              spacing={1}
              direction="row"
              alignItems="center"
              justifyContent="center"
            >
              {isMobile && reviewPromptBox()}
              <Grid
                item
                xs={!isMobile ? 6 : 12}
                container
                spacing={1}
                direction="row"
                alignItems="center"
                justifyContent="flex-start"
              >
                <TextField
                  required={true}
                  error={emptyTextError || includesProfanityError}
                  fullWidth
                  id="body"
                  label="Review"
                  multiline
                  rows={10}
                  inputProps={{
                    maxlength: REVIEW_CHARACTER_LIMIT,
                  }}
                  placeholder="Write your review here"
                  helperText={`${review.body.length}/${REVIEW_CHARACTER_LIMIT}${
                    emptyTextError ? ' This field is required' : ''
                  }${
                    includesProfanityError
                      ? ' This review contains profanity. Please edit it and try again.'
                      : ''
                  }`}
                  onChange={updateBody}
                />
              </Grid>

              {!isMobile && (
                <Grid
                  item
                  xs={6}
                  container
                  spacing={1}
                  direction="row"
                  alignItems="center"
                  justifyContent="flex-start"
                >
                  {reviewPromptBox()}
                </Grid>
              )}
            </Grid>

            <Grid
              container
              item
              justifyContent="space-between"
              spacing={3}
              style={{ paddingTop: '0', paddingBottom: '0' }}
            >
              <Grid item>
                <div
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
                >
                  <FormLabel>Upload Pictures: </FormLabel>
                  <FormLabel style={{ fontSize: '13px', color: colors.gray2, paddingTop: '8px' }}>
                    {`Reviewers may upload up to ${REVIEW_PHOTOS_LIMIT} photos. Max photo size of ${REVIEW_PHOTO_MAX_MB}MB`}
                  </FormLabel>
                </div>
              </Grid>
              <Grid item>
                <Button
                  component={'label'}
                  variant="contained"
                  disableElevation
                  className={
                    review.localPhotos.length >= REVIEW_PHOTOS_LIMIT
                      ? disabledButton
                      : hollowRedButton
                  }
                >
                  Choose File(s)
                  <Input
                    style={{ display: 'none' }}
                    id="upload"
                    type="file"
                    inputProps={{ multiple: true, accept: 'image/*' }}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      updatePhotos(event);
                      setAddedPhoto(!addedPhoto);
                    }}
                    disabled={review.localPhotos.length >= REVIEW_PHOTOS_LIMIT}
                  />
                </Button>
              </Grid>
            </Grid>
            <Grid item>
              {review.localPhotos.length > 0 && (
                <Grid
                  item
                  className={photosContainer}
                  style={isMobile ? { flexDirection: 'column' } : { flexDirection: 'row' }}
                >
                  {review.localPhotos.map((p, index) => {
                    return (
                      <div
                        className={photoAndButton}
                        style={
                          !isMobile
                            ? { width: '148px', height: '103px' }
                            : { width: '70vw', height: '180px' }
                        }
                      >
                        <div className={photoHover} />
                        <CardMedia
                          component="img"
                          alt="Apt image"
                          image={URL.createObjectURL(p)}
                          title="Apt image"
                          className={photo}
                        />
                        <IconButton
                          onClick={() => removePhoto(index)}
                          style={
                            !isMobile
                              ? { position: 'absolute', right: '2px' }
                              : { position: 'absolute', right: '10px', top: '10px' }
                          }
                        >
                          <XIcon
                            className={photoRemoveButton}
                            style={
                              !isMobile
                                ? { minWidth: '12px', minHeight: '12px' }
                                : { minWidth: '30px', minHeight: '30px' }
                            }
                          />
                        </IconButton>
                      </div>
                    );
                  })}
                </Grid>
              )}
            </Grid>
          </Grid>
        </div>
      </DialogContent>
      <DialogActions
        style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}
      >
        <Button
          variant="contained"
          disableElevation
          onClick={onCloseClearPhotos}
          className={hollowRedButton}
          style={{ marginLeft: '15px' }}
        >
          Cancel
        </Button>

        <Button
          color="primary"
          variant="contained"
          disableElevation
          onClick={onSubmit}
          disabled={sending}
          className={submitButton}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewModal;

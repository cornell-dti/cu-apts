import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  makeStyles,
  useMediaQuery,
} from '@material-ui/core';
import axios from 'axios';
import React, { Dispatch, SetStateAction, useReducer, useState, useRef, useEffect } from 'react';
import { DetailedRating, Review, ReviewWithId } from '../../../../common/types/db-types';
import { createAuthHeaders, uploadFile } from '../../utils/firebase';
import ReviewRating from './ReviewRating';
import { includesProfanity } from '../../utils/profanity';
import Toast from '../utils/Toast';
import DropDown from '../utils/DropDown';
import { colors } from '../../colors';
import getPriceRange from '../../utils/priceRange';
import UploadPhotos from '../utils/UploadPhotos';
import ChevronDownSrc from '../../assets/form-chevron-icon.svg';
import StepperMinusSrc from '../../assets/stepper-minus-icon.svg';
import StepperPlusSrc from '../../assets/stepper-plus-icon.svg';

const REVIEW_CHARACTER_LIMIT = 2000;
const REVIEW_PHOTOS_LIMIT = 3;
const REVIEW_PHOTO_MAX_MB = 10;
const BEDROOMS_MIN = 1;
const BEDROOMS_MAX = 6;

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
  initialReview?: ReviewWithId; // Optional initial review to prefill for editing
}

const MOBILE = '@media (max-width:600px)';
const MODAL_PADDING = '33.35px';
const SECTION_GAP = '22.23px';

const useStyle = makeStyles({
  modalWidth: {
    maxWidth: '739px',
    borderRadius: '13.9px',
    boxShadow: '3px 4px 25px rgba(0, 0, 0, 0.1)',
  },
  leaveAReviewTitle: {
    padding: `${MODAL_PADDING} ${MODAL_PADDING} 0`,
    fontSize: '23.68px',
    fontWeight: 600,
    lineHeight: '28.42px',
    [MOBILE]: { padding: '20px 16px 0' },
  },
  content: {
    padding: `${SECTION_GAP} ${MODAL_PADDING} 0`,
    [MOBILE]: { padding: '16px 16px 0' },
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: SECTION_GAP,
  },
  topFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  fieldRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px 26px',
    [MOBILE]: { flexDirection: 'column', alignItems: 'stretch' },
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldLine: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '4px 16px',
  },
  fieldLabel: {
    fontSize: '18px',
    lineHeight: '28px',
  },
  pill: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    flexShrink: 0,
    width: '185px',
    height: '44px',
    borderRadius: '50px',
    backgroundColor: colors.gray5,
    [MOBILE]: { flex: '1 1 185px', width: 'auto' },
  },
  stepper: {
    padding: '8px',
  },
  stepperButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    border: 'none',
    borderRadius: '100px',
    backgroundColor: colors.red1,
    cursor: 'pointer',
    '&:disabled': {
      backgroundColor: colors.gray2,
      cursor: 'default',
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.black}`,
      outlineOffset: '2px',
    },
  },
  stepperValue: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '28px',
    color: colors.black,
  },
  dropDownStyle: {
    fontWeight: 600,
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    textTransform: 'none',
    fontSize: '18px',
    lineHeight: '28px',
    position: 'absolute',
    borderRadius: '50px',
    justifyContent: 'flex-start',
    paddingLeft: '25px',
  },
  chevron: {
    position: 'absolute',
    top: '18px',
    right: '25px',
    width: '16px',
    height: '8px',
    pointerEvents: 'none',
    '& img': {
      position: 'absolute',
      top: '-1px',
      left: '-1px',
      width: '18px',
      height: '10.41px',
      maxWidth: 'none',
    },
  },
  errorText: {
    fontSize: '12px',
  },
  ratingsBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  detailRatings: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 298px))',
    justifyContent: 'space-between',
    rowGap: '6px',
    [MOBILE]: { gridTemplateColumns: 'minmax(0, 1fr)', rowGap: '12px' },
  },
  // The design's divider lines have no height of their own, so draw the stroke around a 0px box.
  divider: {
    position: 'relative',
    height: 0,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-0.695px',
      left: 0,
      right: 0,
      height: '1.39px',
      backgroundColor: colors.gray5,
    },
  },
  reviewRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '22px',
    [MOBILE]: { flexDirection: 'column', gap: '10px' },
  },
  reviewColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: '1 1 0',
    minWidth: 0,
  },
  reviewHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  reviewLabel: {
    fontSize: '18px',
    lineHeight: '26px',
    color: colors.black,
  },
  reviewHint: {
    fontSize: '12.5px',
    lineHeight: '20px',
    color: colors.gray2,
  },
  reviewInputRoot: {
    height: '129px',
    alignItems: 'flex-start',
    padding: '12px',
    borderRadius: 0,
    backgroundColor: colors.reviewBoxGray,
    '&:hover, &.Mui-focused': {
      backgroundColor: colors.reviewBoxGray,
    },
  },
  reviewInputError: {
    outline: `1px solid ${colors.red2}`,
  },
  reviewInput: {
    height: '100%',
    padding: 0,
    fontSize: '16px',
  },
  reviewHelperText: {
    margin: '10px 0 0',
    paddingTop: '7.61px',
    borderTop: `1.39px solid ${colors.gray1}`,
    fontSize: '12.5px',
    lineHeight: '20px',
    color: colors.gray2,
  },
  promptBox: {
    flexShrink: 0,
    boxSizing: 'border-box',
    width: '300px',
    borderRadius: '8px',
    boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.25)',
    padding: '16px',
    [MOBILE]: { width: '100%' },
  },
  promptTitle: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '19px',
  },
  promptListStyle: {
    margin: '8px 0 0',
    paddingLeft: '18px',
    fontSize: '12px',
    lineHeight: '14px',
  },
  promptList: {
    marginBottom: '12px',
    '&:last-child': { marginBottom: 0 },
  },
  actions: {
    justifyContent: 'space-between',
    padding: `${SECTION_GAP} ${MODAL_PADDING} ${MODAL_PADDING}`,
    [MOBILE]: { padding: '16px' },
  },
  actionButton: {
    minWidth: 0,
    height: '33.9px',
    padding: '0 13.9px',
    boxSizing: 'border-box',
    borderRadius: '20.84px',
    fontSize: '12.5px',
    fontWeight: 600,
    lineHeight: '19.45px',
    letterSpacing: 0,
  },
  hollowRedButton: {
    // The 2.08px border sits inside the 13.9px padding in the design.
    padding: '0 11.81px',
    border: '2.08px solid',
    borderColor: `${colors.red1} !important`,
    backgroundColor: 'transparent',
    color: colors.red1,
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.1)',
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
  bedrooms: -1,
  price: -1,
  overallRating: 0,
  address: '',
  ratings: {
    location: 0,
    safety: 0,
    maintenance: 0,
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
 * conditions), review text/body, pictures (up to 3 pictures). All fields are required.
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
 * @param {ReviewWithId} [props.initialReview] – The prefilled review to be displayed in the modal (optional).
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
  initialReview,
}: Props) => {
  // Function to convert ReviewWithId type to FormData type (used for editing created reviews)
  const convertReviewToFormData = (review: ReviewWithId): FormData => {
    return {
      overallRating: review.overallRating,
      address: '',
      ratings: {
        location: review.detailedRatings.location,
        safety: review.detailedRatings.safety,
        maintenance: review.detailedRatings.maintenance,
        conditions: review.detailedRatings.conditions,
      },
      localPhotos: review.photos.map((photo) => new File([], photo)),
      body: review.reviewText,
      bedrooms: review.bedrooms,
      price: review.price,
    };
  };
  const [review, dispatch] = useReducer(
    reducer,
    initialReview ? convertReviewToFormData(initialReview) : defaultReview
  );
  const [showError, setShowError] = useState(false);
  const [emptyTextError, setEmptyTextError] = useState(false);
  const [ratingError, setRatingError] = useState(false);
  const [bedroomError, setBedroomError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState(false);
  const [safetyError, setSafetyError] = useState(false);
  const [conditionsError, setConditionsError] = useState(false);
  const [includesProfanityError, setIncludesProfanityError] = useState(false);
  const [addedPhoto, setAddedPhoto] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  const {
    modalWidth,
    leaveAReviewTitle,
    content,
    formBody,
    topFields,
    fieldRow,
    fieldGroup,
    fieldLine,
    fieldLabel,
    pill,
    stepper,
    stepperButton,
    stepperValue,
    dropDownStyle,
    chevron,
    errorText,
    ratingsBlock,
    detailRatings,
    divider,
    reviewRow,
    reviewColumn,
    reviewHeader,
    reviewLabel,
    reviewHint,
    reviewInputRoot,
    reviewInputError,
    reviewInput,
    reviewHelperText,
    promptBox,
    promptTitle,
    promptListStyle,
    promptList,
    actions,
    actionButton,
    hollowRedButton,
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
        data.price < 0 ||
        data.bedrooms < 0 ||
        data.detailedRatings.location === 0 ||
        data.detailedRatings.conditions === 0 ||
        data.detailedRatings.maintenance === 0 ||
        data.detailedRatings.safety === 0 ||
        includesProfanity(data.reviewText)
      ) {
        data.overallRating === 0 ? setRatingError(true) : setRatingError(false);
        data.reviewText.length < 15 ? setEmptyTextError(true) : setEmptyTextError(false);
        data.price < 0 ? setPriceError(true) : setPriceError(false);
        data.bedrooms < 0 ? setBedroomError(true) : setBedroomError(false);
        data.detailedRatings.conditions === 0
          ? setConditionsError(true)
          : setConditionsError(false);
        data.detailedRatings.location === 0 ? setLocationError(true) : setLocationError(false);
        data.detailedRatings.maintenance === 0
          ? setMaintenanceError(true)
          : setMaintenanceError(false);
        data.detailedRatings.safety === 0 ? setSafetyError(true) : setSafetyError(false);
        includesProfanity(data.reviewText)
          ? setIncludesProfanityError(true)
          : setIncludesProfanityError(false);
        if (modalRef.current) {
          modalRef.current.scrollTop = 0;
        }
        return;
      }
      // If editing a review, send a POST request to update the review, otherwise send a POST request to create a new review
      const res = initialReview
        ? await axios.post(`/api/edit-review/${initialReview.id}`, data, createAuthHeaders(token))
        : await axios.post('/api/new-review', data, createAuthHeaders(token));
      if (res.status !== 201) {
        throw new Error('Failed to submit review');
      }
      setOpen(false);
      // Reset the form if not editing a review.
      if (!initialReview) {
        dispatch({ type: 'reset' });
      }
      sessionStorage.setItem('showModifiedReviewSuccessToast', 'true');
      window.location.reload();
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

  const resetErrors = () => {
    setEmptyTextError(false);
    setRatingError(false);
    setBedroomError(false);
    setPriceError(false);
    setPriceError(false);
    setLocationError(false);
    setMaintenanceError(false);
    setConditionsError(false);
    setSafetyError(false);
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

  useEffect(() => {
    if (sessionStorage.getItem('showModifiedReviewSuccessToast') === 'true') {
      onSuccess(); // Call the toast notification function
      sessionStorage.removeItem('showModifiedReviewSuccessToast'); // Clean up so it doesn't trigger again
    }
  }, []);

  /**
   * Returns the "Things to consider in your review:" prompt box. Function serves to help mobile display.
   */
  const reviewPromptBox = () => {
    return (
      <div className={promptBox}>
        <Typography className={promptTitle}>Things to consider in your review:</Typography>
        <ul className={promptListStyle}>
          <li className={promptList}>What do you like/dislike about your apartment?</li>
          <li className={promptList}>Is there a lot of noise?</li>
          <li className={promptList}>What amenities are included?</li>
          <li className={promptList}>Is laundry convenient?</li>
          <li className={promptList}>How responsive is your landlord?</li>
          <li className={promptList}>Are there maintenance or other additional fees?</li>
        </ul>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={initialReview ? onClose : onCloseClearPhotos} // If editing a review, close modal without clearing photos
      fullWidth
      PaperProps={{ className: modalWidth }}
    >
      <DialogTitle disableTypography className={leaveAReviewTitle}>
        {initialReview ? 'Edit Review' : 'Leave a Review'}
        {aptName.length > 0 && `: ${aptName}`}
      </DialogTitle>
      <DialogContent ref={modalRef} className={content}>
        <div className={formBody}>
          {showError && (
            <Toast
              isOpen={true}
              severity="error"
              message="Error submitting review. Please try again."
              time={toastTime}
            />
          )}
          <div className={topFields}>
            <div className={fieldRow}>
              <div className={fieldGroup}>
                <div className={fieldLine}>
                  <Typography
                    id="bedrooms-label"
                    className={fieldLabel}
                    color={!bedroomError ? 'initial' : 'error'}
                  >
                    Bedroom(s)
                  </Typography>
                  <div
                    className={`${pill} ${stepper}`}
                    role="group"
                    aria-labelledby="bedrooms-label"
                  >
                    <button
                      type="button"
                      className={stepperButton}
                      aria-label="Decrease bedrooms"
                      disabled={review.bedrooms <= BEDROOMS_MIN}
                      onClick={() => updateBedrooms(review.bedrooms - 1)}
                    >
                      <img src={StepperMinusSrc} alt="" />
                    </button>
                    <span className={stepperValue} aria-live="polite">
                      {review.bedrooms >= BEDROOMS_MIN ? review.bedrooms : '–'}
                    </span>
                    <button
                      type="button"
                      className={stepperButton}
                      aria-label="Increase bedrooms"
                      disabled={review.bedrooms >= BEDROOMS_MAX}
                      onClick={() => updateBedrooms(Math.max(review.bedrooms, 0) + 1)}
                    >
                      <img src={StepperPlusSrc} alt="" />
                    </button>
                  </div>
                </div>
                {bedroomError && (
                  <Typography color="error" className={errorText}>
                    * Required
                  </Typography>
                )}
              </div>

              <div className={fieldGroup}>
                <div className={fieldLine}>
                  <Typography className={fieldLabel} color={!priceError ? 'initial' : 'error'}>
                    Price Per Person
                  </Typography>
                  <div className={pill}>
                    <DropDown
                      menuItems={Array.from({ length: 6 }, (_, i) => ({
                        item: getPriceRange(i + 1),
                        callback: () => updatePrice(i + 1),
                      }))}
                      defaultValue={initialReview?.price ? getPriceRange(review.price) : 'Select'}
                      className={dropDownStyle}
                      icon={false}
                    />
                    <span className={chevron}>
                      <img src={ChevronDownSrc} alt="" />
                    </span>
                  </div>
                </div>
                {priceError && (
                  <Typography color="error" className={errorText}>
                    * Required
                  </Typography>
                )}
              </div>
            </div>
          </div>

          <div className={ratingsBlock}>
            <div>
              <ReviewRating
                name="overall"
                label="Overall Experience"
                onChange={updateOverall()}
                defaultValue={initialReview?.overallRating || 0}
                error={ratingError}
              ></ReviewRating>
              {ratingError && (
                <Typography color="error" className={errorText}>
                  * Required
                </Typography>
              )}
            </div>

            <div className={divider} />

            <div>
              <div className={detailRatings}>
                <ReviewRating
                  name="location"
                  label="Location"
                  labelOffset={37.26}
                  onChange={updateRating('location')}
                  defaultValue={initialReview?.detailedRatings.location || 0}
                  error={locationError}
                ></ReviewRating>
                <ReviewRating
                  name="safety"
                  label="Safety"
                  labelOffset={37.26}
                  onChange={updateRating('safety')}
                  defaultValue={initialReview?.detailedRatings.safety || 0}
                  error={safetyError}
                ></ReviewRating>
                <ReviewRating
                  name="maintenance"
                  label="Maintenance"
                  labelOffset={37.26}
                  onChange={updateRating('maintenance')}
                  defaultValue={initialReview?.detailedRatings.maintenance || 0}
                  error={maintenanceError}
                ></ReviewRating>
                <ReviewRating
                  name="conditions"
                  label="Conditions"
                  labelOffset={37.26}
                  onChange={updateRating('conditions')}
                  defaultValue={initialReview?.detailedRatings.conditions || 0}
                  error={conditionsError}
                ></ReviewRating>
              </div>
              {(conditionsError || safetyError || maintenanceError || locationError) && (
                <Typography color="error" className={errorText} style={{ marginTop: '5px' }}>
                  * These fields are required
                </Typography>
              )}
            </div>
          </div>

          <div className={divider} />

          <div className={reviewRow}>
            {isMobile && reviewPromptBox()}
            <div className={reviewColumn}>
              <div className={reviewHeader}>
                <label htmlFor="body" className={reviewLabel}>
                  Review:
                </label>
                <span id="body-hint" className={reviewHint}>
                  Write your review here
                </span>
              </div>
              <TextField
                required={true}
                error={emptyTextError || includesProfanityError}
                fullWidth
                id="body"
                variant="filled"
                multiline
                rows={5}
                InputProps={{
                  disableUnderline: true,
                  classes: {
                    root: reviewInputRoot,
                    error: reviewInputError,
                    inputMultiline: reviewInput,
                  },
                }}
                inputProps={{
                  maxLength: REVIEW_CHARACTER_LIMIT,
                  'aria-describedby': 'body-hint',
                }}
                FormHelperTextProps={{ classes: { root: reviewHelperText } }}
                helperText={`${review.body.length}/${REVIEW_CHARACTER_LIMIT}${
                  emptyTextError ? ' A minimum of 15 characters is required' : ''
                }${
                  includesProfanityError
                    ? ' This review contains profanity. Please edit it and try again.'
                    : ''
                }`}
                onChange={updateBody}
                defaultValue={initialReview?.reviewText || ''}
              />
            </div>
            {!isMobile && reviewPromptBox()}
          </div>

          <div>
            <UploadPhotos
              photosLimit={REVIEW_PHOTOS_LIMIT}
              photoMaxMB={REVIEW_PHOTO_MAX_MB}
              photos={review.localPhotos}
              onPhotosChange={updatePhotos}
              removePhoto={removePhoto}
              addedPhoto={addedPhoto}
              setAddedPhoto={setAddedPhoto}
              reviewFormDesign
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions className={actions}>
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            (initialReview ? onClose : onCloseClearPhotos)();
            resetErrors();
          }}
          className={`${actionButton} ${hollowRedButton}`}
        >
          Cancel
        </Button>

        <Button
          color="primary"
          variant="contained"
          disableElevation
          onClick={onSubmit}
          disabled={sending}
          className={actionButton}
        >
          {initialReview ? 'Save Edits' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewModal;

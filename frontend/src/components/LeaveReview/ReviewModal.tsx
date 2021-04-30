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
} from '@material-ui/core';
import axios from 'axios';
import React, { Dispatch, SetStateAction, useReducer, useState } from 'react';
import { DetailedRating, Review } from '../../../../common/types/db-types';
import { splitArr } from '../../utils';
import { createAuthHeaders, getUser, uploadFile } from '../../utils/firebase';
import ReviewRating from './ReviewRating';
import Toast from './Toast';
import styles from './ReviewModal.module.scss';

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
}

interface FormData {
  overallRating: number;
  address: string;
  ratings: DetailedRating;
  localPhotos: File[];
  body: string;
}

const defaultReview: FormData = {
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
  | { type: 'updateOverall'; rating: number }
  | { type: 'updateAddress'; address: string }
  | { type: 'updateRating'; category: keyof DetailedRating; rating: number }
  | { type: 'updatePhotos'; photos: File[] }
  | { type: 'updateBody'; body: string }
  | { type: 'reset' };

const reducer = (state: FormData, action: Action): FormData => {
  switch (action.type) {
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

const ReviewModal = ({ open, onClose, setOpen, landlordId, onSuccess, toastTime }: Props) => {
  const [review, dispatch] = useReducer(reducer, defaultReview);
  const [showError, setShowError] = useState(false);

  const updateOverall = () => {
    return (_: React.ChangeEvent<{}>, value: number | null) => {
      const rating = value || 0;
      dispatch({ type: 'updateOverall', rating });
    };
  };
  const [sending, setSending] = useState(false);

  const updateAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateAddress', address: event.target.value });
  };

  const updateRating = (category: keyof DetailedRating) => {
    return (_: React.ChangeEvent<{}>, value: number | null) => {
      const rating = value || 0;
      dispatch({ type: 'updateRating', category, rating });
    };
  };

  const updatePhotos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length > REVIEW_PHOTOS_LIMIT) {
      console.log(`Max file limit of ${REVIEW_PHOTOS_LIMIT} exceeded`);
      return;
    }
    const photos = [...files];
    const bigPhoto = photos.find((photo) => photo.size > REVIEW_PHOTO_MAX_MB * Math.pow(1024, 2));
    if (bigPhoto) {
      console.log(`File ${bigPhoto.name} exceeds max size of ${REVIEW_PHOTO_MAX_MB}`);
      return;
    }
    dispatch({ type: 'updatePhotos', photos });
  };

  const updateBody = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateBody', body: event.target.value });
  };

  const formDataToReview = async ({
    overallRating,
    ratings,
    body,
    localPhotos,
  }: FormData): Promise<Review> => {
    const photos = await Promise.all(localPhotos.map(uploadFile));
    return {
      aptId: null,
      date: new Date(),
      detailedRatings: ratings,
      landlordId: landlordId,
      overallRating,
      photos,
      reviewText: body,
    };
  };

  const onSubmit = async () => {
    try {
      setSending(true);
      const user = await getUser();
      if (!user) {
        throw new Error('Failed to login');
      }
      const token = await user.getIdToken(true);
      const res = await axios.post(
        '/new-review',
        await formDataToReview(review),
        createAuthHeaders(token)
      );
      if (res.status !== 201) {
        throw new Error('Failed to submit review');
      }
      console.log(review);
      setOpen(false);
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

  const generateFileStatus = (): string => {
    if (!review.localPhotos) return 'No photos uploaded';
    const [first, rest] = splitArr([...review.localPhotos], 2);
    const fileNames = first.map((file) => file.name).join(', ');
    return fileNames + (rest.length ? `, and ${rest.length} more` : '');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Leave a Review</DialogTitle>
      <DialogContent>
        {/* This div padding prevents the scrollbar from displaying unnecessarily */}

        <div className={styles.DialogContentDiv}>
          {showError && (
            <Toast
              isOpen={true}
              severity="error"
              message="Error submitting review. Please try again."
              time={toastTime}
            />
          )}
          <Grid container direction="column" justify="space-evenly" spacing={4}>
            <Grid container item>
              <ReviewRating
                name="overall"
                label="Overall Experience"
                onChange={updateOverall()}
              ></ReviewRating>
            </Grid>
            <div className={styles.div}></div>
            <Grid container item justify="space-between" xs={12} sm={6}>
              <TextField
                fullWidth
                autoFocus
                label="Property Address (optional)"
                value={review.address}
                onChange={updateAddress}
              />
            </Grid>
            <Grid container item>
              <Grid container spacing={1} justify="center">
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
                  name="value"
                  label="Value"
                  onChange={updateRating('value')}
                ></ReviewRating>
                <ReviewRating
                  name="maintenance"
                  label="Maintenance"
                  onChange={updateRating('maintenance')}
                ></ReviewRating>
                <ReviewRating
                  name="communication"
                  label="Communication"
                  onChange={updateRating('communication')}
                ></ReviewRating>
                <ReviewRating
                  name="conditions"
                  label="Conditions"
                  onChange={updateRating('conditions')}
                ></ReviewRating>
              </Grid>
            </Grid>
            <div className={styles.div}></div>
            <Grid container item justify="space-between" spacing={3}>
              <Grid item>
                <FormLabel>Upload Pictures: </FormLabel>
              </Grid>
              <Grid item container direction="row" xs={9} justify="flex-end" spacing={3}>
                <Grid item>
                  <FormLabel>{generateFileStatus()}</FormLabel>
                </Grid>
                <Grid item>
                  <Button variant="contained" component="label">
                    Choose File(s)
                    <Input
                      style={{ display: 'none' }}
                      id="upload"
                      type="file"
                      inputProps={{ multiple: true, accept: 'image/*' }}
                      onChange={updatePhotos}
                    />
                  </Button>
                </Grid>
              </Grid>
              <Grid item container justify="flex-end" xs={12}>
                <Grid item>
                  <FormLabel color="secondary">{`Reviewers may upload up to ${REVIEW_PHOTOS_LIMIT} photos. Max photo size of ${REVIEW_PHOTO_MAX_MB}MB`}</FormLabel>
                </Grid>
              </Grid>
            </Grid>
            <div className={styles.div}></div>
            <Grid container item>
              <TextField
                fullWidth
                id="body"
                label="Review"
                multiline
                rows={6}
                inputProps={{
                  maxlength: REVIEW_CHARACTER_LIMIT,
                }}
                placeholder="Write your review here"
                helperText={`${review.body.length}/${REVIEW_CHARACTER_LIMIT}`}
                onChange={updateBody}
              />
            </Grid>
          </Grid>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onSubmit} disabled={sending}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewModal;

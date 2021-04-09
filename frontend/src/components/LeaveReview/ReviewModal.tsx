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
import React, { useReducer } from 'react';
import { DetailedRating, Review } from '../../../../common/types/db-types';
import { splitArr } from '../../utils';
import { createAuthHeaders, getUser, uploadFile } from '../../utils/firebase';
import ReviewRating from './ReviewRating';

interface Props {
  open: boolean;
  onClose: () => void;
  landlordId: string;
}

interface FormData {
  address: string;
  ratings: DetailedRating;
  localPhotos: File[];
  body: string;
}

const defaultReview: FormData = {
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
  | { type: 'updateAddress'; address: string }
  | { type: 'updateRating'; category: keyof DetailedRating; rating: number }
  | { type: 'updatePhotos'; photos: FileList | null }
  | { type: 'updateBody'; body: string }
  | { type: 'reset' };

const reducer = (state: FormData, action: Action): FormData => {
  switch (action.type) {
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

const ReviewModal = ({ open, onClose, landlordId }: Props) => {
  const [review, dispatch] = useReducer(reducer, defaultReview);

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
    dispatch({ type: 'updatePhotos', photos: event.target.files });
  };

  const updateBody = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateBody', body: event.target.value });
  };

  const formDataToReview = async ({ ratings, body, localPhotos }: FormData): Promise<Review> => {
    const photos = await Promise.all(localPhotos.map(uploadFile));
    return {
      aptId: null,
      date: new Date(),
      detailedRatings: ratings,
      landlordId: landlordId,
      overallRating: 5,
      photos,
      reviewText: body,
    };
  };

  const onSubmit = async () => {
    try {
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
    } catch (err) {
      console.log(err);
      console.log('Failed to submit form');
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
        <div style={{ padding: 8 }}>
          <Grid container direction="column" justify="space-evenly" spacing={4}>
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
                    ></Input>
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid container item>
              <TextField
                fullWidth
                id="body"
                label="Review"
                multiline
                rows={6}
                placeholder="Write your review here"
                onChange={updateBody}
              />
            </Grid>
          </Grid>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewModal;

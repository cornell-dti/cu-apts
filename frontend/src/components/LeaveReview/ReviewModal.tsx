import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from '@material-ui/core';
import axios from 'axios';
import React, { useReducer } from 'react';
import { DetailedRating, Review } from '../../../../common/types/db-types';
import { createAuthHeaders, getUser } from '../../utils/auth';
import ReviewRating from './ReviewRating';
import styles from './ReviewModal.module.scss';

interface Props {
  open: boolean;
  onClose: () => void;
  landlordId?: string;
}

interface FormData {
  name: string;
  isAnonymous: boolean;
  ratings: DetailedRating;
  body: string;
}

const defaultReview: FormData = {
  name: '',
  isAnonymous: false,
  ratings: {
    location: 0,
    safety: 0,
    value: 0,
    maintenance: 0,
    communication: 0,
    conditions: 0,
  },
  body: '',
};

type Action =
  | { type: 'updateName'; name: string }
  | { type: 'updateAnonymous'; isAnonymous: boolean }
  | { type: 'updateRating'; category: keyof DetailedRating; rating: number }
  | { type: 'updateBody'; body: string }
  | { type: 'reset' };

const reducer = (state: FormData, action: Action) => {
  switch (action.type) {
    case 'updateName':
      return { ...state, name: action.name };
    case 'updateAnonymous':
      return { ...state, isAnonymous: action.isAnonymous };
    case 'updateRating':
      return { ...state, ratings: { ...state.ratings, [action.category]: action.rating } };
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

  const updateName = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateName', name: event.target.value });
  };

  const updateAnonymous = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateAnonymous', isAnonymous: event.target.checked });
  };

  const updateRating = (category: keyof DetailedRating) => {
    return (_: React.ChangeEvent<{}>, value: number | null) => {
      const rating = value || 0;
      dispatch({ type: 'updateRating', category, rating });
    };
  };

  const updateBody = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateBody', body: event.target.value });
  };

  const formDataToReview = ({ ratings, body }: FormData): Review => {
    return {
      aptId: null,
      landlordId: landlordId || '',
      overallRating: 5,
      detailedRatings: ratings,
      reviewText: body,
      date: new Date(),
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
        formDataToReview(review),
        createAuthHeaders(token)
      );
      if (res.status !== 201) {
        throw new Error('Failed to submit review');
      }
    } catch (_) {
      console.log('Failed to submit form');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Leave a Review</DialogTitle>
      <DialogContent>
        <div className={styles.DialogContentDiv}>
          <Grid container direction="column" justify="space-evenly" spacing={4}>
            <Grid container item alignContent="center">
              <Grid container item justify="space-between" xs={12} sm={6}>
                <TextField
                  fullWidth
                  autoFocus
                  label="Name"
                  value={review.name}
                  onChange={updateName}
                />
              </Grid>
              <Grid container justify="center" item xs={12} sm={6}>
                <Grid item>
                  <FormControlLabel
                    control={<Switch onChange={updateAnonymous} />}
                    label="Review anonymously"
                  />
                </Grid>
              </Grid>
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
            <Grid container item>
              <TextField
                fullWidth
                id="standard-multiline-static"
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

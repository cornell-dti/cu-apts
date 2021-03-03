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
import React, { useReducer } from 'react';
import ReviewRating from './ReviewRating';

interface Ratings {
  management: number;
  maintenence: number;
  amenities: number;
  condition: number;
  neighborhood: number;
  transportation: number;
}

interface Review {
  name: string;
  ratings: Ratings;
  body: string;
}

const defaultReview: Review = {
  name: '',
  ratings: {
    amenities: 0,
    condition: 0,
    maintenence: 0,
    management: 0,
    neighborhood: 0,
    transportation: 0,
  },
  body: '',
};

type Action =
  | { type: 'updateName'; name: string }
  | { type: 'updateRating'; category: keyof Ratings; rating: number }
  | { type: 'updateBody'; body: string }
  | { type: 'reset' };

const reducer = (state: Review, action: Action) => {
  switch (action.type) {
    case 'updateName':
      return { ...state, name: action.name };
    case 'updateRating':
      return { ...state, ratings: { ...state.ratings, [action.category]: action.rating } };
    case 'updateBody':
      return { ...state, body: action.body };
    case 'reset':
      return defaultReview;
    default:
      throw new Error();
  }
};

const ReviewModal = () => {
  const [review, dispatch] = useReducer(reducer, defaultReview);

  const updateName = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateName', name: event.target.value });
  };

  const updateRating = (category: keyof Ratings) => {
    return (_: React.ChangeEvent<{}>, value: number | null) => {
      const rating = value || 0;
      dispatch({ type: 'updateRating', category, rating });
    };
  };

  const updateBody = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'updateBody', body: event.target.value });
  };

  const onSubmit = () => {
    console.log(review);
  };

  return (
    <Dialog open={true} fullWidth maxWidth="md">
      <DialogTitle>Leave a Review</DialogTitle>
      <DialogContent style={{ overflow: 'hidden' }}>
        <Grid container direction="column" justify="space-evenly" spacing={4}>
          <Grid container item direction="row" justify="space-between" alignItems="center">
            <Grid item xs={4}>
              <TextField
                fullWidth
                autoFocus
                label="Name"
                value={review.name}
                onChange={updateName}
              />
            </Grid>
            <Grid item xs={5}>
              <FormControlLabel control={<Switch />} label="Leave this review anonymously" />
            </Grid>
          </Grid>
          <Grid container item>
            <Grid container justify="space-evenly">
              <ReviewRating
                label="Management/Landlord"
                onChange={updateRating('management')}
              ></ReviewRating>
              <ReviewRating
                label="Building Maintenence"
                onChange={updateRating('management')}
              ></ReviewRating>
            </Grid>
            <Grid container justify="space-evenly">
              <ReviewRating
                label="Building Amenities"
                onChange={updateRating('management')}
              ></ReviewRating>
              <ReviewRating
                label="Building Condition"
                onChange={updateRating('management')}
              ></ReviewRating>
            </Grid>
            <Grid container justify="space-evenly">
              <ReviewRating
                label="Neighborhood & Neighbors"
                onChange={updateRating('management')}
              ></ReviewRating>
              <ReviewRating
                label="Transportation and Parking"
                onChange={updateRating('management')}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewModal;

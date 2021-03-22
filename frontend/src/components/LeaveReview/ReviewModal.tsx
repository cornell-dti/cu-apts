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

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Ratings {
  management: number;
  maintenance: number;
  amenities: number;
  condition: number;
  neighborhood: number;
  transportation: number;
}

interface Review {
  name: string;
  isAnonymous: boolean;
  ratings: Ratings;
  body: string;
}

const defaultReview: Review = {
  name: '',
  isAnonymous: false,
  ratings: {
    amenities: 0,
    condition: 0,
    maintenance: 0,
    management: 0,
    neighborhood: 0,
    transportation: 0,
  },
  body: '',
};

type Action =
  | { type: 'updateName'; name: string }
  | { type: 'updateAnonymous'; isAnonymous: boolean }
  | { type: 'updateRating'; category: keyof Ratings; rating: number }
  | { type: 'updateBody'; body: string }
  | { type: 'reset' };

const reducer = (state: Review, action: Action) => {
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

const ReviewModal = ({ open, onClose }: Props) => {
  const [review, dispatch] = useReducer(reducer, defaultReview);

  const updateName = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateName', name: event.target.value });
  };

  const updateAnonymous = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateAnonymous', isAnonymous: event.target.checked });
  };

  const updateRating = (category: keyof Ratings) => {
    return (_: React.ChangeEvent<{}>, value: number | null) => {
      const rating = value || 0;
      dispatch({ type: 'updateRating', category, rating });
    };
  };

  const updateBody = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateBody', body: event.target.value });
  };

  const onSubmit = () => {
    console.log(review);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Leave a Review</DialogTitle>
      <DialogContent>
        {/* This div padding prevents the scrollbar from displaying unnecessarily */}
        <div style={{ padding: 8 }}>
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
                  name="management"
                  label="Management/Landlord"
                  onChange={updateRating('management')}
                ></ReviewRating>
                <ReviewRating
                  name="maintenance"
                  label="Building maintenance"
                  onChange={updateRating('maintenance')}
                ></ReviewRating>
                <ReviewRating
                  name="amenities"
                  label="Building Amenities"
                  onChange={updateRating('amenities')}
                ></ReviewRating>
                <ReviewRating
                  name="condition"
                  label="Building Condition"
                  onChange={updateRating('condition')}
                ></ReviewRating>
                <ReviewRating
                  name="neighborhood"
                  label="Neighborhood & Neighbors"
                  onChange={updateRating('neighborhood')}
                ></ReviewRating>
                <ReviewRating
                  name="transportation"
                  label="Transportation and Parking"
                  onChange={updateRating('transportation')}
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

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  withStyles,
} from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import FavoriteIcon from '@material-ui/icons/Favorite';
import React from 'react';
import ReviewRating from './ReviewRating';

const StyledRating = withStyles({
  iconFilled: {
    color: '#ff6d75',
  },
  iconHover: {
    color: '#ff3d47',
  },
})(Rating);

const ReviewModal = () => {
  return (
    <Dialog open={true} fullWidth maxWidth="md">
      <DialogTitle>Leave a Review</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          autoFocus
          id="name"
          label="Name"
          value={'hehe'}
          onChange={(event) => {}}
        />
        <FormControlLabel control={<Switch />} label="Leave this review anonymously" />
        <Grid container justify="space-evenly">
          <ReviewRating name="management-rating" label="Management/Landlord"></ReviewRating>
          <ReviewRating name="maintenence-rating" label="Building Maintenence"></ReviewRating>
        </Grid>
        <Grid container justify="space-evenly">
          <ReviewRating name="amenities-rating" label="Building Amenities"></ReviewRating>
          <ReviewRating name="condition-rating" label="Building Condition"></ReviewRating>
        </Grid>
        <Grid container justify="space-evenly">
          <ReviewRating name="neighbors-rating" label="Neighborhood & Neighbors"></ReviewRating>
          <ReviewRating
            name="transportation-rating"
            label="Transportation and Parking"
          ></ReviewRating>
        </Grid>
        <TextField
          fullWidth
          id="standard-multiline-static"
          label="Review"
          multiline
          rows={6}
          placeholder="Write your review here"
        />
      </DialogContent>
      <DialogActions>
        <Button>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewModal;

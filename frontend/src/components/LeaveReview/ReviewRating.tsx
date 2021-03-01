import React, { useState } from 'react';
import { Rating } from '@material-ui/lab';
import FavoriteIcon from '@material-ui/icons/Favorite';
import styles from './ReviewRating.module.scss';
import { FormLabel, Grid, withStyles } from '@material-ui/core';

interface Props {
  name: string;
  label: string;
}

const StyledRating = withStyles({
  iconFilled: {
    color: '#ff6d75',
  },
  iconHover: {
    color: '#ff3d47',
  },
})(Rating);

const ReviewRating = ({ name, label }: Props) => {
  return (
    <Grid item xs={5}>
      <StyledRating name={name} defaultValue={0} icon={<FavoriteIcon />} />
      <FormLabel> {label} </FormLabel>
    </Grid>
  );
};

export default ReviewRating;

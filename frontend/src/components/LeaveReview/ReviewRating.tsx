import React from 'react';
import { FormLabel, Grid } from '@material-ui/core';
import HeartRating from '../utils/HeartRating';

interface Props {
  name: string;
  label: string;
  onChange: (event: React.ChangeEvent<{}>, value: number | null) => void;
}

const ReviewRating = ({ name, label, onChange }: Props) => {
  return (
    <Grid container justifyContent="flex-start" alignItems="center" item xs={12} md={6}>
      <Grid container justifyContent="flex-start" alignItems="center" item xs={12} sm={3} md={4}>
        <HeartRating name={name} onChange={onChange} />
      </Grid>
      <Grid container justifyContent="flex-start" alignItems="center" item xs={12} sm={5} md={6}>
        <FormLabel>{label}</FormLabel>
      </Grid>
    </Grid>
  );
};

export default ReviewRating;

import React from 'react';
import { FormLabel, Grid } from '@material-ui/core';
import HeartRating from '../utils/HeartRating';

interface Props {
  name: string;
  label: string;
  onChange: (event: React.ChangeEvent<{}>, value: number | null) => void;
  defaultValue?: number;
}

const ReviewRating = ({ name, label, onChange, defaultValue }: Props) => {
  return (
    <Grid container justifyContent="flex-start" alignItems="center" item xs={12} md={6}>
      <Grid item>
        <HeartRating name={name} onChange={onChange} defaultValue={defaultValue || 0} />
      </Grid>
      <Grid item style={{ marginLeft: '25px' }}>
        <FormLabel>{label}</FormLabel>
      </Grid>
    </Grid>
  );
};

export default ReviewRating;

import React from 'react';
import { Rating } from '@material-ui/lab';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { FormLabel, Grid, withStyles } from '@material-ui/core';

interface Props {
  name: string;
  label: string;
  onChange: (event: React.ChangeEvent<{}>, value: number | null) => void;
}

const StyledRating = withStyles({
  iconFilled: {
    color: '#ff6d75',
  },
  iconHover: {
    color: '#ff3d47',
  },
})(Rating);

const ReviewRating = ({ name, label, onChange }: Props) => {
  return (
    <Grid container item xs={5}>
      <Grid item xs={4}>
        <StyledRating name={name} defaultValue={0} icon={<FavoriteIcon />} onChange={onChange} />
      </Grid>
      <Grid item xs={8}>
        <FormLabel>{label}</FormLabel>
      </Grid>
    </Grid>
  );
};

export default ReviewRating;

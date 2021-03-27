import React, { ReactElement } from 'react';
import { Grid, FormLabel } from '@material-ui/core';
import HeartRating from '../utils/HeartRating';
import { DetailedRating } from '../../../../common/types/db-types';

type Props = {
  readonly ratings: DetailedRating;
};

type ItemProps = {
  readonly aspect: string;
  readonly rating: number;
};
const Item = ({ aspect, rating }: ItemProps): ReactElement => {
  return (
    <Grid container item xs={12} md={6}>
      <Grid container item xs={12} sm={6} lg={5}>
        <HeartRating value={rating} readOnly />
      </Grid>
      <Grid container item xs={12} sm={6} lg={7}>
        <FormLabel>{aspect}</FormLabel>
      </Grid>
    </Grid>
  );
};

const DetailedRatings = ({ ratings }: Props): ReactElement => {
  const { value, conditions, maintenance, communication, location, safety } = ratings;
  return (
    <Grid container spacing={1}>
      <Grid container item xs={12} spacing={2}>
        <Item aspect="Building Value" rating={value} />
        <Item aspect="Building Condition" rating={conditions} />
        <Item aspect="Building Maintenance" rating={maintenance} />
        <Item aspect="Mangement/ Landlord" rating={communication} />
        <Item aspect="Neighborhood/ Location" rating={location} />
        <Item aspect="Building Safety" rating={safety} />
      </Grid>
    </Grid>
  );
};

export default DetailedRatings;

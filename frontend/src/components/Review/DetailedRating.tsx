import React, { ReactElement } from 'react';
import { Grid, FormLabel } from '@material-ui/core';
import HeartRating from '../utils/HeartRating';

type Props = {
  readonly ratings: Ratings;
};

export type Ratings = {
  readonly amenities: number;
  readonly condition: number;
  readonly maintenance: number;
  readonly management: number;
  readonly neighborhood: number;
  readonly transportation: number;
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

const DetailedRating = ({ ratings }: Props): ReactElement => {
  const { amenities, condition, maintenance, management, neighborhood, transportation } = ratings;
  return (
    <Grid container spacing={1}>
      <Grid container item xs={12} spacing={2}>
        <Item aspect="Building Amenities" rating={amenities} />
        <Item aspect="Building Condition" rating={condition} />
        <Item aspect="Building Maintenance" rating={maintenance} />
        <Item aspect="Mangement/ Landlord" rating={management} />
        <Item aspect="Neighborhood & Neighbors" rating={neighborhood} />
        <Item aspect="Transportation & Parking" rating={transportation} />
      </Grid>
    </Grid>
  );
};

export default DetailedRating;

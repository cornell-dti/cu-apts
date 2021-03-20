import React, { ReactElement } from 'react';
import {
  Grid,
  FormLabel,
} from '@material-ui/core';
import HeartRating from '../utils/HeartRating';

type Props = {
  readonly ratings: Ratings;
};

export type Ratings = {
  amenities: number;
  condition: number;
  maintenence: number;
  management: number
  neighborhood: number,
  transportation: number,
}

type ItemProps = {
  readonly aspect: string;
  readonly rating: number
}
const Item = ({aspect, rating}: ItemProps): ReactElement => {
  return <Grid container item xs={12} md={6}>
  <Grid container justify="flex-start" item xs={5} md={6} lg={5}>
    <HeartRating value={rating} readOnly />
  </Grid>
  <Grid container item xs={7} md={6} lg={7}>
    <FormLabel>{aspect}</FormLabel>
  </Grid>
</Grid>
}




const DetailedRating = ({ratings}: Props): ReactElement => {
  return <Grid container spacing={1}>
  <Grid container item xs={12} spacing={2}>
    <Item aspect="Building Amenities" rating={ratings.amenities} />
    <Item aspect="Building Condition" rating={ratings.condition} />
    <Item aspect="Building Maintenance" rating={ratings.maintenence} />
    <Item aspect="Mangement/ Landlord" rating={ratings.management} />
    <Item aspect="Neighborhood & Neighbors" rating={ratings.neighborhood} />
    <Item aspect="Transportation & Parking" rating={ratings.transportation} />
  </Grid>
</Grid>
}

export default DetailedRating;
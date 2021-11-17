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
      <Grid container item xs={12} sm={7} lg={5}>
        <HeartRating value={rating} readOnly />
      </Grid>
      <Grid container item xs={12} sm={5} lg={7}>
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
        <Item aspect="Location" rating={location} />
        <Item aspect="Safety" rating={safety} />
        <Item aspect="Value" rating={value} />
        <Item aspect="Maintenance" rating={maintenance} />
        <Item aspect="Communication" rating={communication} />
        <Item aspect="Conditions" rating={conditions} />
      </Grid>
    </Grid>
  );
};

export default DetailedRatings;

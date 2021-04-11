import React, { ReactElement } from 'react';
import ApartmentImg from '../../assets/apartment-sample.png';
import { Card, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import RoomOutlinedIcon from '@material-ui/icons/RoomOutlined';
import LocalOfferOutlinedIcon from '@material-ui/icons/LocalOfferOutlined';

type Props = {
  address: string;
  bedsAndBaths?: string;
  company?: string;
  numReviews?: string;
  price?: string;
};

const ApartmentCard = ({
  address,
  bedsAndBaths,
  company,
  numReviews,
  price,
}: Props): ReactElement => {
  return (
    <Card>
      <CardMedia image={ApartmentImg} component="img" title="Apartment Image" />
      <CardContent>
        <Grid container spacing={1}>
          <Grid container item justify="space-between" alignItems="center">
            <Grid item>
              <Grid container alignItems="center">
                <Typography variant="h6">
                  <RoomOutlinedIcon /> {address}
                </Typography>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container alignItems="center">
                <Typography variant="body1">
                  <LocalOfferOutlinedIcon /> {price || '$$'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Typography variant="subtitle1">{company}</Typography>
          </Grid>
          <Grid container item justify="space-between">
            <Grid item>
              <Typography variant="subtitle2">{bedsAndBaths}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2">{numReviews}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ApartmentCard;

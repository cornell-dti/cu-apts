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
    <Grid item xs={7} lg={3}>
      <Card>
        <CardMedia image={ApartmentImg} component="img" title="Apartment Image" />
        <CardContent>
          <Grid container spacing={1}>
            <Grid container item justify="space-between" alignItems="center">
              <Grid item>
                <Typography variant="h6">
                  <Grid container alignItems="center">
                    <RoomOutlinedIcon /> {address}
                  </Grid>
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body1">
                  <Grid container alignItems="center">
                    <LocalOfferOutlinedIcon /> {price || '$$'}
                  </Grid>
                </Typography>
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
    </Grid>
  );
};

export default ApartmentCard;

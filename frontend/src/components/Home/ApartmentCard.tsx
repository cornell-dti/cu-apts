import React, { ReactElement } from 'react';
import ApartmentImg from '../../assets/apartment-sample.png';
import { Card, CardContent, CardMedia, Grid, makeStyles, Typography } from '@material-ui/core';
import RoomOutlinedIcon from '@material-ui/icons/RoomOutlined';

type Props = {
  name: string;
  address: string;
  numBeds: number | null;
  numBaths: number | null;
  company: string;
  numReviews: number;
  photos: readonly string[];
};

const useStyles = makeStyles({
  img: {
    height: 200,
    width: '100%',
  },
});

const ApartmentCard = ({
  name,
  address,
  numBeds,
  numBaths,
  company,
  numReviews,
  photos,
}: Props): ReactElement => {
  const bedsAndBaths = numBeds && numBaths ? `${numBeds}Br | ${numBaths}B` : '';
  const img = photos.length > 0 ? photos[0] : ApartmentImg;

  const classes = useStyles();

  return (
    <Card>
      <CardMedia className={classes.img} image={img} component="img" title={name} />
      <CardContent>
        <Grid container spacing={1}>
          <Grid container item justify="space-between" alignItems="center">
            <Grid item>
              <Grid container alignItems="center">
                <Typography variant="h6">{name}</Typography>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container alignItems="center">
                <Typography variant="body1">
                  <RoomOutlinedIcon /> {address}
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
              <Typography variant="body2">{`${numReviews} Reviews`}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ApartmentCard;

import React, { ReactElement } from 'react';
import ApartmentImg from '../../assets/apartment-placeholder.png';
import { Card, CardContent, CardMedia, Grid, makeStyles, Typography } from '@material-ui/core';
import { Apartment } from '../../../../common/types/db-types';
import HeartRating from '../utils/HeartRating';

type Props = {
  buildingData: Apartment;
  numReviews: number;
  company?: string;
};
const useStyles = makeStyles({
  img: {
    height: 200,
    width: 200,
  },
  nameText: {
    fontWeight: 800,
  },
  reviewNum: {
    fontWeight: 700,
  },
  card: {
    borderRadius: '10px',
    backgroundColor: '#FFF2F2',
  },
  reviewText: {
    color: 'gray',
  },
});

const ApartmentCard = ({ buildingData, numReviews, company }: Props): ReactElement => {
  const { name, photos } = buildingData;
  const img = photos.length > 0 ? photos[0] : ApartmentImg;

  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <Grid container direction="row">
        <Grid item md={2}>
          <CardMedia className={classes.img} image={img} component="img" title={name} />
        </Grid>
        <Grid item md={10}>
          <CardContent>
            <Grid container spacing={1}>
              <Grid item>
                <Typography variant="h5" className={classes.nameText}>
                  {name}
                </Typography>
              </Grid>

              {company && (
                <Grid container item justify="space-between">
                  <Grid>
                    <Typography variant="subtitle1">{buildingData.address}</Typography>
                  </Grid>
                </Grid>
              )}

              <Grid>
                <Typography variant="h6" className={classes.reviewNum}>
                  <HeartRating value={3} readOnly />
                  {numReviews + (numReviews !== 1 ? ' Reviews' : ' Review')}
                </Typography>
              </Grid>
              <Grid>
                <Typography variant="subtitle1">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. more
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ApartmentCard;

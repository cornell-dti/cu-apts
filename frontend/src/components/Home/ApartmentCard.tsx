import React, { ReactElement } from 'react';
import ApartmentImg from '../../assets/apartment-sample.png';
import { Card, CardContent, CardMedia, Grid, makeStyles, Typography } from '@material-ui/core';
import { Apartment } from '../../../../common/types/db-types';

type Props = {
  buildingData: Apartment;
  numReviews: number;
  company?: string;
};

const useStyles = makeStyles({
  img: {
    height: 200,
    width: '100%',
  },
  nameText: {
    fontWeight: 600,
  },
  card: {
    borderRadius: '10px',
  },
});

const ApartmentCard = ({ buildingData, numReviews, company }: Props): ReactElement => {
  const { name, photos } = buildingData;
  const img = photos.length > 0 ? photos[0] : ApartmentImg;

  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardMedia className={classes.img} image={img} component="img" title={name} />
      <CardContent>
        <Grid container spacing={1}>
          <Grid container item justify="space-between" alignItems="center">
            <Grid item>
              <Grid container alignItems="center">
                <Typography variant="h6" className={classes.nameText}>
                  {name}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {company && (
            <Grid container item justify="space-between">
              <Grid>
                <Typography variant="subtitle1">{company}</Typography>
              </Grid>
            </Grid>
          )}
          <Grid container item justify="space-between">
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

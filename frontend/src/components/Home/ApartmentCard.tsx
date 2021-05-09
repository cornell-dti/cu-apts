import React, { ReactElement } from 'react';
import ApartmentImg from '../../assets/apartment-sample.png';
import { Card, CardContent, CardMedia, Grid, makeStyles, Typography } from '@material-ui/core';

type Props = {
  name: string;
  company: string;
  numReviews: number;
  photos: readonly string[];
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

const ApartmentCard = ({ name, company, numReviews, photos }: Props): ReactElement => {
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
          <Grid container item justify="space-between">
            <Grid>
              <Typography variant="subtitle1">{company}</Typography>
            </Grid>
          </Grid>
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

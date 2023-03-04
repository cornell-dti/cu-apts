import React, { ReactElement } from 'react';
import ApartmentImg from '../../assets/apartment-sample.png';
import { Card, CardContent, CardMedia, Grid, makeStyles, Typography } from '@material-ui/core';

type Props = {
  readonly photo: string;
  readonly location: string;
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
  cardContent: {
    padding: '12px',
    '&:last-child': {
      paddingBottom: '12px',
    },
  },
});

const LocationCard = ({ photo, location }: Props): ReactElement => {
  const img = photo ? photo : ApartmentImg;

  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardMedia className={classes.img} image={img} component="img" title={location} />
      <CardContent className={classes.cardContent}>
        <Grid container spacing={1}>
          <Grid container item justifyContent="center" alignItems="center">
            <Grid item>
              <Grid container alignItems="center">
                <Typography variant="h6" className={classes.nameText}>
                  {location}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LocationCard;

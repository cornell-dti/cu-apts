import React, { ReactElement, useState, useEffect } from 'react';
import ApartmentImg from '../../assets/apartment-sample.png';
import { Card, CardContent, CardMedia, Grid, makeStyles, Typography } from '@material-ui/core';

type Props = {
  readonly photo: string;
  readonly location: string;
};

const LocationCard = ({ photo, location }: Props): ReactElement => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const useStyles = makeStyles({
    img: {
      height: 250,
      width: '100%',
    },
    nameText: {
      fontWeight: 600,
    },
    card: {
      borderRadius: '5px',
    },
    cardContent: {
      padding: isMobile ? '4px' : '12px',
      '&:last-child': {
        paddingBottom: isMobile ? '7px' : '12px',
      },
    },
  });

  const img = photo ? photo : ApartmentImg;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardMedia
        style={{ height: isMobile ? '140px' : '200px' }}
        className={classes.img}
        image={img}
        component="img"
        title={location}
      />
      <CardContent className={classes.cardContent}>
        <Grid container spacing={1}>
          <Grid container item justifyContent="center" alignItems="center">
            <Grid item>
              <Grid container alignItems="center">
                <Typography
                  variant="h6"
                  className={classes.nameText}
                  style={{ fontSize: isMobile ? '18px' : '20px' }}
                >
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

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
      objectFit: 'cover',
      objectPosition: 'center',
    },
    imgCropper: {
      clipPath: 'inset(1%)',
      scale: 1.03,
    },
    imgContainer: {
      overflow: 'hidden',
    },
    textBox: {
      height: '61.75px',
      justifyContent: 'center',
      alignItems: 'center',
    },
    nameText: {
      fontWeight: 600,
      fontSize: '21.097px',
    },
    card: {
      borderRadius: '7.032',
      boxShadow: '0px 4px 15px 0px rgba(0, 0, 0, 0.10)',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0px 4px 15px 0px rgba(0, 0, 0, 0.50)',
        scale: 1.01,
      },
    },
    cardContent: {
      backgroundColor: 'white',
      paddingTop: 0,
      paddingBottom: 0,
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
      <Grid container className={classes.imgContainer}>
        <Grid container className={classes.imgCropper}>
          <CardMedia className={classes.img} image={img} component="img" title={location} />
        </Grid>
      </Grid>
      <CardContent className={classes.cardContent}>
        <Grid container className={classes.textBox}>
          <Typography
            variant="h6"
            className={classes.nameText}
            style={{ fontSize: isMobile ? '18px' : '21.097px' }}
          >
            {location}
          </Typography>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LocationCard;

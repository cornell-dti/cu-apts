import React, { ReactElement, useState, useEffect } from 'react';
import ApartmentImg from '../../assets/apartment-sample.png';
import { Card, CardContent, CardMedia, Grid, makeStyles, Typography } from '@material-ui/core';

type Props = {
  readonly photo: string;
  readonly location: string;
};

/**
 * LocationCard Component
 *
 * Represents a card component displaying a location (collegetown/west/north/downtown)
 * with the associated image and name.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.photo - The URL of the location photo.
 * @param {string} props.location - The name of the location.
 * @returns {ReactElement} The rendered LocationCard component.
 */
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
      height: isMobile ? '50px' : '62px',
      justifyContent: 'center',
      alignItems: 'center',
    },
    nameText: {
      fontWeight: 600,
      fontSize: '21px',
    },
    card: {
      borderRadius: '7px',
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
      //the code below is to override material ui's default card content padding
      '&:last-child': {
        paddingBottom: 0,
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
      <Grid container className={classes.imgContainer}>
        <Grid container className={classes.imgCropper}>
          <CardMedia
            className={classes.img}
            image={img}
            component="img"
            title={location}
            style={{ aspectRatio: isMobile ? '2' : 'auto' }}
          />
        </Grid>
      </Grid>
      <CardContent className={classes.cardContent}>
        <Grid container className={classes.textBox}>
          <Typography
            variant="h6"
            className={classes.nameText}
            style={{ fontSize: isMobile ? '18px' : '21px' }}
          >
            {location}
          </Typography>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LocationCard;

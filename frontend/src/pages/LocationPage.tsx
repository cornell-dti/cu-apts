import React, { ReactElement } from 'react';
import { Box, CardMedia, Container, Typography, makeStyles, Card } from '@material-ui/core';
import styles from './HomePage.module.scss';
import { LocationCardData } from '../App';
import { useLocation } from 'react-router-dom';
import CollegetownImg from '../assets/collegetown-coverpic.png';
import WestImg from '../assets/west-coverpic.jpeg';
import NorthImg from '../assets/north-coverpic.jpeg';
import DowntownImg from '../assets/downtown-coverpic.jpeg';

interface Images {
  [location: string]: string;
}

type Props = {
  data: LocationCardData[];
};

const useStyles = makeStyles({
  imgStyle: {
    borderRadius: '25px',
    height: '300px',
    width: '100%',
    padding: '17px',
  },
  titleStyle: {
    borderRadius: '25px',
    height: '300px',
    width: '100%',
    padding: '17px',
  },
});

const LocationPage = ({ data }: Props): ReactElement => {
  const path = useLocation();
  const location = path.pathname.substring(path.pathname.lastIndexOf('/') + 1);
  const locToImg: Images = {
    Collegetown: CollegetownImg,
    West: WestImg,
    North: NorthImg,
    Downtown: DowntownImg,
  };
  let img = locToImg[location];
  const { imgStyle } = useStyles();

  return (
    <>
      <Box>
        <Container maxWidth="lg">
          <Typography variant="subtitle1"> Properties </Typography>
          <CardMedia className={imgStyle} image={img} component="img" title={location} />
          <Typography variant="h1">{location}</Typography>
        </Container>
      </Box>
    </>
  );
};
export default LocationPage;

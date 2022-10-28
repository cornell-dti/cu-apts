import React, { ReactElement, useState, useEffect } from 'react';
import { Box, CardMedia, Container, Typography, makeStyles } from '@material-ui/core';
import { CardData } from '../App';
import { useLocation } from 'react-router-dom';
import CollegetownImg from '../assets/collegetown-coverpic.svg';
import WestImg from '../assets/west-coverpic.svg';
import NorthImg from '../assets/north-coverpic.svg';
import DowntownImg from '../assets/downtown-coverpic.svg';
import { colors } from '../colors';
import { get } from '../utils/call';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';

interface Images {
  [location: string]: string;
}

const useStyles = makeStyles({
  imgStyle: {
    borderRadius: '20px',
    height: '300px',
    width: '100%',
  },
  titleStyle: {
    marginBottom: '40px',
    fontWeight: 'bold',
    color: colors.white,
    fontSize: '40px',
    marginLeft: '50px',
    marginTop: '-70px',
  },
  subtitleStyle: {
    fontWeight: 700,
    fontSize: '24px',
  },
  bodyStyle: {
    marginLeft: '20px',
  },
});

const LocationPage = (): ReactElement => {
  const [homeData, setHomeData] = useState<CardData[]>([]);

  const path = useLocation();
  const location = path.pathname.substring(path.pathname.lastIndexOf('/') + 1);
  const locToImg: Images = {
    Collegetown: CollegetownImg,
    West: WestImg,
    North: NorthImg,
    Downtown: DowntownImg,
  };

  useEffect(() => {
    get<CardData[]>(`/location/${location}`, {
      callback: setHomeData,
    });
  }, [location]);

  const locDescText: Images = {
    Collegetown:
      'Living in Collegetown allows you to Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    West: 'Living in West allows you to Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    North:
      'Living in North allows you to Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    Downtown:
      'Living in Downtown allows you to Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  };
  let img = locToImg[location];
  let desc = locDescText[location];
  const { imgStyle, titleStyle, subtitleStyle, bodyStyle } = useStyles();

  return (
    <>
      <Box>
        <Container maxWidth="lg">
          <Typography variant="subtitle1" className={subtitleStyle}>
            Properties
          </Typography>
          <CardMedia className={imgStyle} image={img} component="img" title={location} />
          <Typography variant="h1" className={titleStyle}>
            {location}
          </Typography>
          <Typography variant="body1" className={bodyStyle}>
            {desc}
          </Typography>
          <ApartmentCards data={homeData} />
        </Container>
      </Box>
    </>
  );
};
export default LocationPage;

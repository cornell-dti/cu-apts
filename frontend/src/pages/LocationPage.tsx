import React, { ReactElement, useState, useEffect } from 'react';
import { Box, CardMedia, Container, Typography, makeStyles } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import CollegetownImg from '../assets/collegetown-coverpic.svg';
import WestImg from '../assets/west-coverpic.svg';
import NorthImg from '../assets/north-coverpic.svg';
import DowntownImg from '../assets/downtown-coverpic.svg';
import { colors } from '../colors';
import ScrollingCards from '../components/ApartmentCard/ScrollingCards';

interface Images {
  [location: string]: string;
}

const LocationPage = (): ReactElement => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const useStyles = makeStyles({
    imgStyle: {
      borderRadius: '20px',
      height: isMobile ? '100px' : '300px',
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

  const path = useLocation();
  const location = path.pathname.substring(path.pathname.lastIndexOf('/') + 1);
  const locAPI = `/location/${location}/`;
  const locToImg: Images = {
    Collegetown: CollegetownImg,
    West: WestImg,
    North: NorthImg,
    Downtown: DowntownImg,
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const locDescText: Images = {
    Collegetown: !isMobile
      ? 'Living in Collegetown, Ithaca, NY, offers a vibrant and exciting lifestyle, with easy access to Cornell University and a variety of restaurants, shops, and entertainment options.'
      : '',
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
          <ScrollingCards API={locAPI} />
        </Container>
      </Box>
    </>
  );
};
export default LocationPage;

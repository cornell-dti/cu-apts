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
      height: isMobile ? '200px' : '300px',
      width: isMobile ? '110%' : '100%',
      marginLeft: '-20px',
    },
    titleStyle: {
      marginBottom: '40px',
      fontWeight: 'bold',
      color: colors.black,
      fontSize: '40px',
      marginLeft: '50px',
      marginTop: '-70px',
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
    Collegetown: isMobile
      ? 'Collegetown is an off-campus gathering place for Cornellians located within walking distance of campus.'
      : 'Collegetown is an off-campus gathering place for Cornellians located within walking distance of campus. Many upperclassmen live in apartments located within Collegetown. Collegetown hosts a diverse array of restaurants. It is a special gathering place for dining, shopping, and hanging out.',

    West: isMobile
      ? 'West Campus houses upper level students who live in a community that emphasizes informal interaction with faculty members, self-governance, social initiative, and personal discovery.'
      : 'West Campus houses upper level students who live in a community that emphasizes informal interaction with faculty members, self-governance, social initiative, and personal discovery. West Campus has a variety of off-campus small living units that are privately and university owned. In addition, there is easy access to campus as well as restaurants in both Collegetown and Downtown Ithaca.',
    North: isMobile
      ? 'North Campus is located north of Fall Creek. The residential experience is foundational for increasing interaction among students, especially those of the freshman class.'
      : 'North Campus is located north of Fall Creek. The residential experience is foundational for increasing interaction among students, especially those of the freshman class. Students may live in either a residence hall or a program house. Buses are very accessible and Greek life and other forms of off-campus housing options are available in abundance.',
    Downtown: isMobile
      ? 'Downtown is the area surrounding and including Ithaca Commons – a vibrant off-campus gathering place for residents of Ithaca.'
      : 'Downtown is the area surrounding and including Ithaca Commons – a vibrant off-campus gathering place for residents of Ithaca. Downtown is a walkable and well-connected area that is home to more than 100 stores and 50 restaurants.',
  };
  let img = locToImg[location];
  let desc = locDescText[location];
  const { imgStyle, titleStyle, bodyStyle } = useStyles();

  return (
    <>
      <Box mt={isMobile ? -2 : 0}>
        <Container maxWidth="lg">
          {/* <Typography className={subtitleStyle} style={{ fontSize: '20px' }}>
            Properties
          </Typography> */}
          <CardMedia className={imgStyle} image={img} component="img" title={location} />

          <Typography
            className={titleStyle}
            style={{ marginTop: '20px', fontSize: '25px', marginLeft: '5px' }}
          >
            {location}
          </Typography>
          <Typography
            variant="body1"
            className={bodyStyle}
            style={{ marginTop: '-35px', fontSize: '16px', marginLeft: '5px' }}
          >
            {desc}
          </Typography>
          <ScrollingCards API={locAPI} />
        </Container>
      </Box>
    </>
  );
};
export default LocationPage;

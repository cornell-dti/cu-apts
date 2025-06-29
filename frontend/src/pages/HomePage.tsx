import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Container, Typography, makeStyles } from '@material-ui/core';
import Autocomplete from '../components/Search/Autocomplete';
import styles from './HomePage.module.scss';
import LocationCards from '../components/Home/LocationCards';
import { colors } from '../colors';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';
import { CardData } from '../App';
import { get } from '../utils/call';
import { loadingLength } from '../constants/HomeConsts';
import { useTitle } from '../utils';
import { useSaveScrollPosition } from '../utils/saveScrollPosition';
import { useLocation } from 'react-router-dom';
import HomePageApartmentCards from '../components/ApartmentCard/HomePageApartmentCards';
import logo from '../assets/3d-logo.svg';

type returnData = {
  buildingData: CardData[];
  isEnded: boolean;
};

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

/**
 * HomePage Component – This component represents CUAPTS' home page.
 *
 * @remarks
 * This page displays a search bar (autocomplete), featured properties, and adjusts its layout
 * responsively for desktop and mobile views.
 *
 * @param {firebase.User | null} props.user – The currently logged-in Firebase user or null
 * if no user is logged in.
 * @param {React.Dispatch<React.SetStateAction<firebase.User | null>>} props.setUser - A
 * function to update the `user` state.
 *
 * @return {ReactElement} The JSX structure of the HomePage component.
 */

const HomePage = ({ user, setUser }: Props): ReactElement => {
  const [closeToCampusData, setCloseToCampusData] = useState<returnData>({
    buildingData: [],
    isEnded: false,
  });
  const [mostReviewedData, setMostReviewedData] = useState<returnData>({
    buildingData: [],
    isEnded: false,
  });
  const [mostLovedData, setMostLovedData] = useState<returnData>({
    buildingData: [],
    isEnded: false,
  });

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [drawerOpen] = useState<boolean>(false);
  const path = useLocation();
  const [pathName] = useState(path.pathname);
  const introText =
    "Start your housing search by finding the most \
  highly rated and recommended apartments at Cornell. Don't believe us?\
    Take other Cornellians' word for it.";

  useTitle('Home');

  useEffect(() => {
    get<returnData>(`/api/page-data/home/${loadingLength}/distanceToCampus`, {
      callback: setCloseToCampusData,
    });
    get<returnData>(`/api/page-data/home/${loadingLength}/numReviews`, {
      callback: setMostReviewedData,
    });
    get<returnData>(`/api/page-data/home/${loadingLength}/avgRating`, {
      callback: setMostLovedData,
    });
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useSaveScrollPosition(`scrollPosition_${pathName}`, pathName);

  const useStyles = makeStyles({
    header: {
      width: '65%',
      marginLeft: '4.5vw',
      marginRight: '4.5vw',
      marginTop: '93px',
      marginBottom: '100px',
      position: 'relative',
    },
    jumboText: {
      fontSize: isMobile ? '26px' : '48px',
      marginTop: isMobile ? '10px' : '0px',
      marginBottom: isMobile ? '10px' : '16px',
      fontWeight: 600,
      fontStyle: 'normal',
      lineHeight: isMobile ? '40px' : '60px',
    },
    jumboSub: {
      fontSize: isMobile ? '14px' : '18px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '28px',
    },
    logoContainer: {
      position: 'absolute',
      left: isMobile ? '90%' : '105%',
      top: isMobile ? '54%' : '80%',
      transform: isMobile ? 'translateY(-60%)' : 'translateY(-50%)',
      width: isMobile ? '170px' : '270px',
      zIndex: -1,
    },
    logoImage: {
      width: '100%',
      height: '100%',
    },
  });

  const { header, jumboText, jumboSub, logoContainer, logoImage } = useStyles();

  return (
    <Container maxWidth="xl">
      <Box className={header} mt={isMobile ? -2 : 0} position="relative">
        <Typography variant="h1" className={jumboText}>
          Discover Housing{' '}
          <span style={{ color: '#B94630' }}>{isMobile ? <br /> : ''}@ Cornell</span>
        </Typography>
        <Typography className={jumboSub}>{introText}</Typography>
        <Box mt={isMobile ? 8 : 3} paddingBottom={isMobile ? 4 : 0}>
          <Autocomplete drawerOpen={drawerOpen} />
        </Box>

        <Box className={logoContainer}>
          <img className={logoImage} src={logo} alt="3d-logo" />
        </Box>
      </Box>

      <Box style={{ marginLeft: '4.5vw', marginRight: '4.5vw' }}>
        <>
          <Box mb={8}>
            <HomePageApartmentCards
              user={user}
              setUser={setUser}
              data={closeToCampusData.buildingData}
              sortMethod="distanceToCampus"
              orderLowToHigh={true}
              title="Close to Central Campus"
              cardSize="small"
            />
          </Box>
          <Box mb={8}>
            <HomePageApartmentCards
              user={user}
              setUser={setUser}
              data={mostReviewedData.buildingData}
              sortMethod="numReviews"
              orderLowToHigh={false}
              title="Most Reviewed"
              cardSize="small"
            />
          </Box>
          <Box mb={8}>
            <HomePageApartmentCards
              user={user}
              setUser={setUser}
              data={mostLovedData.buildingData}
              sortMethod="avgRating"
              orderLowToHigh={false}
              title="Most Loved"
              cardSize="large"
            />
          </Box>
        </>
      </Box>
    </Container>
  );
};

export default HomePage;

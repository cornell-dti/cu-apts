import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Container, Typography, makeStyles } from '@material-ui/core';
import Autocomplete from '../components/Home/Autocomplete';
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

const useStyles = makeStyles({
  jumboText: {
    color: colors.white,
    fontWeight: 600,
    margin: '0.5em 0 0.5em 0',
  },
  jumboSub: {
    color: colors.white,
    fontWeight: 400,
  },
  rentingBox: {
    marginTop: '1.75em',
    marginBottom: '2em',
  },
  rentingText: {
    marginBottom: '1em',
    color: colors.red1,
  },
});

type returnData = {
  buildingData: CardData[];
  isEnded: boolean;
};

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

const HomePage = ({ user, setUser }: Props): ReactElement => {
  const classes = useStyles();
  const [data, setData] = useState<returnData>({ buildingData: [], isEnded: false });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [drawerOpen] = useState<boolean>(false);
  const path = useLocation();
  const [pathName] = useState(path.pathname);

  useTitle('Home');

  useEffect(() => {
    get<returnData>(`/api/page-data/home/${loadingLength}`, {
      callback: setData,
    });
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useSaveScrollPosition(`scrollPosition_${pathName}`, pathName);

  return (
    <>
      <Box className={styles.JumboTron} mt={isMobile ? -2 : 0}>
        <Container maxWidth="lg">
          <Box py={6}>
            <Typography
              variant="h1"
              style={{
                fontSize: isMobile ? '26px' : '48px',
                marginTop: isMobile ? '10px' : '0px',
              }}
              className={classes.jumboText}
            >
              Discover Housing @ Cornell
            </Typography>
            <Typography
              className={classes.jumboSub}
              style={{
                fontStyle: 'italic',
                fontSize: isMobile ? '16px' : '25px',
                marginTop: isMobile ? '-10px' : '-12px',
              }}
            >
              Easy browsing for off-campus housing
            </Typography>
          </Box>

          <Box pb={5} mx={0} mt={-4} paddingBottom={isMobile ? 4 : 8}>
            <Autocomplete drawerOpen={drawerOpen} />
          </Box>
        </Container>
      </Box>

      <Box marginLeft="5.5vw" marginRight="5.5vw">
        <Container maxWidth="lg">
          <Box textAlign="center" className={classes.rentingBox}>
            <Typography
              variant="h2"
              style={{
                fontSize: isMobile ? '21px' : '35px',
                fontWeight: isMobile ? 650 : 600,
                marginTop: isMobile ? '-15px' : '0px',
                letterSpacing: '0.72px',
              }}
              className={classes.rentingText}
            >
              Find the Best Properties in Ithaca
            </Typography>
            <LocationCards />
          </Box>
          {!isMobile && <ApartmentCards user={user} setUser={setUser} data={data.buildingData} />}
        </Container>
      </Box>
    </>
  );
};

export default HomePage;

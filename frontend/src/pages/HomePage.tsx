import React, { ReactElement, useState, useEffect } from 'react';
import { Box, Container, Typography, makeStyles } from '@material-ui/core';
import Autocomplete from '../components/Home/Autocomplete';
import get from '../utils/get';
import styles from './HomePage.module.scss';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';
import { CardData } from '../App';

const useStyles = makeStyles({
  jumboText: {
    color: 'white',
    fontWeight: 600,
    margin: '0.5em 0 0.5em 0',
  },
  jumboSub: {
    color: 'white',
    fontWeight: 400,
  },
  rentingBox: {
    marginTop: '3em',
    marginBottom: '2em',
  },
  rentingText: {
    fontWeight: 500,
  },
});

const HomePage = (): ReactElement => {
  const classes = useStyles();
  const [homeData, setHomeData] = useState<CardData[]>([]);

  useEffect(() => {
    get<any>(`/pageData/home`, {
      callback: setHomeData,
    });
  }, []);

  return (
    <>
      <Box className={styles.JumboTron}>
        <Container maxWidth="lg">
          <Box py={6}>
            <Typography variant="h3" className={classes.jumboText}>
              Search Renting Companies
            </Typography>
            <Typography variant="subtitle1" className={classes.jumboSub}>
              Search for off-campus housing, review apartments, and share feedback!
            </Typography>
          </Box>
          <Box pb={5} mx={0}>
            <Autocomplete />
          </Box>
        </Container>
      </Box>
      <Box>
        <Container maxWidth="lg">
          <Box pb={3} textAlign="left" className={classes.rentingBox}>
            <Typography variant="h4" className={classes.rentingText}>
              Browse Renting Companies
            </Typography>
          </Box>

          <ApartmentCards data={homeData} />
        </Container>
      </Box>
    </>
  );
};

export default HomePage;

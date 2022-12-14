import React, { ReactElement } from 'react';
import { Box, Container, Typography, makeStyles } from '@material-ui/core';
import Autocomplete from '../components/Home/Autocomplete';
import styles from './HomePage.module.scss';
import LocationCards from '../components/Home/LocationCards';
import { colors } from '../colors';
import ScrollingCards from '../components/ApartmentCard/ScrollingCards';

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
    marginTop: '2em',
    marginBottom: '2em',
  },
  rentingText: {
    marginBottom: '1em',
    fontWeight: 500,
    color: colors.red1,
  },
});

const HomePage = (): ReactElement => {
  const classes = useStyles();
  return (
    <>
      <Box className={styles.JumboTron}>
        <Container maxWidth="lg">
          <Box py={6}>
            <Typography variant="h1" className={classes.jumboText}>
              Discover Housing @ Cornell
            </Typography>
          </Box>
          <Box pb={5} mx={0}>
            <Autocomplete />
          </Box>
        </Container>
      </Box>

      <Box>
        <Container maxWidth="lg">
          <Box textAlign="center" className={classes.rentingBox}>
            <Typography variant="h2" className={classes.rentingText}>
              Find the Best Properties in Ithaca
            </Typography>

            <LocationCards />
          </Box>
          <ScrollingCards API="/page-data/home/" />
        </Container>
      </Box>
    </>
  );
};

export default HomePage;

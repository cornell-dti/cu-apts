import React, { ReactElement, useState, useEffect } from 'react';
import ApartmentCard from '../components/Home/ApartmentCard';
import { Box, Container, Grid, Typography, Link, makeStyles } from '@material-ui/core';
import Autocomplete from '../components/Home/Autocomplete';
import { Apartment } from '../../../common/types/db-types';
import { Link as RouterLink } from 'react-router-dom';
import { get } from '../utils/call';
import styles from './HomePage.module.scss';

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

type HomeCardData = {
  buildingData: Apartment;
  numReviews: number;
  company?: string;
};

const HomePage = (): ReactElement => {
  const classes = useStyles();
  const [homeData, setHomeData] = useState<HomeCardData[]>([]);

  useEffect(() => {
    get<any>(`/homepageData`, {
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

          <Grid container spacing={8}>
            {homeData &&
              homeData.map(({ buildingData, numReviews, company }, index) => {
                const { landlordId } = buildingData;
                return (
                  <Grid item xs={12} md={4}>
                    <Link
                      {...{
                        to: `/landlord/${landlordId}`,
                        style: { textDecoration: 'none' },
                        component: RouterLink,
                      }}
                    >
                      <ApartmentCard
                        key={index}
                        numReviews={numReviews}
                        buildingData={buildingData}
                        company={company}
                      />
                    </Link>
                  </Grid>
                );
              })}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;

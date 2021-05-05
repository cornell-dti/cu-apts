import React, { ReactElement, useState, useEffect } from 'react';
import ApartmentCard from '../components/Home/ApartmentCard';
import { Box, Container, Grid, Typography, Link } from '@material-ui/core';
import Autocomplete from '../components/Home/Autocomplete';
import { Apartment, LandlordWithId, Review } from '../../../common/types/db-types';
import { Link as RouterLink } from 'react-router-dom';
import get from '../utils/get';

const HomePage = (): ReactElement => {
  const [homeData, setHomedata] = useState<any>([]);
  const [buildingData, setBuildingData] = useState<Apartment[]>([]);
  const [landlordData, setLandlordData] = useState<LandlordWithId[]>([]);
  const [allReviews, setAllReviews] = useState<Review[][]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    get<any>(`/homepageData`, setHomedata, undefined);
  }, []);

  useEffect(() => {
    setBuildingData(homeData.buildings);
  }, [homeData]);

  useEffect(() => {
    setLandlordData(homeData.landlords);
  }, [homeData]);

  useEffect(() => {
    if (buildingData && buildingData.length > 2) {
      get<Review[]>(
        `/reviews/landlordId/${buildingData[0].landlordId},${buildingData[1].landlordId},${buildingData[2].landlordId}`,
        setAllReviews,
        undefined
      );
    }
  }, [buildingData]);

  useEffect(() => {
    if (buildingData && buildingData.length > 0 && allReviews && allReviews.length > 2) {
      setLoaded(true);
    }
  }, [buildingData, allReviews]);

  let idToLandlord: { [id: string]: { company: string; reviews: readonly string[] } } = {};

  landlordData &&
    landlordData.reduce((acc, { id, name, reviews }) => {
      if (!(id in acc)) {
        acc[id] = { company: name, reviews };
      }
      return acc;
    }, idToLandlord);

  return (
    <Box bgcolor="grey.100">
      <Container maxWidth="sm">
        <Box py={6}>
          <Typography variant="h5">
            Search for off-campus housing, review apartments, and share feedback!
          </Typography>
        </Box>
        <Box pb={3} textAlign="center">
          <Typography variant="h4">Browse Renting Companies</Typography>
        </Box>
        <Box pb={5} mx={0}>
          <Autocomplete />
        </Box>
      </Container>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {loaded &&
            buildingData.map(({ name, address, landlordId, numBaths, numBeds, photos }, index) => {
              const company = landlordId ? idToLandlord[landlordId].company : '';
              const numReviews = landlordId ? allReviews[index].length : 0;

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
                      name={name}
                      address={address}
                      company={company}
                      numBaths={numBaths}
                      numBeds={numBeds}
                      numReviews={numReviews}
                      photos={photos}
                    />
                  </Link>
                </Grid>
              );
            })}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;

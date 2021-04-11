import React, { ReactElement } from 'react';
import SearchBar from 'material-ui-search-bar';
import ApartmentCard from '../components/Home/ApartmentCard';
import { Box, Container, Grid, Typography } from '@material-ui/core';
import Asynchronous from '../components/Home/Autocomplete';

const HomePage = (): ReactElement => {
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
          <SearchBar placeholder="Search by any location e.g. “301 College Ave" />
          <Asynchronous />
        </Box>
      </Container>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ApartmentCard
              address="117 Eddy St"
              company="Ithaca Renting Company"
              bedsAndBaths="5 Br | 2 B"
              price="$800"
              numReviews="5 Reviews"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ApartmentCard address="117 Eddy St" bedsAndBaths="1 Br | 2 B" />
          </Grid>
          <Grid item xs={12} md={4}>
            <ApartmentCard address="117 Eddy St" bedsAndBaths="5 Br | 2 B" price="$800" />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;

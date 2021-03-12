import React, { ReactElement } from 'react';
import SearchBar from 'material-ui-search-bar';
import ApartmentCard from '../components/Home/ApartmentCard';
import AppBar, { NavbarButton } from '../components/utils/NavBar';
import { Box, Container, Grid, Typography } from '@material-ui/core';

const faq: NavbarButton = {
  label: 'FAQ',
  href: '/faq',
};

const review: NavbarButton = {
  label: 'Reviews',
  href: '/landlord/1',
};
const headersData = [faq, review];

const HomePage = (): ReactElement => {
  return (
    <Box style={{ background: '#f6f6f6' }}>
      <Container>
        <AppBar headersData={headersData} />
        <Box py={7} px={15}>
          <Typography variant="h5">
            Search for off-campus housing, review apartments, and share feedback!
          </Typography>
        </Box>
        <Box py={3} textAlign="center">
          <Typography variant="h4">Browse Renting Companies</Typography>
        </Box>
        <Box pb={5} px={30}>
          <SearchBar placeholder="Search by any location e.g. “301 College Ave" />
        </Box>
        <Grid container justify="space-evenly">
          <ApartmentCard
            address="117 Eddy St"
            company="Ithaca Renting Company"
            bedsAndBaths="5 Br | 2 B"
            price="$800"
            numReviews="5 Reviews"
          />
          <ApartmentCard address="117 Eddy St" bedsAndBaths="1 Br | 2 B" />
          <ApartmentCard
            address="117 Eddy St"
            bedsAndBaths="5 Br | 2 B"
            price="$800"
            topReviewDisplay="3.62 (12)"
          />
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;

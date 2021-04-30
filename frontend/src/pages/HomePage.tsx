import React, { ReactElement, useState } from 'react';
import ApartmentCard from '../components/Home/ApartmentCard';
import { Box, Container, Grid, Typography, Link } from '@material-ui/core';
import Autocomplete from '../components/Home/Autocomplete';
import { Building, LandlordWithId, Review } from '../../../common/types/db-types';
import { Link as RouterLink } from 'react-router-dom';

const dummyDataBuilding: Building[] = [
  {
    name: 'Collegetown Terrace',
    address: '112 Valentine Pl.',
    landlordId: '1',
    numBaths: 2,
    numBeds: 2,
    photos: [],
    area: 'COLLEGETOWN',
  },
  {
    name: 'Eddygate',
    address: '110 Dryden Rd',
    landlordId: '24',
    numBaths: 1,
    numBeds: 2,
    photos: [
      'https://firebasestorage.googleapis.com/v0/b/cuapts-68201.appspot.com/o/889f082e-cd51-44bb-8618-128e1d762cab?alt=media&token=2a73b9ac-9845-4712-a525-568935fecabf',
    ],
    area: 'COLLEGETOWN',
  },
  {
    name: 'Collegetown Court',
    address: '208 Dryden Rd',
    landlordId: '10',
    numBaths: 2,
    numBeds: 4,
    photos: [],
    area: 'COLLEGETOWN',
  },
];

const dummyDataLandlord: LandlordWithId[] = [
  {
    id: '1',
    name: 'Collegetown Terrace',
    contact: '5551234567',
    avgRating: 4,
    photos: [],
    reviews: [],
    properties: [],
  },
  {
    id: '24',
    name: 'Travis Hyde',
    contact: '555678910',
    avgRating: 2,
    photos: [],
    reviews: [],
    properties: [],
  },
  {
    id: '10',
    name: 'Ithaca Renting Company',
    contact: '555678910',
    avgRating: 2,
    photos: [],
    reviews: [],
    properties: [],
  },
];

const dummyDataReviews: Review[] = [
  {
    aptId: null,
    landlordId: '10',
    overallRating: 3,
    detailedRatings: {
      location: 4,
      safety: 5,
      value: 4,
      maintenance: 2,
      communication: 3,
      conditions: 3,
    },
    reviewText: 'Not bad',
    date: new Date(),
    photos: [],
  },
  {
    aptId: null,
    landlordId: '10',
    overallRating: 4,
    detailedRatings: {
      location: 2,
      safety: 4,
      value: 4,
      maintenance: 2,
      communication: 5,
      conditions: 3,
    },
    reviewText: 'Pretty good',
    date: new Date(),
    photos: [],
  },
];

const HomePage = (): ReactElement => {
  const [buildingData] = useState(dummyDataBuilding);
  const [landlordData] = useState(dummyDataLandlord);
  const [reviews] = useState(dummyDataReviews);

  let idToLandlord: { [id: string]: { company: string; reviews: readonly string[] } } = {};
  // eslint-disable-next-line array-callback-return
  landlordData.map(({ id, name, reviews }) => {
    if (!(id in idToLandlord)) {
      idToLandlord[id] = { company: name, reviews };
    }
  });

  let idToNumReviews: { [id: string]: number } = {};
  // eslint-disable-next-line array-callback-return
  reviews.map(({ landlordId }) => {
    idToNumReviews[landlordId] = landlordId in idToNumReviews ? idToNumReviews[landlordId] + 1 : 1;
  });

  console.log(JSON.stringify(idToNumReviews));

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
          {buildingData.map(({ name, address, landlordId, numBaths, numBeds, photos }, index) => {
            let company = '';
            let numReviews = 0;
            if (landlordId) {
              company = idToLandlord[landlordId].company;
              if (idToNumReviews[landlordId]) {
                numReviews = idToNumReviews[landlordId];
              }
            }
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

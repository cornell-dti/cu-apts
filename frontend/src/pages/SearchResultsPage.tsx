import { Box, Container, Typography, Grid, makeStyles } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '../utils/call';
import { LandlordOrApartmentWithLabel, LandlordWithLabel } from '../../../common/types/db-types';
import LandlordCard from '../components/LandlordCard/LandlordCard';
import { colors } from '../colors';

const useStyles = makeStyles({
  landlordTitle: {
    fontWeight: 600,
  },
  card: {
    height: '100%',
    borderRadius: '10px',
    backgroundColor: colors.landlordCardRed,
  },
});
const SearchResultsPage = (): ReactElement => {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState<LandlordOrApartmentWithLabel[]>([]);
  const query = location.search.substring(3);
  const { landlordTitle } = useStyles();

  useEffect(() => {
    get<LandlordOrApartmentWithLabel[]>(`/search?q=${query}`, {
      callback: (data) => {
        setSearchResults(data);
      },
    });
  }, [query]);

  return (
    <Container>
      <Box pb={5}>
        <Box pb={2}>
          <Typography variant="h5" align="left" className={landlordTitle}>
            Placeholder for Apartment Cards
          </Typography>
        </Box>
        <Grid container spacing={2}></Grid>
      </Box>
    </Container>
  );
};

export default SearchResultsPage;

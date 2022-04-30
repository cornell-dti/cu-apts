import { Box, Container, Typography, Grid, makeStyles } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '../utils/call';
import { LandlordOrApartmentWithLabel, LandlordWithLabel } from '../../../common/types/db-types';
import LandlordCard from '../components/LandlordCard/LandlordCard';
import { colors } from '../colors';

const useStyles = makeStyles({
  img: {
    borderRadius: '50%',
    height: '205px',
    width: '100%',
    padding: '17px',
  },
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
  const classes = useStyles();

  useEffect(() => {
    get<LandlordOrApartmentWithLabel[]>(`/search?q=${query}`, {
      callback: (data) => {
        setSearchResults(data);
      },
    });
  }, [query]);

  // if properties is in searchItem, then it has the LandlordWithLabel type
  function isLandlord(searchItem: LandlordOrApartmentWithLabel): searchItem is LandlordWithLabel {
    return 'properties' in searchItem;
  }
  const landlordSearchResults: LandlordWithLabel[] = searchResults.filter(isLandlord).slice(0, 3);
  return (
    <Container>
      <Box pb={3}>
        <Typography variant="h5" align="left" className={classes.landlordTitle}>
          Landlords
        </Typography>
        <Grid container spacing={4}>
          {landlordSearchResults.map((landlordSearchResult) => (
            <Grid item xs={4} md={4}>
              <LandlordCard landlordData={landlordSearchResult} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default SearchResultsPage;

import { Box, Container, Typography, Grid, makeStyles } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '../utils/call';
import {
  ApartmentWithLabel,
  LandlordOrApartmentWithLabel,
  LandlordWithLabel,
} from '../../../common/types/db-types';
import LandlordCard from '../components/LandlordCard/LandlordCard';
import { colors } from '../colors';
import { CardData } from '../App';

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

  // const [aptData, setAptData] = useState<CardData[]>([]);
  // filter only apts & convert that to CardData

  useEffect(() => {
    get<LandlordOrApartmentWithLabel[]>(`/search?q=${query}`, {
      callback: (data) => {
        setSearchResults(data);
      },
    });
  }, [query]);

  function isApartment(searchItem: LandlordOrApartmentWithLabel): searchItem is ApartmentWithLabel {
    return 'address' in searchItem;
  }

  const apartmentSearchResults: ApartmentWithLabel[] = searchResults
    .filter(isApartment)
    .slice(0, 3);

  // TODO: convert the data type
  // const appSearchData: CardData[] = {};

  return (
    <Container>
      <Box pb={5}>
        <Box pb={2}></Box>
        <Grid container spacing={2}>
          {/* {landlordSearchResults.map((landlordSearchResult) => (
            <Grid item xs={4} md={4}>
              <LandlordCard landlordData={landlordSearchResult} />
            </Grid>
          ))} */}
        </Grid>
      </Box>
    </Container>
  );
};

export default SearchResultsPage;

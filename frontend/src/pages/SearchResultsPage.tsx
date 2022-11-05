import { Container, Typography, makeStyles } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '../utils/call';
import { colors } from '../colors';
import { CardData } from '../App';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';

const useStyles = makeStyles({
  searchText: {
    color: colors.black,
    fontWeight: 600,
    fontSize: 35,
    margin: '0.5em 0 0.5em 0',
  },
});

const SearchResultsPage = (): ReactElement => {
  const classes = useStyles();
  const location = useLocation();
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
  const query = location.search.substring(3);

  useEffect(() => {
    get<CardData[]>(`/search-results?q=${query}`, {
      callback: setSearchResults,
    });
  }, [query]);

  return (
    <Container>
      <Typography className={classes.searchText}>Search Results For "{query}"</Typography>
      <ApartmentCards data={searchResults} />
    </Container>
  );
};

export default SearchResultsPage;

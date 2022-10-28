import { Box, Container, Typography, Grid, makeStyles } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '../utils/call';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';
import { CardData } from '../App';

const SearchResultsPage = (): ReactElement => {
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
      Search Results
      <ApartmentCards data={searchResults} />
    </Container>
  );
};

export default SearchResultsPage;

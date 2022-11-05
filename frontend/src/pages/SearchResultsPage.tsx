import { Container, Typography, makeStyles } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '../utils/call';
import { colors } from '../colors';
import { CardData } from '../App';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';

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
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
  const query = location.search.substring(3);

  useEffect(() => {
    get<CardData[]>(`/search-results?q=${query}`, {
      callback: setSearchResults,
    });
  }, [query]);

  return (
    <Container>
      <ApartmentCards data={searchResults} />
    </Container>
  );
};

export default SearchResultsPage;

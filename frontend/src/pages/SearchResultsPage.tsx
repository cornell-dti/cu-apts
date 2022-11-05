import { Container, Typography, makeStyles } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '../utils/call';
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
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
  const query = location.search.substring(3);
  const { landlordTitle } = useStyles();

  useEffect(() => {}, [query]);

  return (
    <Container>
      <Typography variant="h5" align="left" className={landlordTitle}>
        Landlords
      </Typography>
    </Container>
  );
};

export default SearchResultsPage;

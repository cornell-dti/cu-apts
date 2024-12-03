import { Container, Typography, makeStyles, useMediaQuery } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '../utils/call';
import { colors } from '../colors';
import { CardData } from '../App';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';
import { useTitle } from '../utils';

const useStyles = makeStyles({
  searchText: {
    color: colors.black,
    fontWeight: 500,
  },
});

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

/**
 * SearchResultsPage Component – Displays search results with apartment cards based on a user's query.
 *
 * @remarks
 * The page fetches the search results by calling a backend API. The resulting apartments and landlords
 * are then listed and displayed. The page adjusts for mobile and desktop versions.
 *
 * @param {firebase.User | null} props.user – The currently logged-in Firebase user or null
 * if no user is logged in.
 * @param {React.Dispatch<React.SetStateAction<firebase.User | null>>} props.setUser - A
 * function to update the `user` state.
 *
 * @return {ReactElement} – The rendered JSX structure of the SearchResultsPage.
 */

const SearchResultsPage = ({ user, setUser }: Props): ReactElement => {
  const { searchText } = useStyles();
  const location = useLocation();
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
  const query = location.search.substring(3);
  const isMobile = useMediaQuery('(max-width:600px)');

  useTitle('Search Result');

  useEffect(() => {
    get<CardData[]>(`/api/search-results?q=${query}`, {
      callback: setSearchResults,
    });
  }, [query]);

  return (
    <Container>
      <Typography className={searchText} style={{ fontSize: isMobile ? '20px' : '30px' }}>
        Search results for "{query}"
      </Typography>
      <ApartmentCards user={user} setUser={setUser} data={searchResults} />
    </Container>
  );
};

export default SearchResultsPage;

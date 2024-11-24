import { Container, Typography, makeStyles, useMediaQuery } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '../utils/call';
import { colors } from '../colors';
import { CardData } from '../App';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';
import { useTitle } from '../utils';
import { useSaveScrollPosition } from '../utils/saveScrollPosition';

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

const SearchResultsPage = ({ user, setUser }: Props): ReactElement => {
  const { searchText } = useStyles();
  const path = useLocation();
  const [pathName] = useState(path.pathname);
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
  const query = path.search.substring(3);
  const isMobile = useMediaQuery('(max-width:600px)');

  useTitle('Search Result');

  useEffect(() => {
    get<CardData[]>(`/api/search-results?q=${query}`, {
      callback: setSearchResults,
    });
  }, [query]);

  useSaveScrollPosition(`scrollPosition_${pathName}`, pathName);
  const saveResultsCount = (count: number) => {
    sessionStorage.setItem(`resultsCount_search_${query}`, count.toString());
  };

  return (
    <Container>
      <Typography className={searchText} style={{ fontSize: isMobile ? '20px' : '30px' }}>
        Search results for "{query}"
      </Typography>
      <ApartmentCards
        user={user}
        initialResultsToShow={parseInt(
          sessionStorage.getItem(`resultsCount_search_${query}`) || '5',
          10
        )}
        setUser={setUser}
        data={searchResults}
        onMoreResultsLoaded={saveResultsCount}
      />
    </Container>
  );
};

export default SearchResultsPage;

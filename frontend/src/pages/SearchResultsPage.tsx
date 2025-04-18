import { Container, Typography, makeStyles, useMediaQuery } from '@material-ui/core';
import React, { ReactElement, useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '../utils/call';
import { colors } from '../colors';
import { CardData } from '../App';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';
import { useTitle } from '../utils';
import { useSaveScrollPosition } from '../utils/saveScrollPosition';
import { FilterState } from '../components/Search/FilterSection';

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

const defaultFilters: FilterState = {
  locations: [],
  minPrice: '',
  maxPrice: '',
  bedrooms: 0,
  bathrooms: 0,
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
  const path = useLocation();
  const [pathName] = useState(path.pathname);
  const [searchResults, setSearchResults] = useState<CardData[]>([]);

  // Parse URL parameters using useMemo
  const { query, filters } = useMemo(() => {
    const params = new URLSearchParams(path.search);
    return {
      query: params.get('q') || '',
      filters: params.get('filters')
        ? JSON.parse(decodeURIComponent(params.get('filters') || '{}'))
        : defaultFilters,
    };
  }, [path.search]);

  const isMobile = useMediaQuery('(max-width:600px)');

  useTitle('Search Result');

  useEffect(() => {
    console.log('Received search query:', query);
    console.log('Received filters:', filters);

    const params = new URLSearchParams();

    if (query) {
      params.append('q', query);
    }

    if (filters.locations && filters.locations.length > 0) {
      params.append('locations', filters.locations.join(','));
    }

    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice);
    }

    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice);
    }

    if (filters.bedrooms > 0) {
      params.append('bedrooms', filters.bedrooms.toString());
    }

    if (filters.bathrooms > 0) {
      params.append('bathrooms', filters.bathrooms.toString());
    }

    get<CardData[]>(`/api/search-with-query-and-filters?${params.toString()}`, {
      callback: setSearchResults,
    });
  }, [query, filters]);

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

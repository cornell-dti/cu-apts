import { Container, Typography, makeStyles, useMediaQuery } from '@material-ui/core';
import React, { ReactElement, useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '../utils/call';
import { colors } from '../colors';
import { CardData } from '../App';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';
import { useTitle } from '../utils';
import { useSaveScrollPosition } from '../utils/saveScrollPosition';
import { defaultFilters } from '../components/Search/FilterSection';
import Autocomplete from '../components/Search/Autocomplete';
import SearchResultsPageApartmentCards from '../components/ApartmentCard/SearchResultsPageApartmentCards';
import SearchResultsMap from '../components/Search/SearchResultsMap';
import SortDropDown from '../components/Search/SortDropDown';
import { ApartmentWithId } from '../../../common/types/db-types';

const useStyles = makeStyles({
  header: {
    marginLeft: '0.5vw',
    marginRight: '0.5vw',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    height: '80vh',
  },
  searchResultsContainer: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    minHeight: '300px',
  },
  sortDropDown: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  searchBar: {
    flex: 1,
    maxWidth: '91.5%',
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
  const { header, mainContent, searchResultsContainer, mapContainer, sortDropDown, searchBar } =
    useStyles();
  const path = useLocation();
  const [pathName] = useState(path.pathname);
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
  const [additionalLocation, setAdditionalLocation] = useState<CardData[]>([]);
  const [additionalPrice, setAdditionalPrice] = useState<CardData[]>([]);
  const [additionalBedBath, setAdditionalBedBath] = useState<CardData[]>([]);
  const [sortBy, setSortBy] = useState<keyof CardData | keyof ApartmentWithId | 'originalOrder'>(
    'originalOrder'
  );
  const [sortLowToHigh, setSortLowToHigh] = useState<boolean>(false);
  // Parse URL parameters using useMemo
  const { query, filters } = useMemo(() => {
    window.scrollTo(0, 0);
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

    // Add sortBy parameter if it's not 'originalOrder'
    if (filters.initialSortBy && filters.initialSortBy !== 'originalOrder') {
      params.append('sortBy', filters.initialSortBy);
    }

    params.append('sortLowToHigh', filters.initialSortLowToHigh.toString());

    get<{
      main: CardData[];
      additionalLocation: CardData[];
      additionalPrice: CardData[];
      additionalBedBath: CardData[];
    }>(`/api/search-with-query-and-filters?${params.toString()}&size=21`, {
      callback: (data) => {
        // Defensive: handle both old and new API response formats
        if (data && typeof data === 'object' && 'main' in data) {
          setSearchResults(data.main || []);
          setAdditionalLocation(data.additionalLocation || []);
          setAdditionalPrice(data.additionalPrice || []);
          setAdditionalBedBath(data.additionalBedBath || []);
        } else {
          // Fallback for unexpected response format
          console.warn('Unexpected API response format:', data);
          setSearchResults([]);
          setAdditionalLocation([]);
          setAdditionalPrice([]);
          setAdditionalBedBath([]);
        }
      },
    });

    setSortBy(filters.initialSortBy);
    setSortLowToHigh(filters.initialSortLowToHigh);
  }, [query, filters]);

  // useSaveScrollPosition(`scrollPosition_${pathName}`, pathName);

  const saveResultsCount = (count: number) => {
    sessionStorage.setItem(`resultsCount_search_${query}`, count.toString());
  };

  // Helper: Generate section title for additional results
  const getAdditionalSectionTitle = (type: 'location' | 'price' | 'bedBath'): string => {
    if (type === 'location' && filters.locations && filters.locations.length > 0) {
      return `More at ${filters.locations.join(', ')}`;
    }
    if (type === 'price' && (filters.minPrice || filters.maxPrice)) {
      const min = filters.minPrice ? `$${filters.minPrice}` : '';
      const max = filters.maxPrice ? `$${filters.maxPrice}` : '';
      if (min && max) return `More within ${min} - ${max}`;
      if (min) return `More above ${min}`;
      if (max) return `More under ${max}`;
    }
    if (type === 'bedBath') {
      const bedText =
        filters.bedrooms > 0 ? `${filters.bedrooms} bedroom${filters.bedrooms > 1 ? 's' : ''}` : '';
      const bathText =
        filters.bathrooms > 0
          ? `${filters.bathrooms} bathroom${filters.bathrooms > 1 ? 's' : ''}`
          : '';
      if (bedText && bathText) return `More with ${bedText} and ${bathText}`;
      if (bedText) return `More with ${bedText}`;
      if (bathText) return `More with ${bathText}`;
    }
    return '';
  };

  const sortSection = () => {
    return (
      <div className={sortDropDown}>
        <SortDropDown
          menuItems={[
            {
              item: 'Highest Rating',
              callback: () => {
                setSortBy('avgRating');
                setSortLowToHigh(false);
              },
            },
            {
              item: 'Most Reviewed',
              callback: () => {
                setSortBy('numReviews');
                setSortLowToHigh(false);
              },
            },
            {
              item: 'Lowest Price',
              callback: () => {
                setSortBy('avgPrice');
                setSortLowToHigh(true);
              },
            },
            {
              item: 'Highest Price',
              callback: () => {
                setSortBy('avgPrice');
                setSortLowToHigh(false);
              },
            },
          ]}
          isMobile={isMobile}
        />
      </div>
    );
  };

  return (
    <Container maxWidth="xl">
      <div className={header}>
        {!isMobile ? (
          <>
            <div className={searchBar}>
              <Autocomplete drawerOpen={false} />
            </div>
            {sortSection()}
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
            }}
          >
            <div className={searchBar}>
              <Autocomplete drawerOpen={false} />
            </div>
            {sortSection()}
          </div>
        )}
      </div>
      {!isMobile ? (
        <div className={mainContent}>
          <div className={searchResultsContainer}>
            {/* Main Results */}
            <SearchResultsPageApartmentCards
              user={user}
              setUser={setUser}
              data={searchResults}
              sortMethod={sortBy}
              orderLowToHigh={sortLowToHigh}
            />

            {/* Additional Location Section */}
            {additionalLocation.length > 0 && (
              <>
                <Typography
                  variant="h5"
                  style={{ marginTop: '40px', marginBottom: '20px', fontWeight: 'bold' }}
                >
                  {getAdditionalSectionTitle('location')}
                </Typography>
                <SearchResultsPageApartmentCards
                  user={user}
                  setUser={setUser}
                  data={additionalLocation}
                  sortMethod={sortBy}
                  orderLowToHigh={sortLowToHigh}
                />
              </>
            )}

            {/* Additional Price Section */}
            {additionalPrice.length > 0 && (
              <>
                <Typography
                  variant="h5"
                  style={{ marginTop: '40px', marginBottom: '20px', fontWeight: 'bold' }}
                >
                  {getAdditionalSectionTitle('price')}
                </Typography>
                <SearchResultsPageApartmentCards
                  user={user}
                  setUser={setUser}
                  data={additionalPrice}
                  sortMethod={sortBy}
                  orderLowToHigh={sortLowToHigh}
                />
              </>
            )}

            {/* Additional Bed/Bath Section */}
            {additionalBedBath.length > 0 && (
              <>
                <Typography
                  variant="h5"
                  style={{ marginTop: '40px', marginBottom: '20px', fontWeight: 'bold' }}
                >
                  {getAdditionalSectionTitle('bedBath')}
                </Typography>
                <SearchResultsPageApartmentCards
                  user={user}
                  setUser={setUser}
                  data={additionalBedBath}
                  sortMethod={sortBy}
                  orderLowToHigh={sortLowToHigh}
                />
              </>
            )}
          </div>
          <div className={mapContainer}>
            <SearchResultsMap
              apartments={searchResults}
              isMobile={isMobile}
              user={user}
              setUser={setUser}
            />
          </div>
        </div>
      ) : (
        <div
          className={mainContent}
          style={{
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            height: 'auto',
            paddingBottom: '20px',
          }}
        >
          <div className={mapContainer}>
            <SearchResultsMap
              apartments={searchResults}
              isMobile={isMobile}
              user={user}
              setUser={setUser}
            />
          </div>
          <div className={searchResultsContainer} style={{ width: '100%', maxWidth: '100%' }}>
            {/* Main Results */}
            <SearchResultsPageApartmentCards
              user={user}
              setUser={setUser}
              data={searchResults}
              sortMethod={sortBy}
              orderLowToHigh={sortLowToHigh}
            />

            {/* Additional Location Section */}
            {additionalLocation.length > 0 && (
              <>
                <Typography
                  variant="h5"
                  style={{ marginTop: '40px', marginBottom: '20px', fontWeight: 'bold' }}
                >
                  {getAdditionalSectionTitle('location')}
                </Typography>
                <SearchResultsPageApartmentCards
                  user={user}
                  setUser={setUser}
                  data={additionalLocation}
                  sortMethod={sortBy}
                  orderLowToHigh={sortLowToHigh}
                />
              </>
            )}

            {/* Additional Price Section */}
            {additionalPrice.length > 0 && (
              <>
                <Typography
                  variant="h5"
                  style={{ marginTop: '40px', marginBottom: '20px', fontWeight: 'bold' }}
                >
                  {getAdditionalSectionTitle('price')}
                </Typography>
                <SearchResultsPageApartmentCards
                  user={user}
                  setUser={setUser}
                  data={additionalPrice}
                  sortMethod={sortBy}
                  orderLowToHigh={sortLowToHigh}
                />
              </>
            )}

            {/* Additional Bed/Bath Section */}
            {additionalBedBath.length > 0 && (
              <>
                <Typography
                  variant="h5"
                  style={{ marginTop: '40px', marginBottom: '20px', fontWeight: 'bold' }}
                >
                  {getAdditionalSectionTitle('bedBath')}
                </Typography>
                <SearchResultsPageApartmentCards
                  user={user}
                  setUser={setUser}
                  data={additionalBedBath}
                  sortMethod={sortBy}
                  orderLowToHigh={sortLowToHigh}
                />
              </>
            )}
          </div>
        </div>
      )}
    </Container>
  );
};

export default SearchResultsPage;

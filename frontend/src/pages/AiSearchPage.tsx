import React, { ReactElement, useMemo } from 'react';
import { Container, Typography, makeStyles, useMediaQuery } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import { useTitle } from '../utils';
import { colors } from '../colors';
import { useAiSearch } from '../hooks/useAiSearch';
import Autocomplete from '../components/Search/Autocomplete';
import BlockRenderer from '../components/AiSearch/BlockRenderer';
import { toMapCardData } from '../components/AiSearch/listingCardData';
import SearchResultsMap from '../components/Search/SearchResultsMap';
import ProgressSpinner from '../components/utils/ProgressSpinner';

const useStyles = makeStyles((theme) => ({
  // Figma: the search bar sits directly under the nav at x=38; the right edge is left open so the
  // map runs to the window edge. Narrow screens get a symmetric gutter instead.
  container: {
    marginBottom: '40px',
    paddingLeft: '38px',
    paddingRight: 0,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: '16px',
      paddingRight: '16px',
    },
  },
  searchBar: {
    maxWidth: '821px',
    marginBottom: '24px',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '16px',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
  blocks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: '1 1 869px',
    maxWidth: '869px',
    minWidth: 0,
    // Figma puts the column at x=40, 2px right of the search bar.
    marginLeft: '2px',
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
  },
  // Figma map: 458x601 with a 10px radius. Stays in view beside the scrolling blocks on desktop.
  map: {
    flex: '1 1 458px',
    maxWidth: '458px',
    minWidth: 0,
    height: '601px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: colors.gray5,
    position: 'sticky',
    top: '16px',
    [theme.breakpoints.down('sm')]: {
      flex: 'none',
      position: 'static',
      width: '100%',
      maxWidth: 'none',
      height: '320px',
    },
  },
  message: {
    fontSize: '18px',
    lineHeight: '28px',
    color: colors.black,
  },
}));

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

/**
 * AiSearchPage – AI search results. Reads the query from `?q=`, loads the response and renders
 * its blocks in the left column with a map area alongside (stacked below on narrow screens).
 */
const AiSearchPage = ({ user, setUser }: Props): ReactElement => {
  const { container, searchBar, content, blocks, map, message } = useStyles();
  const query = new URLSearchParams(useLocation().search).get('q') ?? '';
  const { data, loading, error } = useAiSearch(query);
  useTitle('AI Search');
  const isMobile = useMediaQuery('(max-width:600px)');
  // Memoized: SearchResultsMap re-centers whenever it gets a new array.
  const mapApartments = useMemo(() => toMapCardData(data?.listings ?? {}), [data]);

  const renderBlocks = (): ReactElement => {
    if (loading) {
      return <ProgressSpinner />;
    }
    if (error) {
      return <Typography className={message}>Something went wrong. Please try again.</Typography>;
    }
    if (!data) {
      return <Typography className={message}>Enter a search to see results.</Typography>;
    }
    if (data.blocks.length === 0) {
      return <Typography className={message}>No results</Typography>;
    }
    return (
      <>
        {data.blocks.map((block, index) => (
          <BlockRenderer key={index} block={block} listings={data.listings} />
        ))}
      </>
    );
  };

  return (
    <Container maxWidth="xl" disableGutters className={container}>
      <div className={searchBar}>
        <Autocomplete drawerOpen={false} aiMode variant="aiResults" />
      </div>
      <div className={content}>
        <div className={blocks}>{renderBlocks()}</div>
        <div className={map}>
          <SearchResultsMap
            apartments={mapApartments}
            isMobile={isMobile}
            height="100%"
            user={user}
            setUser={setUser}
          />
        </div>
      </div>
    </Container>
  );
};

export default AiSearchPage;

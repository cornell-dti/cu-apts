import React, { ReactElement, useMemo } from 'react';
import { Container, Typography, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
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
  // Figma: a 1440px frame with 38px side padding. Centered, so wider screens get equal space on
  // both sides. Narrow screens use a 16px gutter instead.
  container: {
    maxWidth: '1440px',
    marginBottom: '40px',
    paddingLeft: '38px',
    paddingRight: '38px',
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
    // Figma: the column ends at x=859 and the map image starts at x=930 (71px apart).
    gap: '71px',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
      // Stacked, the gap is the space between the blocks and the map.
      gap: '16px',
    },
  },
  blocks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    // Fills whatever the map leaves.
    flex: '1 1 0',
    minWidth: 0,
  },
  // Figma map: 458x601 with a 10px radius. Stays in view beside the scrolling blocks on desktop.
  map: {
    flex: '0 0 458px',
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
  // Same breakpoint at which the map stacks under the blocks.
  const stacked = useMediaQuery(useTheme().breakpoints.down('sm'));
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
    <Container maxWidth={false} disableGutters className={container}>
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
            // Beside the blocks plain scroll zooms; stacked, the page must still scroll past the map.
            gestureHandling={stacked ? 'cooperative' : 'greedy'}
            user={user}
            setUser={setUser}
          />
        </div>
      </div>
    </Container>
  );
};

export default AiSearchPage;

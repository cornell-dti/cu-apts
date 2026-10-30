import React, { ReactElement } from 'react';
import { Container, Typography, makeStyles } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import { useTitle } from '../utils';
import { colors } from '../colors';
import { useAiSearch } from '../hooks/useAiSearch';
import Autocomplete from '../components/Search/Autocomplete';
import BlockRenderer from '../components/AiSearch/BlockRenderer';
import ProgressSpinner from '../components/utils/ProgressSpinner';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: '93px',
    marginBottom: '40px',
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
  },
  // Placeholder for the map, which is built in a later step.
  map: {
    flex: '1 1 519px',
    maxWidth: '519px',
    minWidth: 0,
    height: '682px',
    borderRadius: '10px',
    backgroundColor: colors.gray5,
    [theme.breakpoints.down('sm')]: {
      flex: 'none',
      width: '100%',
    },
  },
  message: {
    fontSize: '18px',
    lineHeight: '28px',
    color: colors.black,
  },
}));

/**
 * AiSearchPage – AI search results. Reads the query from `?q=`, loads the response and renders
 * its blocks in the left column with a map area alongside (stacked below on narrow screens).
 */
const AiSearchPage = (): ReactElement => {
  const { container, searchBar, content, blocks, map, message } = useStyles();
  const query = new URLSearchParams(useLocation().search).get('q') ?? '';
  const { data, loading, error } = useAiSearch(query);
  useTitle('AI Search');

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
          <BlockRenderer key={index} block={block} />
        ))}
      </>
    );
  };

  return (
    <Container maxWidth="xl" className={container}>
      <div className={searchBar}>
        <Autocomplete drawerOpen={false} aiMode variant="aiResults" />
      </div>
      <div className={content}>
        <div className={blocks}>{renderBlocks()}</div>
        <div className={map} />
      </div>
    </Container>
  );
};

export default AiSearchPage;

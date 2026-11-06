import React, { ReactElement } from 'react';
import { Button, IconButton, Paper, Typography, makeStyles } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { useHistory } from 'react-router-dom';
import { colors } from '../../colors';
import {
  clearRecentSearches,
  removeSearch,
  SavedSearch,
  searchLabel,
  searchUrl,
} from '../../utils/savedSearches';
import { useSavedSearches } from '../../utils/useSavedSearches';
import { useToggleSavedSearch } from '../../utils/useToggleSavedSearch';

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
  showRecent?: boolean;
  onSelect?: () => void;
};

const useStyles = makeStyles({
  paper: { padding: '12px 16px', maxHeight: 360, overflowY: 'auto' },
  heading: { fontWeight: 600, marginTop: 8, marginBottom: 4 },
  row: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    gap: 4,
  },
  searchLink: {
    flex: 1,
    minWidth: 0,
    textAlign: 'left',
    textTransform: 'none',
    justifyContent: 'flex-start',
    color: colors.black,
  },
  label: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  actions: { display: 'flex', justifyContent: 'flex-end', marginTop: 4 },
});

const SearchHistoryPanel = ({
  user,
  setUser,
  showRecent = true,
  onSelect,
}: Props): ReactElement => {
  const classes = useStyles();
  const history = useHistory();
  const { searches, loading, error: loadError } = useSavedSearches(user);
  const { toggle, saving, error } = useToggleSavedSearch(user, setUser);
  const saved = searches
    .filter((item) => item.savedAt)
    .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  const recent = searches
    .filter((item) => !item.savedAt)
    .sort((a, b) => b.lastSearchedAt - a.lastSearchedAt);

  const renderRow = (item: SavedSearch) => (
    <div className={classes.row} key={item.id}>
      <Button
        className={classes.searchLink}
        onClick={() => {
          history.push(searchUrl(item));
          onSelect?.();
        }}
      >
        <span className={classes.label}>
          {searchLabel(item)}
          {item.mode === 'ai' ? ' (AI)' : ''}
        </span>
      </Button>
      <IconButton
        size="small"
        disabled={saving || loading}
        aria-label={item.savedAt ? 'Unsave search' : 'Save search'}
        onClick={() => toggle(item.mode, item.query, item.filters)}
      >
        {item.savedAt ? <StarIcon color="primary" /> : <StarBorderIcon />}
      </IconButton>
      {!item.savedAt && (
        <IconButton
          size="small"
          aria-label="Remove search from history"
          onClick={() => removeSearch(item.id, user?.uid)}
        >
          <DeleteOutlineIcon />
        </IconButton>
      )}
    </div>
  );

  return (
    <Paper className={classes.paper} elevation={showRecent ? 3 : 0}>
      <Typography variant="subtitle1" className={classes.heading}>
        Saved searches
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {user ? 'Saved to your account' : 'Sign in to save searches to your account'}
      </Typography>
      {(error || loadError) && <Typography color="error">{error || loadError}</Typography>}
      {loading && <Typography>Loading saved searches...</Typography>}
      {saved.length ? saved.map(renderRow) : <Typography>No saved searches yet.</Typography>}
      {showRecent && (
        <>
          <Typography variant="subtitle1" className={classes.heading}>
            Recent searches
          </Typography>
          {recent.length ? recent.map(renderRow) : <Typography>No recent searches yet.</Typography>}
          {recent.length > 0 && (
            <div className={classes.actions}>
              <Button size="small" onClick={() => clearRecentSearches(user?.uid)}>
                Clear history
              </Button>
            </div>
          )}
        </>
      )}
    </Paper>
  );
};

export default SearchHistoryPanel;

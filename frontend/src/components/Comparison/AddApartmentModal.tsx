import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  Typography,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  makeStyles,
  CircularProgress,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import TuneIcon from '@material-ui/icons/Tune';
import { colors } from '../../colors';
import { CardData } from '../../App';
import SearchResultCard from './SearchResultCard';
import SavedAptCard from './SavedAptCard';
import axios from 'axios';
import { createAuthHeaders, getUser } from '../../utils/firebase';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (apt: CardData) => void;
  excludeIds: string[];
  user: firebase.User | null;
};

const useStyles = makeStyles(() => ({
  dialogPaper: {
    maxWidth: 640,
    width: '100%',
    borderRadius: 12,
    padding: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px 24px 0',
  },
  title: {
    fontWeight: 600,
    fontSize: 22,
    lineHeight: '32px',
    color: colors.black,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: '20px',
    color: colors.gray1,
    marginTop: 4,
  },
  tabRow: {
    display: 'flex',
    gap: 8,
    padding: '16px 24px',
  },
  tab: {
    padding: '8px 20px',
    borderRadius: 20,
    border: '1px solid #eaeaea',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    color: colors.gray1,
    fontFamily: '"Work Sans", sans-serif',
    transition: 'all 0.15s',
    '&:hover': {
      borderColor: colors.red1,
    },
  },
  tabActive: {
    borderColor: colors.red1,
    color: colors.red1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: '0 24px',
    minHeight: 300,
    maxHeight: 420,
    overflowY: 'auto' as const,
  },
  searchField: {
    marginBottom: 16,
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  savedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    padding: '16px 24px 24px',
  },
  cancelBtn: {
    borderRadius: 20,
    padding: '10px 28px',
    textTransform: 'none' as const,
    fontSize: 14,
    fontWeight: 500,
    color: colors.gray1,
    backgroundColor: '#eaeaea',
    '&:hover': {
      backgroundColor: '#d5d5d5',
    },
  },
  confirmBtn: {
    borderRadius: 20,
    padding: '10px 28px',
    textTransform: 'none' as const,
    fontSize: 14,
    fontWeight: 500,
    color: colors.white,
    backgroundColor: colors.red1,
    '&:hover': {
      backgroundColor: colors.red7,
    },
    '&:disabled': {
      backgroundColor: colors.gray2,
      color: colors.white,
    },
  },
  emptyText: {
    textAlign: 'center' as const,
    color: colors.gray1,
    padding: '40px 0',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 0',
  },
}));

const AddApartmentModal = ({ open, onClose, onConfirm, excludeIds, user }: Props) => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState<'saved' | 'search'>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
  const [savedApts, setSavedApts] = useState<CardData[]>([]);
  const [selectedApt, setSelectedApt] = useState<CardData | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedApt(null);
      setSearchQuery('');
      setSearchResults([]);
      return;
    }
    if (user) {
      fetchSavedApartments();
    }
  }, [open, user]);

  const fetchSavedApartments = async () => {
    setLoadingSaved(true);
    try {
      const curUser = await getUser();
      if (!curUser) return;
      const token = await curUser.getIdToken(true);
      const response = await axios.get<CardData[]>(
        '/api/saved-apartments',
        createAuthHeaders(token)
      );
      setSavedApts(response.data);
    } catch (err) {
      console.error('Error fetching saved apartments:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const fetchSearchResults = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const response = await axios.get<CardData[]>(
        `/api/search-results?q=${encodeURIComponent(query)}`
      );
      setSearchResults(response.data);
    } catch (err) {
      console.error('Error searching apartments:', err);
    } finally {
      setLoadingSearch(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSearchResults(val), 300);
  };

  const handleSelect = (apt: CardData) => {
    if (selectedApt?.buildingData.id === apt.buildingData.id) {
      setSelectedApt(null);
    } else {
      setSelectedApt(apt);
    }
  };

  const handleConfirm = () => {
    if (selectedApt) {
      onConfirm(selectedApt);
      onClose();
    }
  };

  const filterExcluded = (items: CardData[]) =>
    items.filter((item) => !excludeIds.includes(item.buildingData.id));

  const filteredSaved = filterExcluded(savedApts);
  const filteredSearch = filterExcluded(searchResults);

  return (
    <Dialog open={open} onClose={onClose} classes={{ paper: classes.dialogPaper }} maxWidth={false}>
      <div className={classes.header}>
        <div>
          <Typography className={classes.title}>Add an apartment to compare</Typography>
          <Typography className={classes.subtitle}>
            Choose from your saved properties or search to add new apartments to your side-by-side
            view
          </Typography>
        </div>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>

      <div className={classes.tabRow}>
        <button
          className={`${classes.tab} ${activeTab === 'saved' ? classes.tabActive : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Properties
        </button>
        <button
          className={`${classes.tab} ${activeTab === 'search' ? classes.tabActive : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search Properties
        </button>
      </div>

      <div className={classes.content}>
        {activeTab === 'search' && (
          <>
            <TextField
              className={classes.searchField}
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Search by address or with filters"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <TuneIcon style={{ color: colors.gray2, marginRight: 4 }} />
                    <SearchIcon style={{ color: colors.gray2 }} />
                  </InputAdornment>
                ),
              }}
            />
            {loadingSearch ? (
              <div className={classes.loading}>
                <CircularProgress size={32} />
              </div>
            ) : filteredSearch.length > 0 ? (
              <div className={classes.resultsList}>
                {filteredSearch.map((apt) => (
                  <SearchResultCard
                    key={apt.buildingData.id}
                    data={apt}
                    selected={selectedApt?.buildingData.id === apt.buildingData.id}
                    onClick={() => handleSelect(apt)}
                  />
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <Typography className={classes.emptyText}>
                No apartments found for &quot;{searchQuery}&quot;
              </Typography>
            ) : (
              <Typography className={classes.emptyText}>
                Start typing to search for apartments
              </Typography>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <>
            {!user ? (
              <Typography className={classes.emptyText}>
                Sign in to see your saved properties
              </Typography>
            ) : loadingSaved ? (
              <div className={classes.loading}>
                <CircularProgress size={32} />
              </div>
            ) : filteredSaved.length > 0 ? (
              <div className={classes.savedGrid}>
                {filteredSaved.map((apt) => (
                  <SavedAptCard
                    key={apt.buildingData.id}
                    data={apt}
                    selected={selectedApt?.buildingData.id === apt.buildingData.id}
                    onClick={() => handleSelect(apt)}
                  />
                ))}
              </div>
            ) : (
              <Typography className={classes.emptyText}>You have no saved properties</Typography>
            )}
          </>
        )}
      </div>

      <div className={classes.actions}>
        <Button className={classes.cancelBtn} onClick={onClose}>
          Cancel
        </Button>
        <Button className={classes.confirmBtn} disabled={!selectedApt} onClick={handleConfirm}>
          Confirm
        </Button>
      </div>
    </Dialog>
  );
};

export default AddApartmentModal;

import React, { ReactElement, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import { useParams, useHistory, Link } from 'react-router-dom';
import {
  Button,
  Grid,
  makeStyles,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons';
import Toast from '../components/utils/Toast';
import { colors } from '../colors';
import axios from 'axios';
import { createAuthHeaders } from '../utils/firebase';
import { CardData } from '../App';
import BookmarkAptCard from '../components/Bookmarks/BookmarkAptCard';
import { AptSortFields, sortApartments } from '../utils/sortApartments';
import DropDownWithLabel from '../components/utils/DropDownWithLabel';

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

type Folder = {
  id: string;
  name: string;
  userId: string;
  createdAt: any;
  apartments?: string[];
};
const ToggleButton = ({
  text,
  callback,
  icon,
}: {
  text: string;
  callback: () => void;
  icon: React.ReactElement;
}) => {
  return (
    <Button
      style={{
        backgroundColor: 'white',
        borderRadius: '9px',
        textTransform: 'initial',
      }}
      variant="outlined"
      color="secondary"
      onClick={callback}
      endIcon={icon}
    >
      {text}
    </Button>
  );
};

const useStyles = makeStyles((theme) => ({
  background: {
    backgroundColor: colors.gray3,
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: '10px',
  },
  headerStyle: {
    fontFamily: 'Work Sans',
    fontWeight: 800,
  },
  headerContainer: {
    marginTop: '2em',
    marginBottom: '2em',
    display: 'flex',
    alignItems: 'center',
    gap: '1em',
  },
  backButton: {
    color: colors.red1,
  },
  gridContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '3em',
  },
  editButton: {
    backgroundColor: colors.gray5,
    border: `0px solid ${colors.gray4}`,
    padding: '10px 19px',
    borderRadius: 7,
  },
}));

/**
 * FolderDetailPage Component
 *
 * This component displays the contents of a specific folder,
 * showing all apartments saved in that folder.
 *
 * @oaram {Props} props - Component props
 * @param {firebase.User | null} props.user - The current logged-in user
 * @param {function} props.setUser - Function to update the user state
 * @returns ReactElement: The folder detail page component.
 */
const FolderDetailPage = ({ user, setUser }: Props): ReactElement => {
  const classes = useStyles();
  const { folderId } = useParams<{ folderId: string }>();
  const history = useHistory();
  const toastTime = 3500;
  const defaultShow = 6;
  const [aptsToShow, setAptsToShow] = useState<number>(defaultShow);

  const [isMobile, setIsMobile] = useState<boolean>(false);

  const [sortAptsBy, setSortAptsBy] = useState<AptSortFields>('numReviews');
  const { background, headerStyle, headerContainer, backButton, gridContainer } = useStyles();

  const [folder, setFolder] = useState<Folder | null>(null);
  const [apartments, setApartments] = useState<CardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showErrorToast, setShowErrorToast] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [apartmentIdsToRemove, setApartmentIdsToRemove] = useState<string[]>([]);
  const [showRemoveApartmentModal, setShowRemoveApartmentModal] = useState<boolean>(false);
  // handle toggle
  const handleViewAll = () => {
    setAptsToShow(aptsToShow + (apartments.length - defaultShow));
  };
  const handleCollapse = () => {
    setAptsToShow(defaultShow);
  };
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (setState: (value: React.SetStateAction<boolean>) => void) => {
    setState(true);
    setTimeout(() => {
      setState(false);
    }, toastTime);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    showToast(setShowErrorToast);
  };

  useEffect(() => {
    fetchFolderDetails();
  }, [folderId]);

  const fetchFolderDetails = async () => {
    try {
      setLoading(true);
      if (!user) {
        throw new Error('Failed to login');
      }
      const token = await user.getIdToken(false);

      const folderResponse = await axios.get(`/api/folders/${folderId}`, createAuthHeaders(token));
      setFolder((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(folderResponse.data)) {
          return prev; // No change, avoid re-render
        }
        return folderResponse.data;
      });
    } catch (error) {
      console.error('Error fetching folder details:', error);
      showError('Failed to load folder details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    history.push('/bookmarks');
  };

  const handleRemoveApartments = async (apartmentIds: string[]) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      const token = await user.getIdToken(false);

      await Promise.all(
        apartmentIds.map((id) =>
          axios.delete(`/api/folders/${folderId}/apartments/${id}`, {
            data: { apartmentIds },
            ...createAuthHeaders(token),
          })
        )
      );

      // Refresh folder details
      fetchFolderDetails();
    } catch (error) {
      console.error('Error removing apartments from folder:', error);
      showError('Failed to remove apartments from folder');
    }
    setShowRemoveApartmentModal(false);
  };

  const fetchApartmentsInFolder = async (folder: Folder) => {
    try {
      if (!user) {
        throw new Error('Failed to login');
      }

      const token = await user.getIdToken(false);
      const res = await axios.get(`/api/folders/${folder.id}/apartments`, createAuthHeaders(token));

      setApartments(res.data);
    } catch (error) {
      console.error('Error fetching apartments in folder:', error);
      showError('Failed to load apartments in folder');
    }
  };

  useEffect(() => {
    if (folder) {
      fetchApartmentsInFolder(folder);
    }
  }, [folder?.id]);

  if (loading) {
    return (
      <div className={background}>
        <Box style={{ width: '90%', maxWidth: '1200px', textAlign: 'center', marginTop: '3em' }}>
          <CircularProgress />
          <Typography style={{ marginTop: '1em' }}>Loading folder...</Typography>
        </Box>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className={background}>
        <Box style={{ width: '90%', maxWidth: '1200px' }}>
          <Typography variant="h5">Folder not found</Typography>
          <Button onClick={handleBackClick} style={{ marginTop: '1em' }}>
            Back to Folders
          </Button>
        </Box>
      </div>
    );
  }

  return (
    <div className={background}>
      <Dialog open={showRemoveApartmentModal} onClose={() => setShowRemoveApartmentModal(false)}>
        <DialogTitle>Remove Apartments from Folder</DialogTitle>
        <DialogContent>
          <Typography>Select apartments to remove from the folder.</Typography>
          <FormGroup>
            {apartments.map((apt) => (
              <Box key={apt.buildingData.id} display="flex" alignItems="center" mt={2}>
                <Checkbox
                  onChange={(e) => {
                    const aptId = apt.buildingData.id;
                    if (e.target.checked) {
                      setApartmentIdsToRemove((prev) => [...prev, aptId]);
                    } else {
                      setApartmentIdsToRemove((prev) => prev.filter((id) => id !== aptId));
                    }
                  }}
                />
                <Typography>
                  <strong>{apt.buildingData.name}</strong> - {apt.buildingData.address}
                </Typography>
              </Box>
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowRemoveApartmentModal(false)}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>

          <Button
            onClick={() => handleRemoveApartments(apartmentIdsToRemove)}
            color="primary"
            disabled={apartmentIdsToRemove.length === 0}
            variant="contained"
          >
            Remove Selected
          </Button>
        </DialogActions>
      </Dialog>
      <Box style={{ width: '90%', maxWidth: '1200px' }}>
        <Box className={headerContainer}>
          <IconButton onClick={handleBackClick} className={backButton}>
            <ArrowBackIcon />
          </IconButton>
          <div>
            <Typography variant="h3" className={headerStyle}>
              {folder.name}
            </Typography>
            <Typography variant="body1" style={{ color: colors.gray1, marginTop: '0.5em' }}>
              {apartments.length} {apartments.length === 1 ? 'apartment' : 'apartments'}
            </Typography>
          </div>

          <Box style={{ marginLeft: 'auto' }}>
            <DropDownWithLabel
              label="Sort by"
              menuItems={[
                {
                  item: 'Review Count',
                  callback: () => {
                    setSortAptsBy('numReviews');
                  },
                },
                {
                  item: 'Rating',
                  callback: () => {
                    setSortAptsBy('avgRating');
                  },
                },
              ]}
              isMobile={isMobile}
            />
          </Box>
          <Button onClick={() => setShowRemoveApartmentModal(true)} className={classes.editButton}>
            Edit
          </Button>
        </Box>

        {apartments.length > 0 ? (
          <Grid container spacing={4} className={gridContainer}>
            {apartments &&
              sortApartments(apartments, sortAptsBy, false)
                .slice(0, aptsToShow)
                .map(({ buildingData, numReviews, company }, index) => {
                  const { id } = buildingData;
                  return (
                    <Grid item xs={12} md={4} key={index}>
                      <div onClick={() => history.push(`/apartment/${id}`)}>
                        <BookmarkAptCard
                          key={index}
                          numReviews={numReviews}
                          buildingData={buildingData}
                          company={company}
                        />
                      </div>
                    </Grid>
                  );
                })}
            <Grid item container xs={12} justifyContent="center">
              {apartments.length > defaultShow &&
                (apartments.length > aptsToShow ? (
                  <ToggleButton
                    text="View All"
                    callback={handleViewAll}
                    icon={<KeyboardArrowDownIcon />}
                  />
                ) : (
                  <ToggleButton
                    text="Collapse"
                    callback={handleCollapse}
                    icon={<KeyboardArrowUpIcon />}
                  />
                ))}
            </Grid>
          </Grid>
        ) : (
          <Typography paragraph>You have not saved any apartments.</Typography>
        )}

        {showErrorToast && (
          <Toast isOpen={showErrorToast} severity="error" message={errorMessage} time={toastTime} />
        )}
      </Box>
    </div>
  );
};

export default FolderDetailPage;

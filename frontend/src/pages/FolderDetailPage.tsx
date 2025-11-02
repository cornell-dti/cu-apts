import React, { ReactElement, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
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
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons';
import Toast from '../components/utils/Toast';
import { colors } from '../colors';
import axios from 'axios';
import { createAuthHeaders } from '../utils/firebase';
import ApartmentCards from '../components/ApartmentCard/SearchResultsPageApartmentCards';
import { CardData } from '../App';

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
}));

/**
 * FolderDetailPage Component
 *
 * This component displays the contents of a specific folder,
 * showing all apartments saved in that folder.
 *
 * @component
 * @returns ReactElement: The folder detail page component.
 */
const FolderDetailPage = ({ user, setUser }: Props): ReactElement => {
  const { folderId } = useParams<{ folderId: string }>();
  const history = useHistory();
  const toastTime = 3500;
  const { background, headerStyle, headerContainer, backButton, gridContainer } = useStyles();

  const [folder, setFolder] = useState<Folder | null>(null);
  const [apartments, setApartments] = useState<CardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showErrorToast, setShowErrorToast] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [apartmentIdsToRemove, setApartmentIdsToRemove] = useState<string[]>([]);
  const [showRemoveApartmentModal, setShowRemoveApartmentModal] = useState<boolean>(false);

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
      const token = await user.getIdToken(true);

      // Fetch folder info
      const folderResponse = await axios.get('/api/folders', createAuthHeaders(token));
      const folders = folderResponse.data;
      const currentFolder = folders.find((f: Folder) => f.id === folderId);

      if (!currentFolder) {
        showError('Folder not found');
        history.push('/folders');
        return;
      }

      setFolder(currentFolder);

      // Fetch apartments in folder
      const apartmentsResponse = await axios.get(
        `/api/folders/${folderId}/apartments`,
        createAuthHeaders(token)
      );
      setApartments(apartmentsResponse.data);
    } catch (error) {
      console.error('Error fetching folder details:', error);
      showError('Failed to load folder details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    history.push('/folders');
  };

  const handleRemoveApartments = async (apartmentIds: string[]) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      const token = await user.getIdToken(true);

      await apartmentIds.map((id) =>
        axios.delete(`/api/folders/${folderId}/apartments/${id}`, {
          data: { apartmentIds },
          ...createAuthHeaders(token),
        })
      );

      // Refresh folder details
      fetchFolderDetails();
    } catch (error) {
      console.error('Error removing apartments from folder:', error);
      showError('Failed to remove apartments from folder');
    }
    setShowRemoveApartmentModal(false);
  };

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
          <Typography>
            Select apartments to remove from the folder or click "Remove All" to remove all
            apartments.
          </Typography>
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
          <Button
            onClick={() => handleRemoveApartments(apartments.map((apt) => apt.buildingData.id))}
            color="primary"
            variant="outlined"
          >
            Remove All
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
          <Button
            variant="outlined"
            onClick={() => setShowRemoveApartmentModal(true)}
            style={{ marginLeft: 'auto' }}
          >
            Edit Folder
          </Button>
        </Box>

        {apartments.length === 0 ? (
          <Box style={{ textAlign: 'center', marginTop: '3em' }}>
            <Typography variant="h5" style={{ color: colors.gray1 }}>
              No apartments in this folder
            </Typography>
            <Typography variant="body1" style={{ color: colors.gray2, marginTop: '1em' }}>
              Add apartments to this folder from the apartment pages
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} className={gridContainer}>
            <ApartmentCards data={apartments} user={user} setUser={setUser} />
          </Grid>
        )}

        {showErrorToast && (
          <Toast isOpen={showErrorToast} severity="error" message={errorMessage} time={toastTime} />
        )}
      </Box>
    </div>
  );
};

export default FolderDetailPage;

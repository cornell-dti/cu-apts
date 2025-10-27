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
} from '@material-ui/core';
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons';
import Toast from '../components/utils/Toast';
import { colors } from '../colors';
import axios from 'axios';
import { createAuthHeaders, getUser } from '../utils/firebase';

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
  const [apartments, setApartments] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showErrorToast, setShowErrorToast] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

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
        let user = await getUser(true);
        setUser(user);
      }
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
            {apartments.map((aptId) => (
              <Grid item xs={12} sm={6} md={4} key={aptId}>
                <Box
                  style={{
                    padding: '2em',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => history.push(`/apartment/${aptId}`)}
                >
                  <Typography variant="h6">Apartment {aptId}</Typography>
                  <Typography variant="body2" style={{ color: colors.gray2, marginTop: '0.5em' }}>
                    Click to view details
                  </Typography>
                </Box>
              </Grid>
            ))}
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

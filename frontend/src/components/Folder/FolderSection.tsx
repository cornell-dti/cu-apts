import React, { ReactElement, useEffect, useState } from 'react';
import {
  Button,
  Grid,
  makeStyles,
  Typography,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import Toast from '../utils/Toast';
import { colors } from '../../colors';
import FolderCard from './FolderCard';
import axios from 'axios';
import { createAuthHeaders, getUser } from '../../utils/firebase';
import { AddRounded } from '@material-ui/icons';

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
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: '10px',
  },
  gridContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '3em',
  },
  headerStyle: {
    fontFamily: 'Work Sans',
    fontWeight: 800,
  },
  headerContainer: {
    marginTop: '2em',
    marginBottom: '2em',
  },
  createButton: {
    marginTop: '1em',
    backgroundColor: colors.white,
    color: colors.gray1,
    borderRadius: 4,
    textTransform: 'none',
    padding: '40px 40px',
    fontSize: 75,
    border: `1px solid ${colors.gray3}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    boxShadow: '0 2px 2px rgba(0,0,0,0.1)',

    height: '200px',
    width: '200px',
    minWidth: '80px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
  },
}));

/**
 * FolderSection Component
 *
 * This component displays all folders saved by a user, with the option to edit, rename, or delete existing folders.
 *
 * @param {Props} props - Component props
 * @param {firebase.User | null} props.user - The current logged-in user
 * @param {function} props.setUser - Function to update the user state
 * @returns ReactElement: The folder page component.
 */
const FolderSection = ({ user, setUser }: Props): ReactElement => {
  const toastTime = 3500;
  const { background, headerStyle, headerContainer, gridContainer, createButton } = useStyles();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [showDeleteFolderToast, setShowDeleteFolderToast] = useState<boolean>(false);
  const [showRenameFolderToast, setShowRenameFolderToast] = useState<boolean>(false);
  const [showCreateFolderToast, setShowCreateFolderToast] = useState<boolean>(false);
  const [showErrorToast, setShowErrorToast] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const showToast = (setState: (value: React.SetStateAction<boolean>) => void) => {
    setState(true);
    setTimeout(() => {
      setState(false);
    }, toastTime);
  };

  const showDeleteSuccessConfirmationToast = () => {
    showToast(setShowDeleteFolderToast);
  };

  const showRenameSuccessConfirmationToast = () => {
    showToast(setShowRenameFolderToast);
  };

  const showCreateSuccessConfirmationToast = () => {
    showToast(setShowCreateFolderToast);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    showToast(setShowErrorToast);
  };

  // Fetch folders on component mount
  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      if (!user) {
        let user = await getUser(false);
        setUser(user);
      }
      if (!user) {
        throw new Error('Failed to login');
      }
      const token = await user.getIdToken(false);
      const response = await axios.get('/api/folders', createAuthHeaders(token));
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      showError('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showError('Folder name cannot be empty');
      return;
    }
    try {
      if (!user) {
        let user = await getUser(false);
        setUser(user);
      }
      if (!user) {
        throw new Error('Failed to login');
      }
      const token = await user.getIdToken(false);
      const response = await axios.post(
        '/api/folders',
        { folderName: newFolderName },
        createAuthHeaders(token)
      );
      setFolders([...folders, response.data]);
      setShowCreateDialog(false);
      setNewFolderName('');
      showCreateSuccessConfirmationToast();
    } catch (error) {
      console.error('Error creating folder:', error);
      showError('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      if (!user) {
        let user = await getUser(false);
        setUser(user);
      }
      if (!user) {
        throw new Error('Failed to login');
      }
      const token = await user.getIdToken(false);
      await axios.delete(`/api/folders/${folderId}`, createAuthHeaders(token));
      setFolders(folders.filter((f) => f.id !== folderId));
      showDeleteSuccessConfirmationToast();
    } catch (error) {
      console.error('Error deleting folder:', error);
      showError('Failed to delete folder: ' + (error as Error).message);
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      if (!user) {
        let user = await getUser(false);
        setUser(user);
      }
      if (!user) {
        throw new Error('Failed to login');
      }
      const token = await user.getIdToken(false);
      await axios.put(`/api/folders/${folderId}`, { newName }, createAuthHeaders(token));
      setFolders(folders.map((f) => (f.id === folderId ? { ...f, name: newName } : f)));
      showRenameSuccessConfirmationToast();
    } catch (error) {
      console.error('Error renaming folder:', error);
      showError('Failed to rename folder');
    }
  };

  return (
    <div className={background}>
      <Box style={{ width: '100%', maxWidth: '1200px' }}>
        <Box className={headerContainer}>
          <Typography variant="h3" className={headerStyle}>
            My Folders ({folders.length})
          </Typography>
        </Box>

        {loading ? (
          <Typography>Loading folders...</Typography>
        ) : folders.length === 0 ? (
          <Box style={{ textAlign: 'center', marginTop: '3em' }}>
            <Typography variant="h5" style={{ color: colors.gray1 }}>
              No folders yet
            </Typography>
            <Typography variant="body1" style={{ color: colors.gray2, marginTop: '1em' }}>
              Create your first folder to start organizing apartments
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1} className={gridContainer}>
            {folders.map((folder) => (
              <Grid item xs={12} sm={6} md={4} key={folder.id}>
                <FolderCard
                  user={user}
                  folder={folder}
                  onDelete={handleDeleteFolder}
                  onRename={handleRenameFolder}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4}>
              <Box className={createButton} onClick={() => setShowCreateDialog(true)}>
                <AddRounded style={{ fontSize: 80 }} />
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Create Folder Dialog */}
        <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)}>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Folder Name"
              type="text"
              fullWidth
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {showDeleteFolderToast && (
          <Toast
            isOpen={showDeleteFolderToast}
            severity="success"
            message="Folder successfully deleted!"
            time={toastTime}
          />
        )}
        {showRenameFolderToast && (
          <Toast
            isOpen={showRenameFolderToast}
            severity="success"
            message="Folder successfully renamed!"
            time={toastTime}
          />
        )}
        {showCreateFolderToast && (
          <Toast
            isOpen={showCreateFolderToast}
            severity="success"
            message="Folder successfully created!"
            time={toastTime}
          />
        )}
        {showErrorToast && (
          <Toast isOpen={showErrorToast} severity="error" message={errorMessage} time={toastTime} />
        )}
      </Box>
    </div>
  );
};

export default FolderSection;

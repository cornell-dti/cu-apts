import React, { ReactElement, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

import {
  Button,
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
    padding: '0 20px',
    marginTop: '20px',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
  },
  headerContainer: {
    marginBottom: '2em',
  },
  headerStyle: {
    fontFamily: 'Work Sans, sans-serif',
    fontWeight: 600,
    fontSize: '1.5rem',
    color: '#000',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '3em',
  },
  createButton: {
    marginTop: '55px',
    width: '100%',
    aspectRatio: '1',
    backgroundColor: '#fff',
    border: '1px solid #d0d0d0',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
  },
  createIcon: {
    fontSize: '64px',
    color: '#999',
  },
  emptyState: {
    textAlign: 'center',
    marginTop: '4em',
    padding: '2em',
  },
  emptyStateTitle: {
    color: '#666',
    fontWeight: 500,
    marginBottom: '0.5em',
  },
  emptyStateText: {
    color: '#999',
    fontSize: '0.95rem',
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
  const classes = useStyles();

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
        let user = await getUser(true);
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
    <div className={classes.background}>
      <Box className={classes.container}>
        <Box className={classes.headerContainer}>
          <Typography className={classes.headerStyle}>
            Saved Properties and Landlords ({folders.length})
          </Typography>
        </Box>

        {loading ? (
          <Typography>Loading folders...</Typography>
        ) : folders.length === 0 ? (
          <Box className={classes.emptyState}>
            <Typography variant="h5" className={classes.emptyStateTitle}>
              No folders yet
            </Typography>
            <Typography className={classes.emptyStateText}>
              Create your first folder to start organizing apartments
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              style={{ marginTop: '1.5em' }}
              onClick={() => setShowCreateDialog(true)}
            >
              Create Folder
            </Button>
          </Box>
        ) : (
          <div className={classes.gridContainer}>
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                user={user}
                folder={folder}
                onDelete={handleDeleteFolder}
                onRename={handleRenameFolder}
              />
            ))}
            <Box className={classes.createButton} onClick={() => setShowCreateDialog(true)}>
              <AddRounded className={classes.createIcon} />
            </Box>
          </div>
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

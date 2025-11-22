import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import axios from 'axios';
import { getUser, createAuthHeaders } from '../../utils/firebase';
import { colors } from '../../colors';

const useStyles = makeStyles({
  dialogContent: {
    minHeight: '300px',
    maxHeight: '400px',
  },
  folderItem: {
    border: `1px solid ${colors.gray3}`,
    borderRadius: '8px',
    marginBottom: '8px',
    '&:hover': {
      backgroundColor: colors.gray3,
    },
  },
  createFolderSection: {
    padding: '16px',
    backgroundColor: colors.gray3,
    borderRadius: '8px',
    marginTop: '16px',
  },
  addButton: {
    backgroundColor: colors.red1,
    color: 'white',
    '&:hover': {
      backgroundColor: colors.red2,
    },
  },
});

type Folder = {
  id: string;
  name: string;
  userId: string;
  createdAt: any;
  apartments?: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  apartmentId: string;
  apartmentName: string;
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
  onSuccess: () => void;
};

/**
 * AddToFolderModal
 * Allows users to add an apartment to their folders or create new folders.
 *
 * @param {Props} props- Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Function to call when closing the modal
 * @param {string} props.apartmentId - ID of the apartment to add to folders
 * @param {string} props.apartmentName - Name of the apartment to display
 * @param {firebase.User | null} props.user - Current logged-in user
 * @param {React.Dispatch<React.SetStateAction<firebase.User | null>>} props.setUser - Function to update the user state
 * @param {function} props.onSuccess - Function to call on successful addition to folders
 * @returns
 */

const AddToFolderModal = ({
  open,
  onClose,
  apartmentId,
  apartmentName,
  user,
  setUser,
  onSuccess,
}: Props) => {
  const classes = useStyles();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [initialFolders, setInitialFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      fetchFolders();
      setError('');
      setShowCreateNew(false);
      setNewFolderName('');
    }
  }, [open, apartmentId]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      let currentUser = user;

      if (!currentUser) {
        const loggedInUser = await getUser(true);
        setUser(loggedInUser);
        currentUser = loggedInUser;
        if (!currentUser) {
          setError('Please sign in to save apartments');
          return;
        }
      }

      const token = await currentUser.getIdToken(true);
      const response = await axios.get('/api/folders', createAuthHeaders(token));
      setFolders(response.data);

      // Pre-select folders that already contain this apartment
      const preSelected = new Set<string>();
      response.data.forEach((folder: Folder) => {
        if (folder.apartments?.includes(apartmentId)) {
          preSelected.add(folder.id);
        }
      });
      setSelectedFolders(preSelected);
      setInitialFolders(new Set(preSelected)); // Store initial state to detect changes
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFolder = (folderId: string) => {
    setSelectedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      let currentUser = user;

      if (!currentUser) {
        const loggedInUser = await getUser(true);
        setUser(loggedInUser);
        currentUser = loggedInUser;
        if (!currentUser) {
          setError('Please sign in to create folders');
          return;
        }
      }

      const token = await currentUser.getIdToken(true);
      const response = await axios.post(
        '/api/folders',
        { folderName: newFolderName.trim() },
        createAuthHeaders(token)
      );

      const newFolder = response.data;
      setFolders([...folders, newFolder]);
      setSelectedFolders((prev) => new Set(prev).add(newFolder.id));
      setNewFolderName('');
      setShowCreateNew(false);
      setError('');
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      let currentUser = user;

      if (!currentUser) {
        const loggedInUser = await getUser(true);
        setUser(loggedInUser);
        currentUser = loggedInUser;
        if (!currentUser) {
          setError('Please sign in to save apartments');
          return;
        }
      }

      const token = await currentUser.getIdToken(true);

      // Determine which folders currently contain this apartment
      const currentFolders = folders.filter((f) => f.apartments?.includes(apartmentId));
      const currentFolderIds = new Set(currentFolders.map((f) => f.id));

      // Track if any changes were made
      let changesMade = false;

      // Add apartment to newly selected folders
      for (const folderId of selectedFolders) {
        if (!currentFolderIds.has(folderId)) {
          await axios.post(
            `/api/folders/${folderId}/apartments`,
            { aptId: apartmentId },
            createAuthHeaders(token)
          );
          changesMade = true;
        }
      }

      // Remove apartment from deselected folders
      for (const folder of currentFolders) {
        if (!selectedFolders.has(folder.id)) {
          await axios.delete(
            `/api/folders/${folder.id}/apartments/${apartmentId}`,
            createAuthHeaders(token)
          );
          changesMade = true;
        }
      }

      // Only trigger success callback if changes were made
      if (changesMade) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      console.error('Error updating folders:', err);
      setError('Failed to update folders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    if (selectedFolders.size !== initialFolders.size) return true;
    for (const folderId of selectedFolders) {
      if (!initialFolders.has(folderId)) return true;
    }
    return false;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add "{apartmentName}" to Folder</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {loading && folders.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : folders.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">No folders yet. Create one below!</Typography>
          </Box>
        ) : (
          <List>
            {folders.map((folder) => (
              <ListItem
                key={folder.id}
                button
                onClick={() => handleToggleFolder(folder.id)}
                className={classes.folderItem}
              >
                <Checkbox
                  checked={selectedFolders.has(folder.id)}
                  onChange={() => handleToggleFolder(folder.id)}
                  color="primary"
                />
                <ListItemText
                  primary={folder.name}
                  secondary={`${folder.apartments?.length || 0} apartment${
                    folder.apartments?.length === 1 ? '' : 's'
                  }`}
                />
              </ListItem>
            ))}
          </List>
        )}

        {error && (
          <Typography color="error" variant="body2" style={{ marginTop: '8px' }}>
            {error}
          </Typography>
        )}

        <Box className={classes.createFolderSection}>
          {!showCreateNew ? (
            <Button
              startIcon={<AddIcon />}
              onClick={() => setShowCreateNew(true)}
              fullWidth
              variant="outlined"
            >
              Create New Folder
            </Button>
          ) : (
            <Box>
              <TextField
                autoFocus
                fullWidth
                label="New Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
                variant="outlined"
                size="small"
              />
              <Box display="flex" mt={1} style={{ gap: 8 }}>
                <Button onClick={handleCreateFolder} className={classes.addButton} size="small">
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateNew(false);
                    setNewFolderName('');
                    setError('');
                  }}
                  size="small"
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" disabled={loading || !hasChanges()}>
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToFolderModal;

import React, { useState, useEffect } from 'react';
import {
  Popover,
  List,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { getUser, createAuthHeaders } from '../../utils/firebase';
import { colors } from '../../colors';

const useStyles = makeStyles({
  popoverPaper: {
    width: 240,
    borderRadius: 8,
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  headerRow: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#333',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0',
    cursor: 'pointer',
    borderBottom: `1px solid #f0f0f0`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    border: '2px solid #999',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  checkboxChecked: {
    backgroundColor: colors.red1,
    borderColor: colors.red1,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  folderName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  createNewRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 0 4px',
    cursor: 'pointer',
    marginTop: 8,
    '&:hover $addIcon': {
      backgroundColor: '#e0e0e0',
    },
  },
  addIcon: {
    width: 18,
    height: 18,
    borderRadius: 3,
    border: '2px solid #999',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    color: '#999',
    lineHeight: 1,
    transition: 'background-color 0.2s',
  },
  createFolderModal: {
    padding: 0,
  },
  footerError: {
    padding: '8px 0 0',
    color: colors.red1,
    fontSize: 12,
  },
  modalActions: {
    marginTop: 12,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    textTransform: 'none',
    fontSize: 13,
    color: '#666',
    padding: '4px 12px',
  },
  redButton: {
    color: 'white',
    backgroundColor: colors.red1,
    borderRadius: 4,
    textTransform: 'none',
    padding: '6px 16px',
    fontWeight: 600,
    fontSize: 13,
    '&:hover': {
      backgroundColor: '#c41e3a',
    },
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 4,
      fontSize: 14,
    },
  },
});

type Folder = {
  id: string;
  name: string;
  apartments?: string[];
};

type Props = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  apartmentId: string;
  apartmentName: string;
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
  onSuccess: () => void;
};

export default function AddToFolderPopover({
  anchorEl,
  onClose,
  apartmentId,
  user,
  setUser,
  onSuccess,
}: Props) {
  const classes = useStyles();
  const open = Boolean(anchorEl);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [createMode, setCreateMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // -------------------------------
  // FETCH FOLDERS
  // -------------------------------
  useEffect(() => {
    if (open) {
      fetchFolders();
      setError('');
      setCreateMode(false);
      setNewFolderName('');
    }
  }, [open]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      let u = user;

      if (!u) {
        const logged = await getUser(true);
        setUser(logged);
        u = logged;
        if (!u) {
          setError('Please sign in to save apartments.');
          return;
        }
      }

      const token = await u.getIdToken(true);
      const response = await axios.get('/api/folders', createAuthHeaders(token));
      setFolders(response.data);
    } catch (err) {
      setError('Failed to load folders.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // SAVE/UNSAVE HANDLER
  // -------------------------------
  const handleSave = async (folderId: string) => {
    try {
      let u = user;
      if (!u) {
        const logged = await getUser(true);
        setUser(logged);
        u = logged;
        if (!u) {
          setError('Please sign in.');
          return;
        }
      }

      const token = await u.getIdToken(true);
      const folder = folders.find((f) => f.id === folderId);
      const alreadySaved = folder?.apartments?.includes(apartmentId);

      if (alreadySaved) {
        await axios.delete(
          `/api/folders/${folderId}/apartments/${apartmentId}`,
          createAuthHeaders(token)
        );
      } else {
        await axios.post(
          `/api/folders/${folderId}/apartments`,
          { aptId: apartmentId },
          createAuthHeaders(token)
        );
      }

      await fetchFolders();
      onSuccess();
    } catch (err) {
      setError('Failed to update folder.');
    }
  };

  // -------------------------------
  // CREATE NEW FOLDER
  // -------------------------------
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty.');
      return;
    }

    try {
      let u = user;
      if (!u) {
        const logged = await getUser(true);
        setUser(logged);
        u = logged;
        if (!u) {
          setError('Please sign in.');
          return;
        }
      }

      const token = await u.getIdToken(true);
      const response = await axios.post(
        '/api/folders',
        { folderName: newFolderName.trim() },
        createAuthHeaders(token)
      );

      const newFolder = response.data;

      // automatically add apartment
      await axios.post(
        `/api/folders/${newFolder.id}/apartments`,
        { aptId: apartmentId },
        createAuthHeaders(token)
      );

      await fetchFolders();
      onSuccess();

      setCreateMode(false);
      setNewFolderName('');
      setError('');
    } catch (err) {
      setError('Failed to create folder.');
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      classes={{ paper: classes.popoverPaper }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      disableRestoreFocus
      PaperProps={{
        onMouseLeave: onClose,
        onClick: (e) => e.stopPropagation(),
      }}
    >
      {/* HEADER */}
      <Box className={classes.headerRow}>
        <Typography className={classes.headerTitle}>Save to Folder</Typography>
      </Box>

      {/* CREATE MODE */}
      {createMode ? (
        <Box className={classes.createFolderModal}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
            className={classes.inputField}
          />

          <div className={classes.modalActions}>
            <Button className={classes.cancelButton} onClick={() => setCreateMode(false)}>
              Cancel
            </Button>
            <Button className={classes.redButton} onClick={handleCreateFolder}>
              Create
            </Button>
          </div>

          {error && <div className={classes.footerError}>{error}</div>}
        </Box>
      ) : (
        <>
          {/* LOADING */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <Box>
              {/* LIST OF FOLDERS */}
              <List disablePadding>
                {folders.map((folder) => {
                  const saved = folder.apartments?.includes(apartmentId);

                  return (
                    <div
                      key={folder.id}
                      className={classes.listItem}
                      onClick={() => handleSave(folder.id)}
                    >
                      <div
                        className={`${classes.checkbox} ${saved ? classes.checkboxChecked : ''}`}
                      >
                        {saved && <span className={classes.checkmark}>✓</span>}
                      </div>
                      <span className={classes.folderName}>{folder.name}</span>
                    </div>
                  );
                })}

                {/* + CREATE NEW */}
                <div className={classes.createNewRow} onClick={() => setCreateMode(true)}>
                  <div className={classes.addIcon}>+</div>
                  <span className={classes.folderName}>Create New Folder</span>
                </div>
              </List>
            </Box>
          )}

          {error && <div className={classes.footerError}>{error}</div>}
        </>
      )}
    </Popover>
  );
}

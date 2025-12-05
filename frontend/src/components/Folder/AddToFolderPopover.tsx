import React, { useState, useEffect } from 'react';
import {
  Popover,
  List,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { getUser, createAuthHeaders } from '../../utils/firebase';
import { colors } from '../../colors';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { FolderRounded } from '@material-ui/icons';

const useStyles = makeStyles({
  popoverPaper: {
    width: 300,
    borderRadius: 8,
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.45)',
    zIndex: 1300,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
    marginRight: -8,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s',
    borderRadius: 4,
    marginBottom: 4,
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
    '&:hover $saveButton': {
      opacity: 1,
    },
  },
  folderIcon: {
    width: 30,
    height: 30,
    borderRadius: 4,
    color: colors.red1,

    flexShrink: 0,
  },
  folderInfo: {
    flex: 1,
    minWidth: 0,
  },
  folderName: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1a1a1a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  saveButton: {
    minWidth: 70,
    height: 32,
    borderRadius: 16,
    textTransform: 'none',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
    transition: 'all 0.2s',
    opacity: 0,
  },
  saveButtonUnsaved: {
    border: `1.5px solid ${colors.red1}`,
    color: colors.red1,
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: '#fff5f5',
    },
  },
  saveButtonSaved: {
    backgroundColor: colors.red1,
    color: 'white',
    opacity: 1,
    '&:hover': {
      backgroundColor: '#c41e3a',
    },
  },
  createNewRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    cursor: 'pointer',
    marginTop: 8,
    transition: 'background-color 0.2s',
    borderRadius: 4,
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
  },
  addIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  createFolderModal: {
    padding: 0,
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
    marginLeft: -8,
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#333',
    marginBottom: 8,
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 4,
      fontSize: 14,
    },
  },
  modalActions: {
    marginTop: 16,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    textTransform: 'none',
    fontSize: 14,
    fontWeight: 600,
    color: '#666',
    padding: '8px 20px',
    borderRadius: 20,
    border: '1.5px solid #ddd',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  createButton: {
    color: 'white',
    backgroundColor: colors.red1,
    borderRadius: 20,
    textTransform: 'none',
    padding: '8px 24px',
    fontWeight: 600,
    fontSize: 14,
    '&:hover': {
      backgroundColor: '#c41e3a',
    },
  },
  footerError: {
    padding: '8px 0 0',
    color: colors.red1,
    fontSize: 12,
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
      {createMode ? (
        <Box className={classes.createFolderModal}>
          <Box className={classes.modalHeader}>
            <IconButton
              className={classes.backButton}
              onClick={() => setCreateMode(false)}
              size="small"
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography className={classes.modalTitle}>Create Folder</Typography>
          </Box>

          <Box mb={1}>
            <Typography className={classes.inputLabel}>Name</Typography>
          </Box>

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
            <Button className={classes.createButton} onClick={handleCreateFolder}>
              Create
            </Button>
          </div>

          {error && <div className={classes.footerError}>{error}</div>}
        </Box>
      ) : (
        <>
          <Box className={classes.header}>
            <Typography className={classes.headerTitle}>Save to Folder</Typography>
            <IconButton className={classes.closeButton} onClick={onClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <Box>
              <List disablePadding>
                {folders.map((folder) => {
                  const saved = folder.apartments?.includes(apartmentId);

                  return (
                    <div key={folder.id} className={classes.listItem}>
                      <FolderRounded className={classes.folderIcon} />
                      <div className={classes.folderInfo}>
                        <div className={classes.folderName}>{folder.name}</div>
                      </div>
                      <Button
                        className={`${classes.saveButton} ${
                          saved ? classes.saveButtonSaved : classes.saveButtonUnsaved
                        }`}
                        onClick={() => handleSave(folder.id)}
                      >
                        {saved ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  );
                })}

                <div className={classes.createNewRow} onClick={() => setCreateMode(true)}>
                  <div className={classes.addIconWrapper}>
                    <AddIcon />
                  </div>
                  <div className={classes.folderInfo}>
                    <div className={classes.folderName}>Create New Folder</div>
                  </div>
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

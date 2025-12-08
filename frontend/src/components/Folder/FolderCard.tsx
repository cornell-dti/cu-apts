import React, { ReactElement, useEffect, useState } from 'react';
import apartmentDefaultImage from '../../assets/apartment-placeholder.svg';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  makeStyles,
  Box,
} from '@material-ui/core';
import { MoreVert as MoreVertIcon, Folder as FolderIcon } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { colors } from '../../colors';
import axios from 'axios';
import { createAuthHeaders } from '../../utils/firebase';
import { CardData } from '../../App';

type Folder = {
  id: string;
  name: string;
  userId: string;
  createdAt: any;
  apartments?: string[];
};

type Props = {
  folder: Folder;
  onDelete: (folderId: string) => void;
  onRename: (folderId: string, newName: string) => void;
  user: firebase.User | null;
};

const useStyles = makeStyles((theme) => ({
  card: {
    height: '300px',
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
  },
  cardContent: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '1em',
  },
  folderIcon: {
    fontSize: '3em',
    color: colors.red1,
  },
  folderInfo: {
    flex: 1,
    width: '300px',
  },
  folderName: {
    fontWeight: 600,
    marginBottom: '0.1em',
  },
  apartmentCount: {
    color: colors.gray2,
    fontSize: '0.9em',
    marginBottom: '0.5em',
  },
  cardActions: {
    justifyContent: 'flex-end',
    padding: '8px 16px',
  },
  apartmentThumbnail: {
    width: '47%',
    height: '47%',
    borderRadius: 4,
    margin: '0.2em',
  },
  apartmentThumbnails: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '300px',
    height: '300px',
    overflow: 'hidden',
    alignContent: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  },
}));

/**
 * FolderCard Component
 *
 * A card component that displays folder information and provides options to rename or delete the folder.
 *
 * @param {Props} props - Component props
 * @param {Folder} props.folder - The folder data to display
 * @param {function} props.onDelete - Callback function when the folder is deleted
 * @param {function} props.onRename - Callback function when the folder is renamed
 * @returns ReactElement: The FolderCard component.
 */
const FolderCard = ({ folder, onDelete, onRename, user }: Props): ReactElement => {
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showRenameDialog, setShowRenameDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(folder.name);

  const [savedAptsData, setSavedAptsData] = useState<CardData[]>([]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRenameClick = () => {
    setNewName(folder.name);
    setShowRenameDialog(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    handleMenuClose();
  };

  const handleRenameConfirm = () => {
    if (newName.trim() && newName !== folder.name) {
      onRename(folder.id, newName.trim());
    }
    setShowRenameDialog(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(folder.id);
    setShowDeleteDialog(false);
  };

  const handleCardClick = () => {
    history.push(`/bookmarks/${folder.id}`);
  };

  const apartmentCount = folder.apartments?.length || 0;

  const fetchApartmentInformation = async () => {
    if (!user) return;
    const token = await user.getIdToken(false);
    const res = await axios.get(`/api/folders/${folder.id}/apartments`, createAuthHeaders(token));
    setSavedAptsData(res.data);
  };

  useEffect(() => {
    fetchApartmentInformation();
  }, []);

  const displayFolderThumbnail = () => {
    try {
      if (savedAptsData && savedAptsData.length > 0) {
        const numPlaceholders = savedAptsData.length < 4 ? 4 - savedAptsData.length : 0;
        return (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2px',
              height: '300px',
              width: '300px',
            }}
          >
            {savedAptsData.slice(0, 4).map((apartment) => (
              <img
                key={apartment.buildingData.id}
                src={
                  apartment.buildingData.photos.length > 0
                    ? apartment.buildingData.photos[0]
                    : apartmentDefaultImage
                }
                alt="Apartment Thumbnail"
                style={{ width: '48%', height: '48%', objectFit: 'cover', borderRadius: '4px' }}
              />
            ))}
            {Array.from({ length: numPlaceholders }).map((_, idx) => (
              <div
                key={`placeholder-${idx}`}
                style={{
                  width: '48%',
                  height: '48%',
                  borderRadius: '4px',
                  background: 'white',
                }}
              />
            ))}
          </div>
        );
      }
    } catch (error) {
      return (
        <>
          <img
            className={classes.apartmentThumbnail}
            src={apartmentDefaultImage}
            alt="Apartment Thumbnail"
          />
          <img
            className={classes.apartmentThumbnail}
            src={apartmentDefaultImage}
            alt="Apartment Thumbnail"
          />
          <img
            className={classes.apartmentThumbnail}
            src={apartmentDefaultImage}
            alt="Apartment Thumbnail"
          />
          <img
            className={classes.apartmentThumbnail}
            src={apartmentDefaultImage}
            alt="Apartment Thumbnail"
          />
        </>
      );
    }
  };

  return (
    <>
      <div className={classes.folderInfo}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" className={classes.folderName}>
            {folder.name}
          </Typography>
          <IconButton size="small" onClick={handleMenuOpen} aria-label="folder options">
            <MoreVertIcon />
          </IconButton>
        </div>

        <Typography className={classes.apartmentCount}>
          {apartmentCount} {apartmentCount === 1 ? 'apartment' : 'apartments'}
        </Typography>
      </div>

      <Box className={classes.apartmentThumbnails} onClick={handleCardClick}>
        <div>{displayFolderThumbnail()}</div>
      </Box>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleRenameClick}>Rename</MenuItem>
        <MenuItem onClick={handleDeleteClick} style={{ color: colors.red1 }}>
          Delete
        </MenuItem>
      </Menu>

      {/* Rename Dialog */}
      <Dialog
        open={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleRenameConfirm();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRenameDialog(false)}>Cancel</Button>
          <Button onClick={handleRenameConfirm} color="primary">
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{folder.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} style={{ color: colors.red1 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FolderCard;

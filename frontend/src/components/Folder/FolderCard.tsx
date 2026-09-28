import React, { ReactElement, useEffect, useState } from 'react';
import apartmentDefaultImage from '../../assets/apartment-placeholder.svg';
import {
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
} from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
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
  folderContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: '1.5em',
  },
  folderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5em',
    paddingLeft: '4px',
  },
  folderName: {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#000',
  },
  apartmentCount: {
    color: '#666',
    fontSize: '0.875rem',
    marginTop: '0.25em',
  },
  thumbnailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    width: '100%',
    aspectRatio: '1',
    cursor: 'pointer',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',

    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
  },
  apartmentThumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: '8px',
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
    const thumbnails = [];
    const maxThumbnails = 4;

    if (savedAptsData && savedAptsData.length > 0) {
      // Add actual apartment images
      for (let i = 0; i < Math.min(savedAptsData.length, maxThumbnails); i++) {
        const apartment = savedAptsData[i];
        thumbnails.push(
          <img
            key={apartment.buildingData.id}
            src={
              apartment.buildingData.photos.length > 0
                ? apartment.buildingData.photos[0]
                : apartmentDefaultImage
            }
            alt="Apartment Thumbnail"
            className={classes.apartmentThumbnail}
          />
        );
      }
    }

    // Fill remaining slots with placeholders
    const remainingSlots = maxThumbnails - thumbnails.length;
    for (let i = 0; i < remainingSlots; i++) {
      thumbnails.push(<div key={`placeholder-${i}`} className={classes.placeholderThumbnail} />);
    }

    return thumbnails;
  };

  return (
    <div className={classes.folderContainer}>
      <div className={classes.folderHeader}>
        <div>
          <Typography className={classes.folderName}>{folder.name}</Typography>
          <Typography className={classes.apartmentCount}>{apartmentCount} Saved</Typography>
        </div>
        <IconButton size="small" onClick={handleMenuOpen} aria-label="folder options">
          <MoreVertIcon />
        </IconButton>
      </div>

      <div className={classes.thumbnailGrid} onClick={handleCardClick}>
        {displayFolderThumbnail()}
      </div>

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
    </div>
  );
};

export default FolderCard;

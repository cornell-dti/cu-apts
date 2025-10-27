import React, { ReactElement, useState } from 'react';
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
} from '@material-ui/core';
import { MoreVert as MoreVertIcon, Folder as FolderIcon } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { colors } from '../../colors';

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
};

const useStyles = makeStyles((theme) => ({
  card: {
    height: '100%',
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
  },
  folderName: {
    fontWeight: 600,
    marginBottom: '0.5em',
  },
  apartmentCount: {
    color: colors.gray2,
    fontSize: '0.9em',
  },
  cardActions: {
    justifyContent: 'flex-end',
    padding: '8px 16px',
  },
}));

/**
 * FolderCard Component
 *
 * This component represents a folder in the user's folder list.
 *
 * @component
 * @returns ReactElement: The FolderCard component.
 */
const FolderCard = ({ folder, onDelete, onRename }: Props): ReactElement => {
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showRenameDialog, setShowRenameDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(folder.name);

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
    // Navigate to folder detail page using React Router
    history.push(`/folders/${folder.id}`);
  };

  const apartmentCount = folder.apartments?.length || 0;

  return (
    <>
      <Card className={classes.card} onClick={handleCardClick}>
        <CardContent className={classes.cardContent}>
          <FolderIcon className={classes.folderIcon} />
          <div className={classes.folderInfo}>
            <Typography variant="h6" className={classes.folderName}>
              {folder.name}
            </Typography>
            <Typography className={classes.apartmentCount}>
              {apartmentCount} {apartmentCount === 1 ? 'apartment' : 'apartments'}
            </Typography>
          </div>
        </CardContent>
        <CardActions className={classes.cardActions}>
          <IconButton size="small" onClick={handleMenuOpen} aria-label="folder options">
            <MoreVertIcon />
          </IconButton>
        </CardActions>
      </Card>

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

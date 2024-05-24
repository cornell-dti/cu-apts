import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { colors } from '../../../colors';
import React from 'react';
import { useModal } from './ContactModalContext';
import apartmentIcon from '../../../assets/apartmentIcon.svg';
import questionMarkIcon from '../../../assets/questionMark.svg';

const useStyles = makeStyles((theme) => ({
  modalStyle: {
    width: '640px',
    padding: '32px',
    borderRadius: '13px',
  },
  optionGrid: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  optionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: colors.red1 + '!important',
    padding: '32px 36px',
    gap: '16px',
    height: '169px',
    justifyContent: 'center',
    '& > span': {
      flexDirection: 'column',
    },
    '&:hover': {
      backgroundColor: colors.red5,
      boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.25)',
    },
  },
  optionText: {
    fontSize: '18px',
    fontWeight: 500,
    textTransform: 'none',
  },
  optionIcon: {
    paddingBottom: '16px',
  },
}));

const CantFindApartmentModal: React.FC = () => {
  const { modalOpen, closeModal } = useModal();

  const { modalStyle, optionGrid, optionButton, optionText, optionIcon } = useStyles();

  return (
    <Dialog
      open={modalOpen}
      onClose={closeModal}
      fullWidth
      maxWidth="md"
      classes={{ paper: modalStyle }}
    >
      <DialogTitle style={{ padding: '0' }}>
        <h3 style={{ margin: '0' }}>Contact Us</h3>
      </DialogTitle>
      <DialogContent style={{ padding: '0' }}>
        <Typography style={{ fontSize: '18px', padding: '16px 0 16px 0' }}>
          Choose from the following:
        </Typography>

        <Grid container spacing={3}>
          <Grid item md={6} className={optionGrid}>
            <Button className={optionButton}>
              <img
                className={optionIcon}
                src={apartmentIcon}
                alt="I can’t find my apartment on CUApts"
              />
              <Typography className={optionText}>I can’t find my apartment on CUApts</Typography>
            </Button>
          </Grid>
          <Grid item md={6} className={optionGrid}>
            <Button className={optionButton}>
              <img
                className={optionIcon}
                src={questionMarkIcon}
                alt="I have a question or concern"
              />
              <Typography className={optionText}>I have a question or concern</Typography>
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default CantFindApartmentModal;

/**
 * InviteSuccessModal.tsx
 *
 * The "Successfully invited" modal from the Shared Folders Figma, shown after invites are sent
 * from the invite modal or while creating a folder.
 */
import React, { ReactElement } from 'react';
import { IconButton, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { colors } from '../../colors';
import { PillButton, SharingDialog } from './SharingParts';

const useStyles = makeStyles({
  top: { display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0' },
  close: { width: 40, height: 40, color: colors.black },
  body: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: '0 32px 32px',
    textAlign: 'center',
  },
  mark: {
    width: 88,
    height: 88,
    borderRadius: '50%',
    backgroundColor: '#E8F5E9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2E7D32',
    '& svg': { fontSize: 60 },
  },
  title: { margin: 0, fontSize: 20, fontWeight: 600, lineHeight: '28px' },
  text: { margin: 0, fontSize: 14, lineHeight: '20px', color: colors.gray1 },
});

type Props = {
  open: boolean;
  onClose: () => void;
  count: number;
  folderName: string;
};

/**
 * InviteSuccessModal – Tells the owner their invites were emailed.
 *
 * @param {boolean} props.open – Whether the modal is showing.
 * @param {() => void} props.onClose – Called when DONE or the close button is clicked.
 * @param {number} props.count – How many people were emailed.
 * @param {string} props.folderName – The name of the folder they were invited to.
 * @returns {ReactElement} – The modal.
 */
const InviteSuccessModal = ({ open, onClose, count, folderName }: Props): ReactElement => {
  const classes = useStyles();
  return (
    <SharingDialog open={open} onClose={onClose}>
      <div className={classes.top}>
        <IconButton className={classes.close} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </div>
      <div className={classes.body}>
        <div className={classes.mark}>
          <CheckCircleIcon />
        </div>
        <h2 className={classes.title}>Successfully invited</h2>
        <p className={classes.text}>
          We emailed {count} {count === 1 ? 'person' : 'people'}. They’ll get access to “
          {folderName}” once they sign in with their Cornell account and accept.
        </p>
        <PillButton onClick={onClose}>Done</PillButton>
      </div>
    </SharingDialog>
  );
};

export default InviteSuccessModal;

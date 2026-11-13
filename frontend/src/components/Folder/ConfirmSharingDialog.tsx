/**
 * ConfirmSharingDialog.tsx
 *
 * The "Remove Jordan Lee?" and "Leave “Potential Apartments”?" confirmations from the Shared
 * Folders Figma.
 */
import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/core';
import { colors } from '../../colors';
import { PillButton, SharingDialog } from './SharingParts';

const useStyles = makeStyles({
  body: {
    margin: 0,
    padding: '0 24px 16px',
    fontSize: 16,
    lineHeight: '24px',
    color: colors.gray1,
  },
});

type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/**
 * ConfirmSharingDialog – Asks the user to confirm removing someone or leaving a folder.
 *
 * @param {boolean} props.open – Whether the dialog is showing.
 * @param {string} props.title – The question, like "Remove Jordan Lee?".
 * @param {string} props.body – What will happen if they confirm.
 * @param {string} props.confirmLabel – The label on the red confirm button.
 * @param {boolean} props.busy – Whether the action is in progress (disables the buttons).
 * @param {() => void} props.onConfirm – Called when the confirm button is clicked.
 * @param {() => void} props.onClose – Called when the dialog is cancelled or closed.
 * @returns {ReactElement} – The dialog.
 */
const ConfirmSharingDialog = ({
  open,
  title,
  body,
  confirmLabel,
  busy = false,
  onConfirm,
  onClose,
}: Props): ReactElement => {
  const classes = useStyles();
  return (
    <SharingDialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <PillButton variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </PillButton>
          <PillButton onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </PillButton>
        </>
      }
    >
      <p className={classes.body}>{body}</p>
    </SharingDialog>
  );
};

export default ConfirmSharingDialog;

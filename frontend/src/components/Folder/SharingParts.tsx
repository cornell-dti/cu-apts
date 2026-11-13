/**
 * SharingParts.tsx
 *
 * Small building blocks shared by the folder sharing screens (the invite modal, the Share menu,
 * and the invite popup), styled to match the Shared Folders Figma.
 */
import React, { ReactElement, ReactNode } from 'react';
import { Dialog, IconButton, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import { colors } from '../../colors';

// Avatar colors from the Figma
const AVATAR_COLORS = ['#7D248B', '#006196', '#FF878F', '#B94C4C', '#035D11'];

const useStyles = makeStyles({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    color: colors.white,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: '16px',
    letterSpacing: 0.2,
  },
  pendingAvatar: {
    backgroundColor: colors.gray3,
    border: `1px dashed ${colors.gray5}`,
    color: colors.gray1,
    '& svg': { fontSize: 16 },
  },
  pill: {
    fontFamily: 'inherit',
    fontWeight: 600,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    border: `1.5px solid ${colors.red1}`,
    borderRadius: 20,
    padding: '6.5px 10.5px',
    fontSize: 12,
    lineHeight: '16px',
    '&:disabled': { opacity: 0.4, cursor: 'default' },
  },
  large: {
    borderWidth: 1.875,
    borderRadius: 25,
    padding: '8px 13px',
    fontSize: 15,
    lineHeight: '20px',
  },
  primary: { backgroundColor: colors.red1, color: colors.white },
  secondary: { backgroundColor: colors.white, color: colors.red1 },
  textButton: {
    fontFamily: 'inherit',
    background: 'none',
    border: 'none',
    borderRadius: 8,
    padding: '6px 8px 6px 12px',
    color: colors.red1,
    fontSize: 14,
    lineHeight: '20px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '&:hover': { backgroundColor: colors.red5 },
    '&:disabled': { opacity: 0.4, cursor: 'default' },
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 0',
  },
  rowText: { flex: 1, minWidth: 0 },
  rowName: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: '20px',
    color: colors.black,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rowEmail: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: '16px',
    color: colors.gray1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  muted: { color: colors.gray2 },
  dialogPaper: {
    width: 480,
    maxWidth: 'calc(100% - 32px)',
    margin: 16,
    borderRadius: 16,
    boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.22)',
    fontFamily: 'Work Sans, sans-serif',
  },
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '24px 16px 8px 24px',
  },
  dialogTitle: {
    flex: 1,
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    lineHeight: '28px',
    color: colors.black,
  },
  closeButton: { width: 40, height: 40, color: colors.black },
  topContainer: { alignItems: 'flex-start' },
  topPaper: { marginTop: '12vh' },
  dialogFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    padding: '16px 24px 24px',
  },
});

/**
 * Avatar – A round avatar with someone's first initial, or a mail icon for a pending invite.
 *
 * @param {string} props.name – The name (or NetID) to take the initial and color from.
 * @param {boolean} props.pending – Whether to show the dashed pending-invite avatar instead.
 * @returns {ReactElement} – The avatar.
 */
export const Avatar = ({
  name,
  pending = false,
}: {
  name: string;
  pending?: boolean;
}): ReactElement => {
  const classes = useStyles();
  if (pending) {
    return (
      <div className={`${classes.avatar} ${classes.pendingAvatar}`}>
        <MailOutlineIcon />
      </div>
    );
  }
  // The same name always gets the same color
  const colorIndex = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (
    <div
      className={classes.avatar}
      style={{ backgroundColor: AVATAR_COLORS[colorIndex % AVATAR_COLORS.length] }}
    >
      {(name.trim()[0] ?? '?').toUpperCase()}
    </div>
  );
};

type PillButtonProps = {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'large';
  disabled?: boolean;
};

/**
 * PillButton – The rounded red buttons from the Figma (DONE, CANCEL, ACCEPT, and so on).
 *
 * @param {ReactNode} props.children – The button's label.
 * @param {() => void} props.onClick – Called when the button is clicked.
 * @param {'primary' | 'secondary'} props.variant – Filled red (primary) or red outline (secondary).
 * @param {'small' | 'large'} props.size – Small for modal footers, large for the invite popup.
 * @param {boolean} props.disabled – Whether the button is faded out and can't be clicked.
 * @returns {ReactElement} – The button.
 */
export const PillButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'small',
  disabled = false,
}: PillButtonProps): ReactElement => {
  const classes = useStyles();
  const sizeClass = size === 'large' ? classes.large : '';
  return (
    <button
      type="button"
      className={`${classes.pill} ${classes[variant]} ${sizeClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

/**
 * TextButton – A red text button, like Remove and LEAVE in the Share menu.
 *
 * @param {ReactNode} props.children – The button's label.
 * @param {() => void} props.onClick – Called when the button is clicked.
 * @param {boolean} props.disabled – Whether the button can't be clicked.
 * @returns {ReactElement} – The button.
 */
export const TextButton = ({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}): ReactElement => {
  const classes = useStyles();
  return (
    <button type="button" className={classes.textButton} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

type PersonRowProps = {
  name: string;
  email?: string;
  pending?: boolean;
  muted?: boolean;
  action?: ReactNode;
};

/**
 * PersonRow – One person in a list: avatar, name, email, and an optional action on the right.
 *
 * @param {string} props.name – The person's name, or the text to show for a pending invite.
 * @param {string} props.email – The person's email, shown under the name.
 * @param {boolean} props.pending – Whether to show the pending-invite avatar.
 * @param {boolean} props.muted – Whether to gray out the text (someone who can't be picked).
 * @param {ReactNode} props.action – What to show on the right, like "Owner" or a Remove button.
 * @returns {ReactElement} – The row.
 */
export const PersonRow = ({
  name,
  email,
  pending = false,
  muted = false,
  action,
}: PersonRowProps): ReactElement => {
  const classes = useStyles();
  const mutedClass = muted ? classes.muted : '';
  return (
    <div className={classes.row}>
      <Avatar name={name} pending={pending} />
      <div className={classes.rowText}>
        <div className={`${classes.rowName} ${mutedClass}`}>{name}</div>
        {email && <div className={`${classes.rowEmail} ${mutedClass}`}>{email}</div>}
      </div>
      {action}
    </div>
  );
};

type SharingDialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  alignTop?: boolean;
};

/**
 * SharingDialog – The white modal used by every sharing screen.
 *
 * @remarks
 * With a title it has the Figma's modal header (title and close button). Without one, the
 * content is shown on its own, for the centered popups.
 *
 * @param {boolean} props.open – Whether the modal is showing.
 * @param {() => void} props.onClose – Called when the modal is dismissed.
 * @param {string} props.title – The title in the header, if the modal has one.
 * @param {ReactNode} props.children – The modal's body.
 * @param {ReactNode} props.footer – Buttons for the bottom right, if any.
 * @param {boolean} props.alignTop – Pins the modal near the top of the screen instead of the
 * middle, so it grows downward instead of jumping when its content changes height.
 * @returns {ReactElement} – The modal.
 */
export const SharingDialog = ({
  open,
  onClose,
  title,
  children,
  footer,
  alignTop = false,
}: SharingDialogProps): ReactElement => {
  const classes = useStyles();
  const paper = `${classes.dialogPaper} ${alignTop ? classes.topPaper : ''}`;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper, container: alignTop ? classes.topContainer : undefined }}
    >
      {title && (
        <div className={classes.dialogHeader}>
          <h2 className={classes.dialogTitle}>{title}</h2>
          <IconButton className={classes.closeButton} onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </div>
      )}
      {children}
      {footer && <div className={classes.dialogFooter}>{footer}</div>}
    </Dialog>
  );
};

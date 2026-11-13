/**
 * ShareFolderPopover.tsx
 *
 * The Share menu on a folder's page, from the Shared Folders Figma. It lists everyone with access
 * to the folder. The owner can invite people, resend or cancel pending invites, and remove
 * members. Members see who is in the folder and can leave it.
 */
import React, { ReactElement, useEffect, useState } from 'react';
import { CircularProgress, makeStyles, Popover, Snackbar } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import WarningIcon from '@material-ui/icons/ReportProblemOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { colors } from '../../colors';
import {
  cancelFolderInvite,
  FolderCollaborators,
  FolderPerson,
  getCollaborators,
  getErrorMessage,
  netIdFromEmail,
  removeFolderMember,
  sendFolderInvite,
} from '../../utils/folderSharing';
import { PersonRow, PillButton, TextButton } from './SharingParts';
import ConfirmSharingDialog from './ConfirmSharingDialog';
import InviteCollaboratorsModal from './InviteCollaboratorsModal';
import InviteSuccessModal from './InviteSuccessModal';

const useStyles = makeStyles({
  paper: {
    width: 452,
    maxWidth: 'calc(100% - 32px)',
    border: `1px solid ${colors.gray5}`,
    borderRadius: 12,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.14)',
    fontFamily: 'Work Sans, sans-serif',
  },
  search: { padding: '16px 16px 8px' },
  searchField: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 44,
    padding: '0 12px',
    boxSizing: 'border-box',
    border: `1px solid ${colors.gray5}`,
    borderRadius: 8,
    background: colors.white,
    color: colors.gray2,
    fontFamily: 'inherit',
    fontSize: 14,
    cursor: 'text',
    '&:disabled': { cursor: 'default', opacity: 0.6 },
  },
  header: { display: 'flex', alignItems: 'baseline', gap: 8, padding: '8px 16px 0' },
  headerTitle: { fontSize: 14, fontWeight: 600, lineHeight: '20px' },
  headerCount: { fontSize: 12, lineHeight: '16px', color: colors.gray1 },
  list: { padding: '0 16px', maxHeight: 270, overflowY: 'auto' },
  ownerLabel: { fontSize: 14, lineHeight: '20px', color: colors.gray2 },
  note: { margin: 0, padding: '8px 16px 0', fontSize: 12, lineHeight: '16px', color: colors.gray1 },
  limit: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    margin: '8px 16px 0',
    paddingTop: 12,
    borderTop: `1px solid ${colors.gray5}`,
    color: '#C62828',
    fontSize: 13,
    fontWeight: 500,
    lineHeight: '19px',
  },
  error: { margin: 0, padding: '8px 16px 0', fontSize: 12, lineHeight: '16px', color: '#C62828' },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px 16px',
  },
  loading: { display: 'flex', justifyContent: 'center', padding: 32 },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 8,
    backgroundColor: colors.gray1,
    color: colors.white,
    fontFamily: 'Work Sans, sans-serif',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '20px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.14)',
  },
});

type Props = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  user: firebase.User | null;
  folder: { id: string; name: string; userId: string };
  onLeft: () => void;
};

// What the confirmation dialog is asking about, if it's open
type Confirming = { type: 'remove'; person: FolderPerson } | { type: 'leave' } | null;

/**
 * ShareFolderPopover – The Share menu: who has access to a folder, and ways to change that.
 *
 * @param {HTMLElement | null} props.anchorEl – The Share button the menu opens under.
 * @param {() => void} props.onClose – Called when the menu closes.
 * @param {firebase.User | null} props.user – The signed-in user.
 * @param {{ id: string, name: string, userId: string }} props.folder – The folder being shared.
 * @param {() => void} props.onLeft – Called after the user leaves the folder.
 * @returns {ReactElement} – The menu and the modals it opens.
 */
const ShareFolderPopover = ({ anchorEl, onClose, user, folder, onLeft }: Props): ReactElement => {
  const classes = useStyles();
  const [collaborators, setCollaborators] = useState<FolderCollaborators | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitedCount, setInvitedCount] = useState(0);
  const [confirming, setConfirming] = useState<Confirming>(null);
  const open = Boolean(anchorEl);
  const isOwner = !!user && user.uid === folder.userId;

  const loadCollaborators = async () => {
    if (!user) return;
    try {
      setCollaborators(await getCollaborators(user, folder.id));
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load who has access to this folder.'));
    }
  };

  useEffect(() => {
    if (open) loadCollaborators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, folder.id, user]);

  // Runs a change, then reloads the list, showing the backend's message if it fails
  const runAction = async (action: () => Promise<void>, fallback: string, success?: string) => {
    if (!user) return;
    setBusy(true);
    try {
      await action();
      if (success) setToast(success);
      await loadCollaborators();
    } catch (err) {
      setError(getErrorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (!user || !confirming) return;
    if (confirming.type === 'remove') {
      const { person } = confirming;
      await runAction(
        () => removeFolderMember(user, folder.id, person.id),
        `Could not remove ${person.name}.`
      );
      setConfirming(null);
      return;
    }
    setBusy(true);
    try {
      await removeFolderMember(user, folder.id, user.uid);
      setConfirming(null);
      onClose();
      onLeft();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not leave this folder.'));
      setConfirming(null);
    } finally {
      setBusy(false);
    }
  };

  const you = (person: FolderPerson) => (user && person.id === user.uid ? ' (you)' : '');
  const people = collaborators ? [collaborators.owner, ...collaborators.members] : [];
  const pending = collaborators?.pendingInvites ?? [];
  const isFull =
    !!collaborators && collaborators.members.length + pending.length >= collaborators.limit;

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        classes={{ paper: classes.paper }}
      >
        {!collaborators && !error && (
          <div className={classes.loading}>
            <CircularProgress size={28} />
          </div>
        )}
        {isOwner && collaborators && (
          <div className={classes.search}>
            <button
              type="button"
              className={classes.searchField}
              onClick={() => setInviteOpen(true)}
              disabled={isFull}
            >
              <SearchIcon />
              Add people by NetID
            </button>
          </div>
        )}
        {collaborators && (
          <>
            <div className={classes.header}>
              <span className={classes.headerTitle}>People with access</span>
              <span className={classes.headerCount}>{people.length + pending.length}</span>
            </div>
            <div className={classes.list}>
              {people.map((person, index) => (
                <PersonRow
                  key={person.id}
                  name={`${person.name}${you(person)}`}
                  email={person.email}
                  action={
                    index === 0 ? (
                      <span className={classes.ownerLabel}>Owner</span>
                    ) : (
                      isOwner && (
                        <TextButton
                          disabled={busy}
                          onClick={() => setConfirming({ type: 'remove', person })}
                        >
                          Remove
                        </TextButton>
                      )
                    )
                  }
                />
              ))}
              {pending.map((invite) => (
                <PersonRow
                  key={invite.id}
                  name="Pending invite"
                  email={invite.email}
                  pending
                  action={
                    <>
                      <TextButton
                        disabled={busy}
                        onClick={() =>
                          runAction(
                            async () => {
                              await sendFolderInvite(
                                user as firebase.User,
                                folder.id,
                                invite.netId
                              );
                            },
                            `Could not resend the invite to ${invite.email}.`,
                            `Invite resent to ${invite.email}`
                          )
                        }
                      >
                        Resend
                      </TextButton>
                      <TextButton
                        disabled={busy}
                        onClick={() =>
                          runAction(
                            () => cancelFolderInvite(user as firebase.User, invite.id),
                            `Could not cancel the invite to ${invite.email}.`,
                            `Invite to ${invite.email} cancelled`
                          )
                        }
                      >
                        Remove
                      </TextButton>
                    </>
                  }
                />
              ))}
            </div>
          </>
        )}
        {isOwner && isFull && collaborators && (
          <div className={classes.limit}>
            <WarningIcon fontSize="small" />
            This folder has reached the {collaborators.limit}-collaborator limit. Remove someone to
            invite more people.
          </div>
        )}
        {collaborators && !isOwner && (
          <p className={classes.note}>Only the owner can invite or remove people.</p>
        )}
        {error && <p className={classes.error}>{error}</p>}
        <div className={classes.footer}>
          {collaborators && !isOwner && (
            <TextButton onClick={() => setConfirming({ type: 'leave' })}>LEAVE</TextButton>
          )}
          <PillButton onClick={onClose}>Done</PillButton>
        </div>
      </Popover>

      <InviteCollaboratorsModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        user={user}
        folderId={folder.id}
        peopleWithAccess={people.map(({ email }) => netIdFromEmail(email))}
        onInvited={(count) => {
          setInvitedCount(count);
          loadCollaborators();
        }}
      />
      <InviteSuccessModal
        open={invitedCount > 0}
        onClose={() => setInvitedCount(0)}
        count={invitedCount}
        folderName={folder.name}
      />
      <ConfirmSharingDialog
        open={confirming !== null}
        busy={busy}
        title={
          confirming?.type === 'remove'
            ? `Remove ${confirming.person.name}?`
            : `Leave “${folder.name}”?`
        }
        body={
          confirming?.type === 'remove'
            ? `They’ll lose access to “${folder.name}”. Listings they added will stay in the folder.`
            : 'You’ll lose access to this folder. The owner and other collaborators keep it, and listings you added will stay.'
        }
        confirmLabel={confirming?.type === 'remove' ? 'Remove' : 'Leave folder'}
        onConfirm={handleConfirm}
        onClose={() => setConfirming(null)}
      />
      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={() => setToast('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <div className={classes.toast}>
          <CheckCircleIcon />
          {toast}
        </div>
      </Snackbar>
    </>
  );
};

export default ShareFolderPopover;

/**
 * FolderInviteModal.tsx
 *
 * The popup someone sees after clicking OPEN FOLDER in an invite email (/folder-invite/:inviteId).
 * It shows on top of the home page, following the Shared Folders Figma:
 * - 2.2: "<name> invited you to join <folder>" with ACCEPT and DECLINE
 * - 2.3: "You have joined <folder>" with VIEW FOLDER, after accepting
 * - 2.4: declining closes the popup and leaves them on the home page
 */
import React, { ReactElement, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { CircularProgress, makeStyles } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { colors } from '../../colors';
import { getUser, onUserChange } from '../../utils/firebase';
import {
  FolderInviteDetails,
  getErrorMessage,
  getFolderInvite,
  respondToFolderInvite,
} from '../../utils/folderSharing';
import { PillButton, SharingDialog } from './SharingParts';

const useStyles = makeStyles({
  body: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    padding: '40px 32px 32px',
    textAlign: 'center',
  },
  mark: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    backgroundColor: colors.red5,
    color: colors.red1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': { fontSize: 36 },
  },
  joinedMark: {
    width: 88,
    height: 88,
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    '& svg': { fontSize: 60 },
  },
  title: { margin: 0, fontSize: 20, fontWeight: 600, lineHeight: '28px', color: colors.black },
  text: { margin: 0, fontSize: 14, lineHeight: '20px', color: colors.gray1 },
  error: { margin: 0, fontSize: 14, lineHeight: '20px', color: '#C62828' },
  buttons: { display: 'flex', justifyContent: 'center', gap: 12 },
});

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

// Which version of the popup is showing
type Step = 'checking' | 'signIn' | 'loading' | 'decide' | 'joined' | 'unavailable';

/**
 * FolderInviteModal – Lets the invited person accept or decline a folder invite.
 *
 * @remarks
 * The invite can only be seen by the Cornell account it was sent to, so the popup first waits for
 * Firebase to restore the session and asks the person to sign in if they aren't. Invites that
 * were already answered, cancelled, or sent to another account show the backend's reason.
 *
 * @param {firebase.User | null} props.user – The signed-in user, if any.
 * @param {function} props.setUser – Updates the signed-in user after signing in.
 * @returns {ReactElement} – The popup.
 */
const FolderInviteModal = ({ user, setUser }: Props): ReactElement => {
  const classes = useStyles();
  const history = useHistory();
  const { inviteId } = useParams<{ inviteId: string }>();
  const [step, setStep] = useState<Step>('checking');
  const [invite, setInvite] = useState<FolderInviteDetails | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // Firebase restores a signed-in session a moment after the page loads
  useEffect(
    () =>
      onUserChange((signedIn) => {
        if (signedIn?.email?.endsWith('@cornell.edu')) setUser(signedIn);
        else setStep('signIn');
      }),
    [setUser]
  );

  useEffect(() => {
    if (!user) return;
    const loadInvite = async () => {
      setStep('loading');
      try {
        const found = await getFolderInvite(user, inviteId);
        setInvite(found);
        if (found.status === 'PENDING') setStep('decide');
        else if (found.status === 'ACCEPTED') setStep('joined');
        else {
          setMessage('You already declined this invite. Ask the owner to invite you again.');
          setStep('unavailable');
        }
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 403) {
          setMessage('This invite was sent to a different Cornell email. Sign in with that one.');
        } else if (status === 404) {
          setMessage('This invite no longer exists. It may have been cancelled.');
        } else {
          setMessage(getErrorMessage(err, 'Something went wrong. Please try again.'));
        }
        setStep('unavailable');
      }
    };
    loadInvite();
  }, [user, inviteId]);

  const close = () => history.replace('/');

  const respond = async (accept: boolean) => {
    if (!user) return;
    setBusy(true);
    setMessage('');
    try {
      await respondToFolderInvite(user, inviteId, accept);
      if (accept) setStep('joined');
      else close();
    } catch (err) {
      setMessage(getErrorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const signIn = async () => {
    const signedIn = await getUser(true);
    if (signedIn) setUser(signedIn);
  };

  const folderName = invite?.folderName ?? 'this folder';

  return (
    <SharingDialog open onClose={close}>
      <div className={classes.body}>
        {(step === 'checking' || step === 'loading') && <CircularProgress />}

        {step === 'signIn' && (
          <>
            <div className={classes.mark}>
              <FolderIcon />
            </div>
            <h2 className={classes.title}>Sign in to see your invite</h2>
            <p className={classes.text}>Use the Cornell email the invite was sent to.</p>
            <PillButton size="large" onClick={signIn}>
              Sign in
            </PillButton>
          </>
        )}

        {step === 'decide' && invite && (
          <>
            <div className={classes.mark}>
              <FolderIcon />
            </div>
            <h2 className={classes.title}>
              {invite.invitedByName} invited you to join “{folderName}”
            </h2>
            <p className={classes.text}>
              You’ll be able to view, add, and remove listings in this folder.
            </p>
            {message && <p className={classes.error}>{message}</p>}
            <div className={classes.buttons}>
              <PillButton size="large" onClick={() => respond(true)} disabled={busy}>
                Accept
              </PillButton>
              <PillButton
                size="large"
                variant="secondary"
                onClick={() => respond(false)}
                disabled={busy}
              >
                Decline
              </PillButton>
            </div>
          </>
        )}

        {step === 'joined' && invite && (
          <>
            <div className={`${classes.mark} ${classes.joinedMark}`}>
              <CheckCircleIcon />
            </div>
            <h2 className={classes.title}>You have joined “{folderName}”</h2>
            <p className={classes.text}>
              You can now view, add, and remove listings with the group.
            </p>
            <PillButton size="large" onClick={() => history.push(`/bookmarks/${invite.folderId}`)}>
              View folder
            </PillButton>
          </>
        )}

        {step === 'unavailable' && (
          <>
            <div className={classes.mark}>
              <FolderIcon />
            </div>
            <h2 className={classes.title}>This invite can’t be opened</h2>
            <p className={classes.text}>{message}</p>
            <PillButton size="large" onClick={close}>
              Close
            </PillButton>
          </>
        )}
      </div>
    </SharingDialog>
  );
};

export default FolderInviteModal;

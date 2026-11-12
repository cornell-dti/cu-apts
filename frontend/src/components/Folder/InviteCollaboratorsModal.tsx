/**
 * InviteCollaboratorsModal.tsx
 *
 * The "Invite collaborators" modal from the Shared Folders Figma.
 *
 * While you type a NetID, Cornell email, or name, it suggests CU Apts users who match. Anyone
 * else can still be invited by typing their full NetID, since most people haven't signed in yet.
 * Picked people show up as chips, and DONE sends the invites.
 */
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import { colors } from '../../colors';
import {
  getErrorMessage,
  isInvalidInvite,
  searchUsers,
  sendFolderInvite,
  toNetId,
  UserSuggestion,
} from '../../utils/folderSharing';
import { PersonRow, PillButton, SharingDialog } from './SharingParts';

const ERROR_RED = '#C62828';
const SEARCH_DELAY_MS = 250;

const useStyles = makeStyles({
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: '8px 24px 16px',
  },
  label: { display: 'block', fontSize: 14, fontWeight: 600, lineHeight: '20px', marginBottom: 4 },
  field: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 44,
    padding: '0 12px',
    boxSizing: 'border-box',
    border: `1px solid ${colors.gray5}`,
    borderRadius: 8,
    color: colors.gray1,
    '&:focus-within': { border: `2px solid ${colors.red1}`, padding: '0 11px' },
  },
  fieldError: {
    border: `2px solid ${ERROR_RED}`,
    padding: '0 11px',
    '&:focus-within': { border: `2px solid ${ERROR_RED}` },
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: 14,
    lineHeight: '20px',
    color: colors.black,
    '&::placeholder': { color: colors.gray2 },
  },
  helper: { marginTop: 4, fontSize: 12, lineHeight: '16px', color: ERROR_RED },
  results: {
    border: `1px solid ${colors.gray5}`,
    borderRadius: 8,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.14)',
    padding: '4px 0',
    overflow: 'hidden',
  },
  result: {
    display: 'block',
    width: '100%',
    padding: '0 12px',
    border: 'none',
    background: colors.white,
    textAlign: 'left',
    fontFamily: 'inherit',
    cursor: 'pointer',
    '&:hover, &:focus': { backgroundColor: colors.gray3, outline: 'none' },
    '&:disabled': { cursor: 'default', backgroundColor: colors.white },
  },
  hasAccess: { fontSize: 14, lineHeight: '20px', color: colors.gray2, whiteSpace: 'nowrap' },
  skeletonRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px' },
  skeletonAvatar: { width: 36, height: 36, borderRadius: '50%', backgroundColor: colors.gray5 },
  skeletonLine: { borderRadius: 4, backgroundColor: colors.gray5 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px 4px 12px',
    borderRadius: 999,
    backgroundColor: colors.gray5,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '20px',
  },
  chipRemove: {
    display: 'flex',
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: colors.black,
    '& svg': { fontSize: 18 },
  },
  note: { margin: 0, fontSize: 12, lineHeight: '16px', color: colors.gray1 },
  noteError: { color: ERROR_RED },
});

/**
 * Invitee – Someone picked in the invite box, shown as a chip.
 */
type Invitee = { netId: string; label: string };

type Props = {
  open: boolean;
  onClose: () => void;
  user: firebase.User | null;
  folderId?: string;
  peopleWithAccess?: string[];
  initialNetIds?: string[];
  onSelect?: (netIds: string[]) => void;
  onInvited?: (count: number) => void;
};

/**
 * InviteCollaboratorsModal – Lets the owner pick people by NetID and invite them to a folder.
 *
 * @remarks
 * With a `folderId`, DONE sends the invites one at a time and calls `onInvited` once all of them
 * go through. If some fail (for example the folder is full), the modal stays open with only those
 * people left and the backend's reasons. Without a `folderId` (while creating a folder), DONE
 * just hands the picked NetIDs to `onSelect`, and the invites are sent once the folder exists.
 *
 * @param {boolean} props.open – Whether the modal is showing.
 * @param {() => void} props.onClose – Called when the modal closes.
 * @param {firebase.User | null} props.user – The signed-in user, needed to search and invite.
 * @param {string} props.folderId – The folder to invite people to, if it already exists.
 * @param {string[]} props.peopleWithAccess – NetIDs that already have access, shown grayed out.
 * @param {string[]} props.initialNetIds – NetIDs to start with as chips.
 * @param {(netIds: string[]) => void} props.onSelect – Gets the picked NetIDs (no `folderId`).
 * @param {(count: number) => void} props.onInvited – Gets how many people were emailed.
 * @returns {ReactElement} – The modal.
 */
const InviteCollaboratorsModal = ({
  open,
  onClose,
  user,
  folderId,
  peopleWithAccess = [],
  initialNetIds = [],
  onSelect,
  onInvited,
}: Props): ReactElement => {
  const classes = useStyles();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Invitee[]>([]);
  const [showInvalid, setShowInvalid] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  // People already emailed this time the modal was opened, in case a later try fails
  const sentCount = useRef(0);

  const typed = query.trim();
  const typedNetId = toNetId(typed);
  const invalid = showInvalid || isInvalidInvite(typed);
  const selectedIds = selected.map(({ netId }) => netId);

  // Start fresh each time the modal opens
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelected(initialNetIds.map((netId) => ({ netId, label: netId })));
    setSendError('');
    sentCount.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Search after a short pause in typing, and ignore answers to older searches
  useEffect(() => {
    if (!user || typed.length < 2 || isInvalidInvite(typed)) {
      setSuggestions([]);
      setSearching(false);
      return undefined;
    }
    let stale = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(user, typed);
        if (!stale) setSuggestions(results);
      } catch (err) {
        if (!stale) setSuggestions([]);
      } finally {
        if (!stale) setSearching(false);
      }
    }, SEARCH_DELAY_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [typed, user]);

  const addInvitee = (invitee: Invitee) => {
    if (!selectedIds.includes(invitee.netId) && !peopleWithAccess.includes(invitee.netId)) {
      setSelected([...selected, invitee]);
    }
    setQuery('');
    setShowInvalid(false);
    setSendError('');
  };

  const visibleSuggestions = suggestions.filter(({ netId }) => !selectedIds.includes(netId));
  const showInviteRow =
    !!typedNetId &&
    !searching &&
    !selectedIds.includes(typedNetId) &&
    !suggestions.some(({ netId }) => netId === typedNetId);
  const typedHasAccess = !!typedNetId && peopleWithAccess.includes(typedNetId);
  const showsSomeoneWithAccess =
    typedHasAccess || visibleSuggestions.some(({ netId }) => peopleWithAccess.includes(netId));

  const handleEnter = () => {
    const pickable = visibleSuggestions.find(({ netId }) => !peopleWithAccess.includes(netId));
    if (typedNetId && !typedHasAccess) {
      const match = suggestions.find(({ netId }) => netId === typedNetId);
      addInvitee({ netId: typedNetId, label: match?.name ?? typedNetId });
    } else if (pickable) {
      addInvitee({ netId: pickable.netId, label: pickable.name });
    } else if (typed && !typedHasAccess) {
      setShowInvalid(true);
    }
  };

  const handleDone = async () => {
    if (!folderId) {
      onSelect?.(selectedIds);
      onClose();
      return;
    }
    if (!user) return;

    setSending(true);
    // One at a time, so each person gets the backend's answer (like the folder filling up)
    const failures = await selected.reduce<Promise<{ invitee: Invitee; message: string }[]>>(
      async (previous, invitee) => {
        const failed = await previous;
        try {
          await sendFolderInvite(user, folderId, invitee.netId);
          sentCount.current += 1;
          return failed;
        } catch (err) {
          const message = getErrorMessage(err, `Couldn't invite ${invitee.netId}.`);
          return [...failed, { invitee, message }];
        }
      },
      Promise.resolve([])
    );
    setSending(false);

    if (failures.length === 0) {
      onInvited?.(sentCount.current);
      onClose();
      return;
    }
    setSelected(failures.map(({ invitee }) => invitee));
    setSendError(failures.map(({ invitee, message }) => `${invitee.netId}: ${message}`).join(' '));
  };

  let note = 'Collaborators can view, add, and remove listings in this folder.';
  if (searching) note = 'Searching CU Apts users…';
  else if (showsSomeoneWithAccess) note = 'This person already has access to this folder.';
  else if (showInviteRow) note = 'They’ll get access once they sign in with their Cornell email.';

  const showResults = typed.length >= 2 && !invalid;

  return (
    <SharingDialog
      open={open}
      onClose={onClose}
      title="Invite collaborators"
      footer={
        <>
          <PillButton variant="secondary" onClick={onClose}>
            Cancel
          </PillButton>
          <PillButton onClick={handleDone} disabled={selected.length === 0 || sending}>
            {sending ? 'Sending…' : 'Done'}
          </PillButton>
        </>
      }
    >
      <div className={classes.body}>
        <div>
          <label htmlFor="invite-netid" className={classes.label}>
            NetID
          </label>
          <div className={`${classes.field} ${invalid ? classes.fieldError : ''}`}>
            <SearchIcon />
            <input
              id="invite-netid"
              className={classes.input}
              placeholder="Search people by NetID"
              value={query}
              autoComplete="off"
              autoFocus
              onChange={(e) => {
                setQuery(e.target.value);
                setShowInvalid(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEnter();
              }}
            />
          </div>
          {invalid && (
            <div className={classes.helper}>
              Enter a valid Cornell NetID (like abc123) or Cornell email.
            </div>
          )}
        </div>

        {showResults && searching && (
          <div className={classes.results}>
            {[0, 1, 2].map((row) => (
              <div key={row} className={classes.skeletonRow}>
                <div className={classes.skeletonAvatar} />
                <div>
                  <div className={classes.skeletonLine} style={{ width: 120, height: 12 }} />
                  <div
                    className={classes.skeletonLine}
                    style={{ width: 200, height: 10, marginTop: 8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {showResults && !searching && (visibleSuggestions.length > 0 || showInviteRow) && (
          <div className={classes.results}>
            {visibleSuggestions.map(({ netId, name, email }) => {
              const hasAccess = peopleWithAccess.includes(netId);
              return (
                <button
                  key={netId}
                  type="button"
                  className={classes.result}
                  disabled={hasAccess}
                  onClick={() => addInvitee({ netId, label: name })}
                >
                  <PersonRow
                    name={name}
                    email={email}
                    muted={hasAccess}
                    action={hasAccess && <span className={classes.hasAccess}>Has access</span>}
                  />
                </button>
              );
            })}
            {showInviteRow && typedNetId && (
              <button
                type="button"
                className={classes.result}
                disabled={typedHasAccess}
                onClick={() => addInvitee({ netId: typedNetId, label: typedNetId })}
              >
                <PersonRow
                  name={`Invite ${typedNetId}@cornell.edu`}
                  pending
                  muted={typedHasAccess}
                  action={typedHasAccess && <span className={classes.hasAccess}>Has access</span>}
                />
              </button>
            )}
          </div>
        )}

        {selected.length > 0 && (
          <div className={classes.chips}>
            {selected.map(({ netId, label }) => (
              <span key={netId} className={classes.chip}>
                {label}
                <button
                  type="button"
                  className={classes.chipRemove}
                  aria-label={`Remove ${label}`}
                  onClick={() => setSelected(selected.filter((invitee) => invitee.netId !== netId))}
                >
                  <CloseIcon />
                </button>
              </span>
            ))}
          </div>
        )}

        <p className={classes.note}>{note}</p>
        {sendError && <p className={`${classes.note} ${classes.noteError}`}>{sendError}</p>}
      </div>
    </SharingDialog>
  );
};

export default InviteCollaboratorsModal;

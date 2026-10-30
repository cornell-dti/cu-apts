import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TagWithId } from '../../../../common/types/db-types';
import { colors } from '../../colors';

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 48,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    zIndex: 1,
    pointerEvents: 'none',
  },
  chip: {
    display: 'inline-block',
    boxSizing: 'border-box',
    color: colors.black,
    backgroundColor: colors.white,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '0.01em',
    padding: '8px 14px',
    minHeight: 32,
    borderRadius: 9999,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  },
});

const MAX = 2;

type Props = {
  tags?: readonly TagWithId[] | undefined;
};

const ApartmentImageTagBadges = ({ tags }: Props): ReactElement | null => {
  const classes = useStyles();
  if (!tags || tags.length === 0) {
    return null;
  }
  const shown = tags.slice(0, MAX);
  const extra = tags.length - shown.length;
  return (
    <div className={classes.root} aria-label="apartment tags">
      {shown.map((t) => (
        <span key={t.id} className={classes.chip}>
          {t.name}
        </span>
      ))}
      {extra > 0 && <span className={classes.chip}>+{extra}</span>}
    </div>
  );
};

export default ApartmentImageTagBadges;

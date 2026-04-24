import React, { ReactElement } from 'react';
import { makeStyles, Typography, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { TagWithId } from '../../../../common/types/db-types';
import { colors } from '../../colors';
import { FilterState } from './FilterSection';

const useStyles = makeStyles({
  section: {
    padding: '12px 16px 10px',
    borderBottom: '1px solid #E5E5E5',
  },
  label: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 8,
  },
  helper: {
    color: 'rgba(0, 0, 0, 0.45)',
    fontSize: 12,
    fontWeight: 400,
    marginBottom: 8,
    lineHeight: 1.35,
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    borderRadius: 9999,
    padding: '6px 8px 6px 12px',
    minHeight: 28,
    backgroundColor: colors.red1,
    color: colors.white,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.2,
    maxWidth: '100%',
  },
  chipInactive: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderRadius: 9999,
    minHeight: 28,
    padding: '6px 14px',
    backgroundColor: 'rgba(185, 70, 48, 0.12)',
    color: colors.red1,
    cursor: 'pointer',
    border: 'none',
    font: 'inherit',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    WebkitAppearance: 'none' as const,
    transition: 'background-color 0.15s ease',
    '&:hover': {
      backgroundColor: 'rgba(185, 70, 48, 0.2)',
    },
    '&:focus': {
      outline: 'none',
    },
  },
  name: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 160,
  },
  clearBtn: {
    padding: 2,
    color: colors.white,
    marginLeft: 2,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
  },
});

type Props = {
  allTags: TagWithId[];
  tagsLoading?: boolean;
  filters: FilterState;
  onChange: (f: FilterState) => void;
};

const TagSearchSection = ({
  allTags,
  tagsLoading = false,
  filters,
  onChange,
}: Props): ReactElement => {
  const c = useStyles();

  const selected = new Set(filters.tagIds);
  const toggle = (id: string) => {
    const next = new Set(filters.tagIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange({ ...filters, tagIds: Array.from(next) });
  };

  return (
    <div className={c.section} onMouseDown={(e) => e.preventDefault()} data-testid="search-by-tags">
      <Typography className={c.label} component="div">
        Search by tags
      </Typography>
      {tagsLoading && (
        <Typography className={c.helper} component="div">
          Loading tags…
        </Typography>
      )}
      {!tagsLoading && allTags.length === 0 && (
        <Typography className={c.helper} component="div">
          No tags in the directory yet. Once tags exist, you can filter search results with them.
        </Typography>
      )}
      <div className={c.row}>
        {!tagsLoading &&
          allTags.map((t) => {
            const isOn = selected.has(t.id);
            if (isOn) {
              return (
                <span key={t.id} className={c.chip} title={t.name}>
                  <span className={c.name}>{t.name}</span>
                  <IconButton
                    size="small"
                    className={c.clearBtn}
                    onClick={() => toggle(t.id)}
                    aria-label={`Remove ${t.name}`}
                  >
                    <CloseIcon style={{ fontSize: 16 }} />
                  </IconButton>
                </span>
              );
            }
            return (
              <button
                key={t.id}
                type="button"
                className={c.chipInactive}
                onClick={() => toggle(t.id)}
              >
                {t.name}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default TagSearchSection;

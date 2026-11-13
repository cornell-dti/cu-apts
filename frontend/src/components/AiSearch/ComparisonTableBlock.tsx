import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { Block, ListingSummary } from '../../../../common/types/ai-search-types';
import { colors } from '../../colors';
import { selectListings } from '../../utils/listingFormat';
import ComparisonRow from './ComparisonRow';
import SectionHeader from './SectionHeader';

// Hover intent: a row opens after the mouse rests on it, and closes shortly after it leaves.
const HOVER_OPEN_DELAY_MS = 150;
const HOVER_CLOSE_DELAY_MS = 200;

const useStyles = makeStyles({
  table: {
    marginTop: '12px',
    backgroundColor: colors.white,
    border: `1px solid ${colors.gray5}`,
    borderRadius: '10px',
    overflow: 'hidden',
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: '32px',
    padding: '10px 30px',
    backgroundColor: colors.gray3,
    fontSize: '14px',
    lineHeight: '28px',
    fontWeight: 600,
    color: colors.black,
  },
  propertyHeader: {
    flex: '0 0 160px',
  },
  priceHeader: {
    flex: '0 0 80px',
  },
  featuresHeader: {
    flex: '1 1 0',
  },
  // Matches the chevron column in the body rows.
  chevronSpacer: {
    flex: '0 0 16px',
  },
});

type Props = {
  readonly block: Extract<Block, { type: 'comparison_table' }>;
  readonly listings: Readonly<Record<string, ListingSummary>>;
};

/** ComparisonTableBlock – a headed table of listings; at most one row is expanded at a time. */
const ComparisonTableBlock = ({ block, listings }: Props): ReactElement => {
  const { table, headerRow, propertyHeader, priceHeader, featuresHeader, chevronSpacer } =
    useStyles();
  const [openId, setOpenId] = useState<string | null>(null);
  const openTimer = useRef<number>();
  const closeTimer = useRef<number>();

  const clearTimers = useCallback(() => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Entering a row cancels a pending close and (re)starts its open timer; leaving cancels the open
  // timer and starts the close timer. Moving from one row to another therefore swaps the open row
  // once the new one has been rested on, and quickly passing over rows opens nothing.
  const handleHoverStart = (id: string) => {
    clearTimers();
    openTimer.current = window.setTimeout(() => setOpenId(id), HOVER_OPEN_DELAY_MS);
  };

  const handleHoverEnd = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setOpenId(null), HOVER_CLOSE_DELAY_MS);
  };

  const handleToggle = (id: string) => {
    clearTimers();
    setOpenId((current) => (current === id ? null : id));
  };

  // A duplicate listing id keeps the first row's key feature.
  const keyFeatures = new Map<string, string>();
  block.rows.forEach((row) => {
    if (!keyFeatures.has(row.listingId)) {
      keyFeatures.set(row.listingId, row.keyFeature);
    }
  });
  const rows = selectListings(
    block.rows.map((row) => row.listingId),
    listings
  );

  return (
    <section>
      <SectionHeader heading={block.heading} intro={block.intro} />
      <div className={table}>
        <div className={headerRow}>
          <div className={propertyHeader}>Property</div>
          <div className={priceHeader}>Est. Price</div>
          <div className={featuresHeader}>Key Features</div>
          <div className={chevronSpacer} />
        </div>
        {rows.map((listing) => (
          <ComparisonRow
            key={listing.id}
            listing={listing}
            keyFeature={keyFeatures.get(listing.id) ?? ''}
            open={openId === listing.id}
            onToggle={() => handleToggle(listing.id)}
            onHoverStart={() => handleHoverStart(listing.id)}
            onHoverEnd={handleHoverEnd}
          />
        ))}
      </div>
    </section>
  );
};

export default ComparisonTableBlock;

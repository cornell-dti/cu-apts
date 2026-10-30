import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/core';
import { Block, ListingSummary } from '../../../../common/types/ai-search-types';
import { selectListings } from '../../utils/listingFormat';
import PropertyCard from './PropertyCard';
import SectionHeader from './SectionHeader';

const useStyles = makeStyles({
  cards: {
    // At most 3 equal columns that fill the row. Tracks are never narrower than 220px, so the grid
    // drops to 2 and then 1 column before cards get cramped. auto-fill keeps empty tracks, so a
    // row with fewer than 3 cards keeps the same card width. The 1px keeps rounding from
    // dropping the third column.
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(max(220px, calc((100% - 24px) / 3 - 1px)), 1fr))',
    gap: '12px',
    marginTop: '12px',
  },
});

type Props = {
  readonly block: Extract<Block, { type: 'property_cards' }>;
  readonly listings: Readonly<Record<string, ListingSummary>>;
};

/** PropertyCardsBlock – a headed group of listing cards. */
const PropertyCardsBlock = ({ block, listings }: Props): ReactElement => {
  const { cards } = useStyles();
  return (
    <section>
      <SectionHeader heading={block.heading} intro={block.intro} />
      <div className={cards}>
        {selectListings(block.listingIds, listings).map((listing) => (
          <PropertyCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
};

export default PropertyCardsBlock;

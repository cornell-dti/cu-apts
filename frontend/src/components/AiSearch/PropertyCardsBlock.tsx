import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/core';
import { Block, ListingSummary } from '../../../../common/types/ai-search-types';
import { selectListings } from '../../utils/listingFormat';
import PropertyCard from './PropertyCard';
import SectionHeader from './SectionHeader';

const useStyles = makeStyles({
  cards: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
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

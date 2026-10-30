import React, { ReactElement } from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { Block, ListingSummary } from '../../../../common/types/ai-search-types';
import { colors } from '../../colors';
import ComparisonTableBlock from './ComparisonTableBlock';
import NeighborhoodsBlock from './NeighborhoodsBlock';
import PropertyCardsBlock from './PropertyCardsBlock';

const useStyles = makeStyles({
  text: {
    fontSize: '18px',
    lineHeight: '28px',
    fontWeight: 400,
    color: colors.black,
    margin: 0,
  },
});

type BlockProps<T extends Block['type']> = { readonly block: Extract<Block, { type: T }> };

const TextBlock = ({ block }: BlockProps<'text'>): ReactElement => {
  const { text } = useStyles();
  return <Typography className={text}>{block.content}</Typography>;
};

const renderBlock = (
  block: Block,
  listings: Readonly<Record<string, ListingSummary>>
): ReactElement | null => {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />;
    case 'property_cards':
      return <PropertyCardsBlock block={block} listings={listings} />;
    case 'comparison_table':
      return <ComparisonTableBlock block={block} listings={listings} />;
    case 'neighborhoods':
      return <NeighborhoodsBlock block={block} />;
    default: {
      // Compile-time exhaustiveness: adding a Block type without a case above is a type error.
      const unhandled: never = block;
      // At runtime the backend may send a type we don't know; skip it rather than crash.
      console.warn(
        'BlockRenderer: unknown block type',
        (unhandled as { type?: unknown } | null)?.type
      );
      return null;
    }
  }
};

type Props = {
  readonly block: Block;
  readonly listings: Readonly<Record<string, ListingSummary>>;
};

/**
 * BlockRenderer – renders one AI search response block by mapping its `type` to a component.
 * Unknown types render nothing and log a warning.
 */
const BlockRenderer = ({ block, listings }: Props): ReactElement | null =>
  renderBlock(block, listings);

export default BlockRenderer;

import React, { ReactElement } from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { Block } from '../../../../common/types/ai-search-types';
import { colors } from '../../colors';
import { getNeighborhoodSearchPath, selectNeighborhoods } from '../../utils/neighborhoods';
import SectionHeader from './SectionHeader';

const useStyles = makeStyles({
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '12px',
  },
  callout: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.gray3,
  },
  bar: {
    flex: '0 0 3px',
    backgroundColor: colors.red1,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px 25px 15px',
    borderRadius: '5px',
    minWidth: 0,
  },
  text: {
    fontSize: '18px',
    lineHeight: '28px',
    fontWeight: 400,
    color: colors.black,
  },
  name: {
    fontWeight: 600,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 10px',
    borderRadius: '17px',
    backgroundColor: colors.red1,
    color: colors.white,
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '-0.32px',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    '&:hover': {
      backgroundColor: colors.red7,
      textDecoration: 'none',
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.black}`,
      outlineOffset: '2px',
    },
  },
});

type Props = {
  readonly block: Extract<Block, { type: 'neighborhoods' }>;
};

/** NeighborhoodsBlock – curated neighborhood callouts, each linking to an area-filtered search. */
const NeighborhoodsBlock = ({ block }: Props): ReactElement => {
  const { list, callout, bar, info, text, name, button } = useStyles();
  return (
    <section>
      <SectionHeader heading={block.heading} />
      <div className={list}>
        {selectNeighborhoods(block.neighborhoods).map((item) => (
          <div key={item.id} className={callout}>
            <div className={bar} />
            <div className={info}>
              <Typography className={text}>
                <span className={name}>
                  {item.info.displayName} ({item.info.distanceText}):
                </span>{' '}
                {item.info.description}
              </Typography>
              <Link
                to={getNeighborhoodSearchPath(item.id)}
                className={button}
                aria-label={`Search apartments in ${item.info.displayName}`}
              >
                Search {item.shortName} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NeighborhoodsBlock;

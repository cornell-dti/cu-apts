import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { colors } from '../../colors';
import HeartRating from '../utils/HeartRating';
import { CardData } from '../../App';

type Props = {
  data: CardData;
  selected: boolean;
  onClick: () => void;
};

const useStyles = makeStyles(() => ({
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    border: '1px solid #eaeaea',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background-color 0.15s',
    '&:hover': {
      borderColor: colors.red1,
    },
  },
  cardSelected: {
    borderColor: colors.red1,
    borderWidth: 2,
    backgroundColor: colors.red5,
  },
  photo: {
    width: 120,
    height: 90,
    borderRadius: 8,
    objectFit: 'cover' as const,
    backgroundColor: '#eaeaea',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    marginLeft: 16,
    minWidth: 0,
  },
  name: {
    fontWeight: 600,
    fontSize: 18,
    lineHeight: '26px',
    color: colors.black,
  },
  address: {
    fontSize: 14,
    lineHeight: '20px',
    color: colors.gray1,
  },
  reviews: {
    fontSize: 14,
    lineHeight: '20px',
    color: colors.gray1,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 14,
    color: colors.gray1,
  },
  ratingSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: 16,
  },
  ratingValue: {
    fontWeight: 700,
    fontSize: 36,
    lineHeight: 'normal',
    color: colors.black,
  },
}));

const SearchResultCard = ({ data, selected, onClick }: Props) => {
  const classes = useStyles();
  const { buildingData, numReviews, avgRating, avgPrice } = data;

  const priceDisplay = avgPrice
    ? `$${Math.round((avgPrice / 1000) * 10) / 10}K`
    : buildingData.price
    ? `$${buildingData.price}`
    : null;

  const bedDisplay =
    buildingData.numBeds != null && buildingData.numBeds > 0 ? `${buildingData.numBeds} Bed` : null;

  return (
    <div
      className={`${classes.card} ${selected ? classes.cardSelected : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {buildingData.photos && buildingData.photos.length > 0 ? (
        <img src={buildingData.photos[0]} alt={buildingData.name} className={classes.photo} />
      ) : (
        <div className={classes.photo} />
      )}

      <div className={classes.info}>
        <Typography className={classes.name}>{buildingData.name}</Typography>
        <Typography className={classes.address}>{buildingData.address}</Typography>
        <Typography className={classes.reviews}>{numReviews} Reviews</Typography>
        <div className={classes.metaRow}>
          {priceDisplay && <span className={classes.metaItem}>{priceDisplay}</span>}
          {bedDisplay && <span className={classes.metaItem}>{bedDisplay}</span>}
        </div>
      </div>

      <div className={classes.ratingSection}>
        <Typography className={classes.ratingValue}>
          {avgRating ? avgRating.toFixed(1) : 'N/A'}
        </Typography>
        <HeartRating value={avgRating || 0} precision={0.1} readOnly size="small" />
      </div>
    </div>
  );
};

export default SearchResultCard;

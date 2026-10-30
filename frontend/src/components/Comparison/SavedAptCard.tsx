import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { colors } from '../../colors';
import HeartRating from '../utils/HeartRating';
import { CardData } from '../../App';
import savedIconFilled from '../../assets/saved-icon-filled.svg';

type Props = {
  data: CardData;
  selected: boolean;
  onClick: () => void;
};

const useStyles = makeStyles(() => ({
  card: {
    borderRadius: 8,
    border: '1px solid #eaeaea',
    overflow: 'hidden',
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
  photoContainer: {
    position: 'relative' as const,
    width: '100%',
    height: 140,
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    backgroundColor: '#eaeaea',
    display: 'block',
  },
  bookmarkIcon: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 16,
    height: 22,
  },
  content: {
    padding: '10px 12px',
  },
  nameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontWeight: 600,
    fontSize: 14,
    lineHeight: '20px',
    color: colors.black,
  },
  ratingSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    fontSize: 14,
    fontWeight: 600,
    color: colors.red1,
  },
  address: {
    fontSize: 12,
    lineHeight: '18px',
    color: colors.gray1,
  },
  reviews: {
    fontSize: 12,
    lineHeight: '18px',
    color: colors.gray1,
    marginBottom: 6,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: colors.gray1,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#eaeaea',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a8c8f0',
    borderRadius: 2,
  },
}));

const SavedAptCard = ({ data, selected, onClick }: Props) => {
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
      <div className={classes.photoContainer}>
        {buildingData.photos && buildingData.photos.length > 0 ? (
          <img src={buildingData.photos[0]} alt={buildingData.name} className={classes.photo} />
        ) : (
          <div className={classes.photo} />
        )}
        <img src={savedIconFilled} alt="saved" className={classes.bookmarkIcon} />
      </div>

      <div className={classes.content}>
        <div className={classes.nameRow}>
          <div>
            <Typography className={classes.name}>{buildingData.name}</Typography>
            <Typography className={classes.address}>{buildingData.address}</Typography>
            <Typography className={classes.reviews}>{numReviews} Reviews</Typography>
          </div>
          {avgRating && (
            <div className={classes.ratingSmall}>
              <HeartRating value={1} max={1} readOnly fontSize={14} />
              {avgRating.toFixed(1)}
            </div>
          )}
        </div>

        <div className={classes.metaRow}>
          {priceDisplay && <span className={classes.metaItem}>{priceDisplay}</span>}
          {bedDisplay && <span className={classes.metaItem}>{bedDisplay}</span>}
        </div>

        <div className={classes.progressBar}>
          <div className={classes.progressFill} style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
};

export default SavedAptCard;

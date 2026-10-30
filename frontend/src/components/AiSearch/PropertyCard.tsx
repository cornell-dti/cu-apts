import React, { ReactElement } from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { Link } from 'react-router-dom';
import { ListingSummary } from '../../../../common/types/ai-search-types';
import ApartmentImg from '../../assets/apartment-placeholder.svg';
import { colors } from '../../colors';
import { formatListingBeds, formatListingPrice } from '../../utils/listingFormat';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box',
    // Figma card is 265px wide; shrink on narrow screens.
    width: '265px',
    maxWidth: '100%',
    padding: '12px',
    backgroundColor: colors.white,
    border: `0.85px solid ${colors.gray5}`,
    borderRadius: '10px',
    color: colors.black,
    textDecoration: 'none',
    '&:hover': {
      backgroundColor: colors.red5,
      textDecoration: 'none',
    },
  },
  photo: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  info: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '4px',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  name: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: 'normal',
  },
  address: {
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: 'normal',
  },
  stat: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '24px',
  },
  rating: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '4px',
    flexShrink: 0,
  },
  heart: {
    color: colors.red1,
    fontSize: '18px',
    marginTop: '3px',
  },
});

type Props = {
  readonly listing: ListingSummary;
};

/** PropertyCard – a listing card for AI search results; the whole card links to the apartment. */
const PropertyCard = ({ listing }: Props): ReactElement => {
  const { card, photo, info, details, name, address, stat, rating, heart } = useStyles();
  const beds = formatListingBeds(listing.minBeds, listing.maxBeds);

  return (
    <Link to={`/apartment/${listing.id}`} className={card}>
      <img src={listing.photoUrl ?? ApartmentImg} alt={listing.name} className={photo} />
      <div className={info}>
        <div className={details}>
          <div>
            <Typography className={name}>{listing.name}</Typography>
            <Typography className={address}>{listing.address}</Typography>
          </div>
          <div>
            {beds && <Typography className={stat}>{beds}</Typography>}
            <Typography className={stat}>
              {formatListingPrice(listing.minPrice, listing.maxPrice)}
            </Typography>
          </div>
        </div>
        {listing.avgRating !== null && (
          <div className={rating}>
            <Typography className={stat}>{listing.avgRating.toFixed(1)}</Typography>
            <FavoriteIcon className={heart} />
          </div>
        )}
      </div>
    </Link>
  );
};

export default PropertyCard;

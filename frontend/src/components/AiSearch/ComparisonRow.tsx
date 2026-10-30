import React, { ReactElement } from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { ListingSummary } from '../../../../common/types/ai-search-types';
import ApartmentImg from '../../assets/apartment-placeholder.svg';
import chevronIcon from '../../assets/ai-search-chevron-down.svg';
import { colors } from '../../colors';
import { formatEstimatedPrice, formatReviewCount } from '../../utils/listingFormat';
import HeartRating from '../utils/HeartRating';

const useStyles = makeStyles((theme) => ({
  row: {
    backgroundColor: colors.white,
    borderTop: `1px solid ${colors.gray5}`,
  },
  header: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '32px',
    padding: '10px 30px',
  },
  // Transparent button covering the whole row so the row and chevron both toggle it. The cells
  // sit above it with pointer events off, so the property link is the only other click target.
  toggle: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: colors.red5,
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.red1}`,
      outlineOffset: '-2px',
    },
  },
  cell: {
    position: 'relative',
    pointerEvents: 'none',
    fontSize: '14px',
    lineHeight: '28px',
    color: colors.black,
  },
  name: {
    flex: '0 0 160px',
    minWidth: 0,
    fontWeight: 600,
  },
  nameLink: {
    pointerEvents: 'auto',
    color: colors.red1,
    textDecoration: 'underline',
    textDecorationThickness: '12%',
  },
  price: {
    flex: '0 0 80px',
    minWidth: 0,
    fontWeight: 400,
  },
  priceOpen: {
    fontWeight: 600,
  },
  keyFeature: {
    flex: '1 1 0',
    minWidth: 0,
    fontWeight: 400,
    color: colors.gray1,
  },
  chevron: {
    position: 'relative',
    flex: '0 0 auto',
    width: '16px',
    height: '8px',
    pointerEvents: 'none',
    transition: 'transform 0.2s',
    '& img': {
      position: 'absolute',
      top: '-0.7px',
      left: '-0.7px',
      display: 'block',
    },
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  panelWrapper: {
    padding: '0 30px 10px',
  },
  panel: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '14px',
    boxSizing: 'border-box',
    padding: '14px',
    backgroundColor: colors.white,
    border: `0.57px solid ${colors.gray5}`,
    borderRadius: '11.5px',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
  photo: {
    flex: '0 0 auto',
    width: '163px',
    height: '161px',
    objectFit: 'cover',
    borderRadius: '5.74px',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    color: colors.black,
  },
  panelName: {
    fontSize: '17.21px',
    lineHeight: '20.66px',
    fontWeight: 700,
  },
  panelAddress: {
    marginTop: '4px',
    fontSize: '12.62px',
    lineHeight: '18.36px',
    fontWeight: 400,
  },
  ratingRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    marginTop: '9px',
  },
  reviewCount: {
    fontSize: '12.62px',
    lineHeight: '18.36px',
    fontWeight: 600,
  },
  review: {
    maxWidth: '506px',
    marginTop: '14px',
    fontSize: '12.62px',
    lineHeight: '18.36px',
    fontWeight: 400,
  },
}));

type Props = {
  readonly listing: ListingSummary;
  readonly keyFeature: string;
  readonly open: boolean;
  readonly onToggle: () => void;
};

/**
 * ComparisonRow – one collapsible row of the comparison table. The row toggles on click, Enter or
 * Space; when open, the property name links to the apartment and a detail panel shows below.
 */
const ComparisonRow = ({ listing, keyFeature, open, onToggle }: Props): ReactElement => {
  const classes = useStyles();
  const panelId = `ai-comparison-panel-${listing.id}`;
  const estimatedPrice = formatEstimatedPrice(listing.minPrice);

  return (
    <div className={classes.row}>
      <div className={classes.header}>
        <button
          type="button"
          className={classes.toggle}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-label={`${listing.name}, ${estimatedPrice}. ${keyFeature}`}
          onClick={onToggle}
        />
        <div className={`${classes.cell} ${classes.name}`}>
          {open ? (
            <Link to={`/apartment/${listing.id}`} className={classes.nameLink}>
              {listing.name}
            </Link>
          ) : (
            <span aria-hidden="true">{listing.name}</span>
          )}
        </div>
        <div
          className={`${classes.cell} ${classes.price} ${open ? classes.priceOpen : ''}`}
          aria-hidden="true"
        >
          {estimatedPrice}
        </div>
        <div className={`${classes.cell} ${classes.keyFeature}`} aria-hidden="true">
          {keyFeature}
        </div>
        <div className={`${classes.chevron} ${open ? classes.chevronOpen : ''}`} aria-hidden="true">
          <img src={chevronIcon} alt="" />
        </div>
      </div>
      {open && (
        <div className={classes.panelWrapper} id={panelId}>
          <div className={classes.panel}>
            <img
              src={listing.photoUrl ?? ApartmentImg}
              alt={listing.name}
              className={classes.photo}
            />
            <div className={classes.details}>
              <Typography className={classes.panelName}>{listing.name}</Typography>
              <Typography className={classes.panelAddress}>{listing.address}</Typography>
              {(listing.avgRating !== null || listing.numReviews > 0) && (
                <div className={classes.ratingRow}>
                  {listing.avgRating !== null && (
                    <HeartRating
                      value={listing.avgRating}
                      readOnly
                      fontSize={16}
                      getLabelText={(value) => `${value} out of 5 hearts`}
                    />
                  )}
                  {listing.numReviews > 0 && (
                    <Typography className={classes.reviewCount}>
                      {formatReviewCount(listing.numReviews)}
                    </Typography>
                  )}
                </div>
              )}
              {listing.featuredReview && (
                <Typography className={classes.review}>{listing.featuredReview}</Typography>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonRow;

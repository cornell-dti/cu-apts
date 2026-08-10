import React, { ReactElement } from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { apartmentFloorPlan } from '../../../../common/types/db-types';
import { colors } from '../../colors';

type Props = {
  readonly plan: apartmentFloorPlan;
};

const useStyles = makeStyles({
  card: {
    background: colors.white,
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  image: {
    width: 88,
    height: 88,
    objectFit: 'cover',
    borderRadius: 8,
    flexShrink: 0,
    background: colors.gray5,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: 700,
    fontSize: 16,
    color: colors.black,
    marginBottom: 2,
  },
  meta: {
    fontSize: 14,
    color: colors.gray1,
    lineHeight: 1.4,
  },
  priceBlock: {
    textAlign: 'right',
    flexShrink: 0,
  },
  priceValue: {
    fontWeight: 700,
    fontSize: 22,
    color: colors.black,
    lineHeight: 1.1,
  },
  priceNA: {
    fontWeight: 700,
    fontSize: 22,
    color: colors.gray2,
    lineHeight: 1.1,
  },
  priceSub: {
    fontSize: 13,
    color: colors.gray1,
  },
});

/**
 * FloorPlanCard renders a single floor plan row showing:
 * - Optional floor plan thumbnail image
 * - Bed/bath count, sqft, units available
 * - Price per person (or N/A when costPerPerson is 0)
 */
const FloorPlanCard = ({ plan }: Props): ReactElement => {
  const { card, image, info, title, meta, priceBlock, priceValue, priceNA, priceSub } = useStyles();
  const { photo, bedrooms, bathrooms, costPerPerson, unitsAvaliable, sqft } = plan;
  const hasPrice = costPerPerson > 0;

  return (
    <div className={card}>
      {photo && <img src={photo} alt="floor plan" className={image} />}

      <div className={info}>
        <Typography className={title}>
          {bedrooms} Beds {bathrooms} bath
        </Typography>
        <Typography className={meta}>{sqft} sqft</Typography>
        <Typography className={meta}>{unitsAvaliable} units available</Typography>
      </div>

      <div className={priceBlock}>
        {hasPrice ? (
          <>
            <Typography className={priceValue} data-testid="floorplan-price">
              ${costPerPerson.toLocaleString()}
            </Typography>
            <Typography className={priceSub}>per person</Typography>
          </>
        ) : (
          <>
            <Typography className={priceNA} data-testid="floorplan-price">
              N/A
            </Typography>
            <Typography className={priceSub}>no data for pricing</Typography>
          </>
        )}
      </div>
    </div>
  );
};

export default FloorPlanCard;

import React, { ReactElement } from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { ApartmentFloorPlan } from '../../../../common/types/db-types';
import { colors } from '../../colors';

type Props = {
  readonly plan: ApartmentFloorPlan;
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
  imagePlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 8,
    flexShrink: 0,
    background: colors.gray5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: 6,
  },
  imagePlaceholderText: {
    fontSize: 11,
    lineHeight: 1.3,
    color: colors.gray2,
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
 * pluralize – Formats a count with its unit label, adding "s" when the count is not 1.
 *
 * @param {number} count – The quantity to describe.
 * @param {string} unit – The singular form of the unit.
 *
 * @return {string} – The count and correctly pluralized unit, e.g. "1 bed" or "2 beds".
 */
const pluralize = (count: number, unit: string): string =>
  `${count} ${unit}${count === 1 ? '' : 's'}`;

/**
 * isMeasured – Narrows an optional numeric floor plan field to a usable number.
 *
 * @remarks
 * Floor plans derived from room types carry no square footage or unit count,
 * and stored plans may hold a non-numeric value. Both cases must be omitted
 * from the rendered card rather than displayed as "undefined" or "NaN".
 *
 * @param {number | undefined} value – The field to test.
 *
 * @return {boolean} – True when the value is a finite number.
 */
const isMeasured = (value: number | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/**
 * FloorPlanCard Component – Displays a single floor plan offered by an apartment.
 *
 * @remarks
 * Shows an optional thumbnail, the bed/bath configuration, square footage and
 * unit availability, and the per-person price. Square footage and availability
 * are omitted entirely when absent rather than rendering "undefined", and the
 * price falls back to an N/A state when no pricing data exists.
 *
 * @param {ApartmentFloorPlan} props.plan – The floor plan to render.
 *
 * @return {ReactElement} – The rendered FloorPlanCard component.
 */
const FloorPlanCard = ({ plan }: Props): ReactElement => {
  const {
    card,
    image,
    imagePlaceholder,
    imagePlaceholderText,
    info,
    title,
    meta,
    priceBlock,
    priceValue,
    priceNA,
    priceSub,
  } = useStyles();
  const { photo, bedrooms, bathrooms, costPerPerson, unitsAvailable, sqft } = plan;
  const hasPrice = costPerPerson > 0;

  return (
    <div className={card}>
      {photo ? (
        <img src={photo} alt="floor plan" className={image} />
      ) : (
        <div className={imagePlaceholder} data-testid="floorplan-image-placeholder">
          <Typography className={imagePlaceholderText}>No image available</Typography>
        </div>
      )}

      <div className={info}>
        <Typography className={title}>
          {pluralize(bedrooms, 'Bed')} {pluralize(bathrooms, 'bath')}
        </Typography>
        {isMeasured(sqft) && <Typography className={meta}>{sqft} sqft</Typography>}
        {isMeasured(unitsAvailable) && (
          <Typography className={meta}>{pluralize(unitsAvailable, 'unit')} available</Typography>
        )}
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

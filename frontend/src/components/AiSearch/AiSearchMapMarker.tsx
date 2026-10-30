import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';
import mapPinIcon from '../../assets/map-pin.svg';
import { colors } from '../../colors';

const PIN_HEIGHT = 32;
const PIN_WIDTH = PIN_HEIGHT * 0.75;

const useStyles = makeStyles({
  marker: {
    position: 'relative',
    width: `${PIN_WIDTH}px`,
    height: `${PIN_HEIGHT}px`,
  },
  // Anchors the pin's tip (85% down the icon, above its shadow) on the coordinate.
  pin: {
    display: 'block',
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transform: 'translate(-50%, -85%)',
    transition: 'scale 0.15s',
    '&:focus-visible': {
      outline: `2px solid ${colors.black}`,
      outlineOffset: '2px',
    },
  },
  pinOpen: {
    scale: '1.2',
  },
  icon: {
    display: 'block',
    height: `${PIN_HEIGHT}px`,
    width: `${PIN_WIDTH}px`,
  },
  // Sits flush against the pin so the cursor can move onto it without leaving the marker.
  tooltip: {
    position: 'absolute',
    bottom: `${PIN_HEIGHT * 0.85 + 4}px`,
    left: 0,
    transform: 'translateX(-50%)',
    paddingBottom: '6px',
  },
  tooltipBody: {
    padding: '6px 10px',
    backgroundColor: colors.white,
    border: `1px solid ${colors.gray5}`,
    borderRadius: '6px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
    whiteSpace: 'nowrap',
  },
  name: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 600,
    color: colors.red1,
    textDecoration: 'underline',
  },
});

type Props = {
  // Injected by google-map-react to position the marker.
  readonly lat: number;
  readonly lng: number;
  readonly id: string;
  readonly name: string;
  readonly open: boolean;
  readonly onHoverChange: (hovered: boolean) => void;
  readonly onClick: () => void;
};

/** AiSearchMapMarker – a listing pin whose name tooltip appears on hover, focus or click. */
const AiSearchMapMarker = ({ id, name, open, onHoverChange, onClick }: Props): ReactElement => {
  const { marker, pin, pinOpen, icon, tooltip, tooltipBody, name: nameClass } = useStyles();
  return (
    <div
      className={marker}
      style={{ zIndex: open ? 1000 : 1 }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <button
        type="button"
        className={`${pin} ${open ? pinOpen : ''}`}
        aria-label={name}
        aria-expanded={open}
        onClick={(e) => {
          // Keep the click from reaching the map, which closes any open tooltip.
          e.stopPropagation();
          onClick();
        }}
      >
        <img src={mapPinIcon} alt="" className={icon} />
      </button>
      {open && (
        <div className={tooltip}>
          <div className={tooltipBody}>
            <Link to={`/apartment/${id}`} className={nameClass}>
              {name}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiSearchMapMarker;

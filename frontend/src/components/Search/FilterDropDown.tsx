import React, { useState } from 'react';
import {
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
  Menu,
  MenuItem,
  SvgIcon,
  Typography,
  IconButton,
} from '@material-ui/core';
import { colors } from '../../colors';
import { makeStyles } from '@material-ui/styles';
import { ReactComponent as ArrowDownIcon } from '../../assets/dropdown-arrow-down.svg';
import { FilterState, LocationType, PriceInputBox } from './FilterSection';
import plusIcon from '../../assets/filter-plus-icon.svg';
import minusIcon from '../../assets/filter-minus-icon.svg';

const expandArrow = (direction: boolean, color: string) => {
  return (
    <div
      style={{
        padding: '0 0 0 10px',
        transform: direction ? 'scaleY(-1)' : 'none',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <ArrowDownIcon style={{ color: color }} />
    </div>
  );
};

type Props = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  label: 'Location' | 'Price' | 'Beds & Baths';
  isMobile?: boolean;
  onApply: () => void;
};

const useStyles = makeStyles({
  dropdownButton: {
    height: '44px',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid  #E8E8E8`,
    borderRadius: '8px',
    boxSizing: 'border-box',
    width: 'fit-content',
    textTransform: 'none',
    transition: 'background 0.2s, color 0.2s',
  },
  labelText: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '28px',
    transition: 'color 0.2s',
  },
  filterMenuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'absolute',
    top: '115%',
    left: '0',
    padding: '16px 16px 16px 16px',
    borderRadius: '8px',
    background: '#fff',
    zIndex: 1000,
    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.10)',
  },
  checkBox: {
    color: '#B94630',
    '&.Mui-checked': {
      color: '#B94630',
    },
  },
  locationChoices: {
    color: 'black',
    borderBottom: '1px solid #E5E5E5',
    width: '100%',
    height: '48px',
    margin: 0,
    '&:hover': {
      backgroundColor: '#F9F9F9',
    },
  },
  applyButton: {
    backgroundColor: colors.red1,
    color: 'white',
    '&:hover': {
      backgroundColor: 'grey',
    },
    width: '100%',
    height: '35px',
    padding: '8px 12px',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '18px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '28px',
  },
  priceInputsContainerRow: {
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
    position: 'relative',
    flexDirection: 'row',
    gap: '24px',
  },
  amenitiesRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 'auto',
    justifyContent: 'space-between',
  },
  numberControlContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '3.5px',
    justifyContent: 'space-between',
    width: '25%',
  },
  numberControl: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '3.5px',
    color: 'black',
    border: '1px solid #B94630',
    width: '17.5px',
    height: '17.5px',
    outline: 'none',
    transition: 'transform 0.2s ease',
    '&.MuiIconButton-root': {
      backgroundColor: 'transparent',
      border: '0.5px solid #B94630 !important',
    },
    '&:hover': {
      transform: 'scale(1.05)',
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
  },
  filterText: {
    fontSize: '18px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '28px',
  },
});

/**
 * FilterDropDown - A dropdown filter component for apartment search criteria.
 *
 * @remarks
 * This component provides a dropdown menu for filtering apartment search results.
 * It handles location selection, price range inputs, and bedroom/bathroom counts.
 * The component uses Material-UI components and custom styling.
 *
 * @param {FilterState} props.filters - Current filter state containing locations, price ranges, and room counts
 * @param {(filters: FilterState) => void} props.onChange - Callback function when filters are changed
 * @param {'Location' | 'Price' | 'Rooms'} props.label - Label indicating which type of filter this dropdown controls
 * @param {boolean} props.isMobile - Flag indicating if component is being rendered on mobile
 * @param {() => void} props.onApply - Callback function when filters are applied
 *
 * @returns {ReactElement} A dropdown filter component with an expandable menu
 */
export default function FilterDropDown({ filters, onChange, label, isMobile, onApply }: Props) {
  const [open, setOpen] = useState(false);

  const LOCATIONS: LocationType[] = ['Collegetown', 'North', 'West', 'Downtown'];

  const {
    dropdownButton,
    labelText,
    filterMenuContainer,
    checkBox,
    locationChoices,
    applyButton,
    priceInputsContainerRow,
    numberControlContainer,
    numberControl,
    filterText,
    amenitiesRow,
  } = useStyles();

  const color = open ? '#000' : '#898989';

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(!open);
  };

  const handleLocationChange = (location: LocationType) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter((loc: LocationType) => loc !== location)
      : [...filters.locations, location];
    onChange({ ...filters, locations: newLocations });
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    onChange({ ...filters, [field]: value });
    console.log(value);
  };

  const handleNumberChange = (field: 'bedrooms' | 'bathrooms', increment: boolean) => {
    const currentValue = filters[field];
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    onChange({ ...filters, [field]: newValue });
  };

  const renderFilterMenu = () => {
    switch (label) {
      case 'Location':
        return (
          <div className={filterMenuContainer} style={{ width: '130%' }}>
            <Grid container direction="column">
              {LOCATIONS.map((location) => (
                <FormControlLabel
                  key={location}
                  control={
                    <Checkbox
                      checked={filters.locations.includes(location)}
                      onChange={() => handleLocationChange(location)}
                      className={checkBox}
                      disableRipple
                    />
                  }
                  label={location}
                  className={locationChoices}
                />
              ))}
            </Grid>
            <Button className={applyButton} onClick={onApply}>
              Apply
            </Button>
          </div>
        );
      case 'Price':
        return (
          <div className={filterMenuContainer} style={{ width: '190%' }}>
            <div className={priceInputsContainerRow}>
              <PriceInputBox
                label="Min Price"
                value={filters.minPrice}
                placeholder="No Min"
                onChange={(val) => handlePriceChange('minPrice', val)}
              />
              <span style={{ fontSize: 24, color: 'black' }}>-</span>
              <PriceInputBox
                label="Max Price"
                value={filters.maxPrice}
                placeholder="No Max"
                onChange={(val) => handlePriceChange('maxPrice', val)}
              />
            </div>
            <Button className={applyButton} onClick={onApply}>
              Apply
            </Button>
          </div>
        );
      case 'Beds & Baths':
        return (
          <div className={filterMenuContainer} style={{ width: '140%' }}>
            <div className={amenitiesRow}>
              <Typography className={filterText}>Bedrooms</Typography>
              <div className={numberControlContainer}>
                <IconButton
                  disableRipple
                  className={numberControl}
                  size="small"
                  onClick={() => handleNumberChange('bedrooms', false)}
                >
                  <img src={minusIcon} alt="minus" />
                </IconButton>
                <Typography className={filterText}>{filters.bedrooms}</Typography>
                <IconButton
                  disableRipple
                  className={numberControl}
                  size="small"
                  onClick={() => handleNumberChange('bedrooms', true)}
                >
                  <img src={plusIcon} alt="plus" />
                </IconButton>
              </div>
            </div>
            <div className={amenitiesRow}>
              <Typography className={filterText}>Bathrooms</Typography>
              <div className={numberControlContainer}>
                <IconButton
                  disableRipple
                  className={numberControl}
                  size="small"
                  onClick={() => handleNumberChange('bathrooms', false)}
                >
                  <img src={minusIcon} alt="minus" />
                </IconButton>
                <Typography className={filterText}>{filters.bathrooms}</Typography>
                <IconButton
                  disableRipple
                  className={numberControl}
                  size="small"
                  onClick={() => handleNumberChange('bathrooms', true)}
                >
                  <img src={plusIcon} alt="plus" />
                </IconButton>
              </div>
            </div>
            <Button className={applyButton} onClick={onApply}>
              Apply
            </Button>
          </div>
        );
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <Button
        id="basic-button"
        aria-controls="basic-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        className={dropdownButton}
        disableRipple
        style={{
          background: open ? '#E8E8E8' : '#fff',
        }}
      >
        <Typography className={labelText} style={{ color }}>
          {label}
        </Typography>
        {expandArrow(open, color)}
      </Button>

      {open && renderFilterMenu()}
    </div>
  );
}

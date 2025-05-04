import React, { useState } from 'react';
import {
  makeStyles,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  IconButton,
} from '@material-ui/core';
import { colors } from '../../colors';
import plusIcon from '../../assets/filter-plus-icon.svg';
import minusIcon from '../../assets/filter-minus-icon.svg';
import { ApartmentWithId } from '../../../../common/types/db-types';
import { CardData } from '../../App';

const useStyles = makeStyles({
  filterContainer: {
    position: 'absolute',
    zIndex: 1,
    minWidth: '100%',
    backgroundColor: 'white',
    borderRadius: '0px 0px 10px 10px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #E5E5E5',
    boxShadow: '0px 0px 4px 2px rgba(0, 0, 0, 0.05)',
  },
  optionsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    boxSizing: 'border-box',
    gap: 'auto',
    justifyContent: 'space-between',
  },
  footerContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    boxSizing: 'border-box',
    gap: 'auto',
    justifyContent: 'space-between',
    padding: '12px 18px',
    alignItems: 'center',
  },
  locationSection: {
    marginBottom: '1rem',
    backgroundColor: colors.white,
    padding: '8px',
    paddingTop: '12px',
  },
  priceSection: {
    marginBottom: '1rem',
    backgroundColor: colors.white,
    padding: '12px',
  },
  bedsbathsSection: {
    marginBottom: '1rem',
    backgroundColor: colors.white,
    padding: '12px',
    paddingRight: '18px',
  },
  sectionTitle: {
    marginBottom: '0.5rem',
    color: 'rgba(0, 0, 0, 0.50)',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '20px',
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
  priceInputContainer: {
    position: 'relative',
    height: '100%',
  },
  priceTextFieldBox: {
    '& .MuiOutlinedInput-root': {
      padding: '0px',
      height: '66px',
      paddingTop: '20px',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0, 0, 0, 0.5)',
      },
      '&:hover': {
        borderColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '4px 8px',
      height: 'auto',
      boxSizing: 'border-box',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: 1.5,
      borderColor: '#E5E5E5',
      borderRadius: '5px',
    },
  },
  minMaxLabel: {
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '20px',
    opacity: 0.5,
    position: 'absolute',
    left: '50%',
    top: '15%',
    transform: 'translateX(-50%)',
    width: '100%',
    textAlign: 'center',
  },
  pricePlaceholder: {
    fontSize: '18px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '28px',
    textAlign: 'center',
    '&::placeholder': {
      color: 'black',
      opacity: 1,
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
  filterText: {
    fontSize: '18px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '28px',
  },
  checkBox: {
    color: '#B94630',
    '&.Mui-checked': {
      color: '#B94630',
    },
  },
  divisionLine: {
    fontSize: 24,
    border: '0.90px solid #E5E5E5',
    height: '208px',
    position: 'relative',
    transform: 'translateY(12%)',
    margin: '0',
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
  amenitiesRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 'auto',
    justifyContent: 'space-between',
    marginTop: '12px',
    marginBottom: '12px',
  },
  searchResultText: {
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '20px',
    opacity: 0.5,
  },
  searchButton: {
    display: 'flex',
    padding: '8px 24px',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: '4px',
    background: '#B94630',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '20px',
    color: 'white',
    cursor: 'pointer',
    '&:hover': {
      background: '#D15B42',
      scale: '1.02',
    },
    '&:active': {
      scale: '0.98',
    },
  },
});

export type LocationType = 'Collegetown' | 'North' | 'West' | 'Downtown';

export type FilterState = {
  locations: LocationType[];
  minPrice: string;
  maxPrice: string;
  bedrooms: number;
  bathrooms: number;
  initialSortBy: keyof CardData | keyof ApartmentWithId | 'originalOrder';
  initialSortLowToHigh: boolean;
};

export const defaultFilters: FilterState = {
  locations: [],
  minPrice: '',
  maxPrice: '',
  bedrooms: 0,
  bathrooms: 0,
  initialSortBy: 'avgRating',
  initialSortLowToHigh: false,
};

export type FilterSectionProps = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  open: boolean;
  handleSearch: () => void;
};

const LOCATIONS: LocationType[] = ['Collegetown', 'North', 'West', 'Downtown'];

export const PriceInputBox: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
}> = ({ label, value, placeholder, onChange }) => {
  const { priceInputContainer, minMaxLabel, priceTextFieldBox, pricePlaceholder } = useStyles();
  const displayValue = value === '' ? '' : '$' + value;
  return (
    <div className={priceInputContainer}>
      <Typography className={minMaxLabel}>{label}</Typography>
      <TextField
        value={displayValue}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, '');
          if (raw.length > 5) return;
          onChange(raw);
        }}
        size="small"
        variant="outlined"
        className={priceTextFieldBox}
        placeholder={placeholder}
        inputProps={{
          className: pricePlaceholder,
          style: { color: value === '' ? 'black' : undefined },
        }}
      />
    </div>
  );
};

/**
 * FilterSection - A component that renders a collapsible filter panel for property search refinement.
 *
 * @remarks
 * This component provides filtering options for locations, price ranges, and number of bedrooms/bathrooms.
 * The filter state is managed by the parent component and updates are propagated through the onChange callback.
 *
 * @param {FilterState} props.filters - The current state of all filters including locations, price range, and room counts
 * @param {(filters: FilterState) => void} props.onChange - Callback function that is called whenever any filter value changes
 * @param {boolean} props.open - Controls the visibility of the filter panel
 * @param {() => void} props.handleSearch - Callback function that is called to execute the search
 *
 * @returns {ReactElement} A collapsible panel containing filter controls
 */
const FilterSection: React.FC<FilterSectionProps> = ({ filters, onChange, open, handleSearch }) => {
  const {
    filterContainer,
    optionsContainer,
    footerContainer,
    locationSection,
    priceSection,
    bedsbathsSection,
    sectionTitle,
    numberControl,
    priceInputsContainerRow,
    divisionLine,
    locationChoices,
    filterText,
    checkBox,
    amenitiesRow,
    numberControlContainer,
    searchResultText,
    searchButton,
  } = useStyles();

  const handleLocationChange = (location: LocationType) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter((loc: LocationType) => loc !== location)
      : [...filters.locations, location];
    onChange({ ...filters, locations: newLocations });
  };

  const handleNumberChange = (field: 'bedrooms' | 'bathrooms', increment: boolean) => {
    const currentValue = filters[field];
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    onChange({ ...filters, [field]: newValue });
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div>
      {open && (
        <div className={filterContainer}>
          <div className={optionsContainer}>
            <div className={locationSection} style={{ width: '25%' }}>
              <Typography
                className={sectionTitle}
                style={{
                  marginLeft: '10px',
                }}
              >
                Location
              </Typography>
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
            </div>

            <span className={divisionLine} />

            <div className={priceSection} style={{ width: '25%' }}>
              <Typography className={sectionTitle}>Price</Typography>
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
            </div>

            <span className={divisionLine} />

            <div className={bedsbathsSection} style={{ width: '25%' }}>
              <Typography className={sectionTitle}>Beds & Baths</Typography>
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
            </div>
          </div>
          <div className={footerContainer}>
            <Typography className={searchResultText}>1,000+ results</Typography>
            <Typography className={searchButton} onClick={handleSearch}>
              Search
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;

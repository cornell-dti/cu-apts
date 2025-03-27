import React from 'react';
import {
  makeStyles,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  IconButton,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

const useStyles = makeStyles({
  container: {
    position: 'absolute',
    zIndex: 1,
    minWidth: '100%',
    backgroundColor: 'white',
    borderRadius: '10px',
    marginTop: '5px',
    display: 'flex',
    flexDirection: 'row',
    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
  },
  section: {
    marginBottom: '1rem',
    backgroundColor: 'white',
    padding: '1rem',
    minWidth: '210px',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: 'black',
  },
  numberControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'black',
  },
  priceInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'black',
  },
  filterText: {
    color: 'black',
  },
});

type LocationType = 'Collegetown' | 'North' | 'West' | 'Downtown';

export type FilterState = {
  locations: LocationType[];
  minPrice: string;
  maxPrice: string;
  bedrooms: number;
  bathrooms: number;
};

export type FilterSectionProps = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  open: boolean;
};

const LOCATIONS: LocationType[] = ['Collegetown', 'North', 'West', 'Downtown'];

/**
 * FilterSection - A component that renders a collapsible filter panel for property search refinement.
 *
 * @remarks
 * This component provides filtering options for locations, price ranges, and number of bedrooms/bathrooms.
 * The filter state is managed by the parent component and updates are propagated through the onChange callback.
 *
 * @param {FilterState} props.filters - The current state of all filters including locations, price range, and room counts
 * @param {function} props.onChange - Callback function that is called whenever any filter value changes
 * @param {boolean} props.open - Controls the visibility of the filter panel
 *
 * @return {ReactElement} - Returns a collapsible panel containing filter controls
 */

const FilterSection: React.FC<FilterSectionProps> = ({ filters, onChange, open }) => {
  const classes = useStyles();

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
    if (value === '' || /^\d+$/.test(value)) {
      onChange({ ...filters, [field]: value });
    }
  };

  return (
    <div>
      {open && (
        <div className={classes.container}>
          <div className={classes.section}>
            <Typography className={classes.sectionTitle}>Location</Typography>
            <Grid container direction="column">
              {LOCATIONS.map((location) => (
                <FormControlLabel
                  key={location}
                  control={
                    <Checkbox
                      checked={filters.locations.includes(location)}
                      onChange={() => handleLocationChange(location)}
                    />
                  }
                  label={location}
                  className={classes.filterText}
                />
              ))}
            </Grid>
          </div>

          <div className={classes.section}>
            <Typography className={classes.sectionTitle}>Price</Typography>
            <div className={classes.priceInputs}>
              <TextField
                placeholder="No Min"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                variant="outlined"
                size="small"
                type="text"
                inputProps={{
                  pattern: '\\d*',
                  className: classes.filterText,
                }}
              />
              <span className={classes.filterText}>-</span>
              <TextField
                placeholder="No Max"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                variant="outlined"
                size="small"
                type="text"
                inputProps={{
                  pattern: '\\d*',
                  className: classes.filterText,
                }}
              />
            </div>
          </div>

          <div className={classes.section}>
            <Typography className={classes.sectionTitle}>Beds & Baths</Typography>
            <div>
              <Typography className={classes.filterText}>Bedrooms</Typography>
              <div className={classes.numberControl}>
                <IconButton size="small" onClick={() => handleNumberChange('bedrooms', false)}>
                  <RemoveIcon />
                </IconButton>
                <Typography className={classes.filterText}>{filters.bedrooms}</Typography>
                <IconButton size="small" onClick={() => handleNumberChange('bedrooms', true)}>
                  <AddIcon />
                </IconButton>
              </div>
            </div>
            <div>
              <Typography className={classes.filterText}>Bathrooms</Typography>
              <div className={classes.numberControl}>
                <IconButton size="small" onClick={() => handleNumberChange('bathrooms', false)}>
                  <RemoveIcon />
                </IconButton>
                <Typography className={classes.filterText}>{filters.bathrooms}</Typography>
                <IconButton size="small" onClick={() => handleNumberChange('bathrooms', true)}>
                  <AddIcon />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;

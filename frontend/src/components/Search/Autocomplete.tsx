import React, { ReactElement, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CircularProgress,
  ClickAwayListener,
  Grid,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  Link,
  IconButton,
} from '@material-ui/core';
import { get } from '../../utils/call';
import { LandlordOrApartmentWithLabel } from '../../../../common/types/db-types';
import SearchIcon from '../../assets/search-icon.svg';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../colors';
import { useHistory } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import searchPropertyIcon from '../../assets/search-property.svg';
import searchLandlordIcon from '../../assets/search-landlord.svg';
import filterIcon from '../../assets/filter.svg';
import FilterSection, { FilterState } from './FilterSection';
import FilterDropDown from './FilterDropDown';

type Props = {
  drawerOpen: boolean;
};

const defaultFilters: FilterState = {
  locations: [],
  minPrice: '',
  maxPrice: '',
  bedrooms: 0,
  bathrooms: 0,
  initialSortBy: 'avgRating',
  initialSortLowToHigh: false,
};

/**
 * Autocomplete - A search component with filtering capabilities for properties and landlords.
 *
 * @remarks
 * This component provides a search bar with autocomplete functionality, displaying matching properties
 * and landlords as users type. It includes advanced filtering options and handles search result
 * navigation. The component adapts its appearance based on whether it's rendered on the home page
 * or search results page.
 *
 * @param {Props} props - Component properties
 * @param {boolean} props.drawerOpen - Controls whether the navigation drawer is open
 *
 * @returns {ReactElement} A search bar component with autocomplete and filtering capabilities
 */

const Autocomplete = ({ drawerOpen }: Props): ReactElement => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [openFilter, setOpenFilter] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isSearchResults = location.pathname.startsWith('/search');

  const useStyles = makeStyles((theme) => ({
    menuList: {
      position: 'absolute',
      backgroundColor: colors.white,
      maxHeight: 200,
      overflow: 'auto',
      boxShadow: '0px 4px 8px -1px rgba(0, 0, 0, 0.25)',
      borderRadius: '8px',
      padding: 0,
      boxSizing: 'border-box',
      border: '2px solid white',
    },
    menuItem: {
      borderBottom: '1px solid #E5E5E5',
      height: '53px',
    },
    searchBarRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    text: {
      backgroundColor: colors.white,
      fontSize: '18px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '28px',
      boxShadow: isHome ? '0px 0px 4px 2px rgba(0, 0, 0, 0.05)' : 'none',
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: isHome ? '#F9F9F9' : '#E8E8E8',
          borderWidth: '1px',
        },
        '&:hover fieldset': {
          borderColor: '#E5E5E5',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#E5E5E5',
          borderWidth: '1px',
        },
      },
    },
    subText: {
      color: colors.gray2,
      fontSize: '12px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    buildingText: {
      fontSize: '16px',
      color: colors.black,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    homeSearchIcon: {
      paddingRight: '10px',
    },
    searchIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      height: '50%',
      width: 'auto',
    },
    iconContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    iconBackground: {
      width: '34px',
      height: '34px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#F9F9F9',
        scale: '1.02',
      },
    },
    searchMenuLabelIcon: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    },
    field: {
      borderRadius: openFilter ? '10px 10px 0px 0px' : '10px',
      height: isMobile ? '35px' : isHome ? '68px' : '44px',
      padding: isHome ? '24px' : '8px 24px',
    },
    filterRow: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: '18px',
    },
  }));
  const {
    searchBarRow,
    iconBackground,
    text,
    iconContainer,
    searchMenuLabelIcon,
    field,
    menuList,
    menuItem,
    subText,
    buildingText,
    filterRow,
  } = useStyles();
  const inputRef = useRef<HTMLDivElement>(document.createElement('div'));
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [width, setWidth] = useState(inputRef.current?.offsetWidth);
  const [focus, setFocus] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [options, setOptions] = useState<LandlordOrApartmentWithLabel[]>([]);
  const [selected, setSelected] = useState<LandlordOrApartmentWithLabel | null>(null);
  const history = useHistory();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleListKeyDown(event: React.KeyboardEvent) {
    event.preventDefault();
    if (event.key === 'Tab') {
      setOpenMenu(false);
    }
  }

  function checkIfSearchable() {
    const { initialSortBy, initialSortLowToHigh, ...otherFilters } = filters;
    return (
      query.trim() !== '' ||
      Object.values(otherFilters).some((val) =>
        Array.isArray(val) ? val.length > 0 : val !== '' && val !== 0
      )
    );
  }

  function textFieldHandleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      setFocus(true);
    } else if (event.key === 'Enter' && checkIfSearchable()) {
      setFocus(true);
      console.log('Current filter state:', filters);
      const filterParams = encodeURIComponent(JSON.stringify(filters));
      console.log('Encoded filter params:', filterParams);
      history.push(`/search?q=${query}&filters=${filterParams}`);
      setQuery('');
      setOpenMenu(false);
    }
  }

  const handleSearchIconClick = () => {
    if (checkIfSearchable()) {
      console.log('Current filter state:', filters);
      const filterParams = encodeURIComponent(JSON.stringify(filters));
      console.log('Encoded filter params:', filterParams);
      history.push(`/search?q=${query}&filters=${filterParams}`);
      setQuery('');
    }
  };

  const handleToggleFilter = () => {
    setOpenFilter(!openFilter);
    setOpenMenu(false);
  };

  const handleClickAway = () => {
    setOpenMenu(false);
    setOpenFilter(false);
  };

  const handleOnChange = (query: string) => {
    setQuery(query);
    setSelected(null);
    setOpenFilter(false);
    if (query !== '') {
      setLoading(true);
    } else {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  /**
   * Menu - Renders a dropdown menu displaying search results for properties and landlords.
   *
   * @remarks
   * The menu displays search results in a scrollable list, with each result showing an icon,
   * name, and address. Results are clickable and link to their respective detail pages.
   * The menu closes when clicking away or selecting an item.
   *
   * @returns {ReactElement} A dropdown menu component containing search results
   */
  const Menu = () => {
    return (
      <div>
        <ClickAwayListener
          onClickAway={() => {
            setOpenMenu(false);
          }}
        >
          <div>
            {openMenu ? (
              <MenuList
                style={{ width: `${inputRef.current?.offsetWidth}px`, zIndex: 1 }}
                className={menuList}
                autoFocusItem={focus}
                onKeyDown={handleListKeyDown}
              >
                {options.length === 0 ? (
                  <MenuItem disabled>No search results.</MenuItem>
                ) : (
                  options.map(({ id, name, address, label }, index) => {
                    return (
                      <Link
                        key={index}
                        {...{
                          to: `/${label.toLowerCase()}/${id}`,
                          style: { textDecoration: 'none' },
                          component: RouterLink,
                        }}
                      >
                        <MenuItem
                          button={true}
                          key={index}
                          onClick={() => setOpenMenu(false)}
                          className={menuItem}
                          style={index === options.length - 1 ? { borderBottom: 'none' } : {}}
                        >
                          <Grid container spacing={2} alignItems="center">
                            <Grid item className={searchMenuLabelIcon}>
                              <img
                                src={label === 'LANDLORD' ? searchLandlordIcon : searchPropertyIcon}
                                alt="search icon"
                              />
                            </Grid>
                            <Grid item xs style={{ minWidth: 0 }}>
                              <Typography className={buildingText}>{name}</Typography>
                              <Typography className={subText}>
                                {address !== name && address}
                              </Typography>
                              <Typography className={subText}>
                                {label === 'LANDLORD' && 'Landlord'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </MenuItem>
                      </Link>
                    );
                  })
                )}
              </MenuList>
            ) : null}
          </div>
        </ClickAwayListener>
      </div>
    );
  };
  useEffect(() => {
    if (query === '') {
      setOpenMenu(false);
    } else if (selected === null) {
      setOpenMenu(true);
    } else {
      setOpenMenu(false);
    }
  }, [query, selected]);

  useEffect(() => {
    const handleResize = () => {
      setWidth(inputRef.current?.offsetWidth);
    };
    // the width is initially 0 because the inputRef is initialized as an empty div
    // need to call handleResize when the inputRef is set to the TextField
    handleResize();
    // need to call handleResize for any subsequent changes in width
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [inputRef, width]);

  useEffect(() => {
    if (loading && query.trim() !== '') {
      get<LandlordOrApartmentWithLabel[]>(`/api/search?q=${query}`, {
        callback: (data) => {
          setOptions(data);
          setLoading(false);
        },
      });
    }
  }, [loading, query]);

  let placeholderText = 'Search by address or with filters';

  /**
   * @returns The the InputProps for the search bar depending on user's location.
   * If: home and NavBar drawer is closed –> returns search bar style without red input adornment on right.
   * If: home/NavBar drawer is open –> returns search bar style with red input adornment on right.
   */
  const getInputProps = () => {
    if (isHome && !drawerOpen) {
      return {
        style: { fontSize: isMobile ? 16 : 20 },
        endAdornment: (
          <div className={iconContainer}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFilter();
              }}
              className={iconBackground}
              disableRipple
            >
              <img src={filterIcon} alt={'filter-icon'} style={{ width: '32px', height: '32px' }} />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleSearchIconClick();
              }}
              className={iconBackground}
              disableRipple
            >
              <img src={SearchIcon} alt="search icon" style={{ width: '34px', height: '34px' }} />
            </IconButton>
            {/* {loading ? <CircularProgress color="inherit" size={20} /> : null} */}
          </div>
        ),
        startAdornment: <></>,
        className: field,
      };
    } else {
      return {
        endAdornment: (
          <React.Fragment>
            {loading ? <CircularProgress color="inherit" size={20} /> : null}
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleSearchIconClick();
              }}
              className={iconBackground}
              disableRipple
            >
              <img src={SearchIcon} alt="search icon" style={{ width: '26px', height: '26px' }} />
            </IconButton>
          </React.Fragment>
        ),
        className: field,
      };
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <ClickAwayListener onClickAway={handleClickAway}>
        <div>
          <div className={searchBarRow}>
            <TextField
              fullWidth
              ref={inputRef}
              value={query}
              placeholder={placeholderText}
              className={text}
              variant="outlined"
              style={{
                borderRadius: openFilter ? '10px 10px 0px 0px' : '10px',
                width: isSearchResults ? '58%' : !isMobile ? '100%' : '98%',
              }}
              onKeyDown={textFieldHandleListKeyDown}
              onChange={(event) => {
                const value = event.target.value;
                if (value !== '' || value !== null) {
                  handleOnChange(value);
                }
              }}
              InputProps={getInputProps()}
            />
            {isSearchResults && (
              <div className={filterRow}>
                <FilterDropDown
                  label={'Location'}
                  isMobile={false}
                  filters={filters}
                  onChange={handleFilterChange}
                  onApply={handleSearchIconClick}
                />
                <FilterDropDown
                  label={'Price'}
                  isMobile={false}
                  filters={filters}
                  onChange={handleFilterChange}
                  onApply={handleSearchIconClick}
                />
                <FilterDropDown
                  label={'Beds & Baths'}
                  isMobile={false}
                  filters={filters}
                  onChange={handleFilterChange}
                  onApply={handleSearchIconClick}
                />
              </div>
            )}
          </div>
          <Menu />
          <FilterSection
            filters={filters}
            onChange={handleFilterChange}
            open={openFilter}
            handleSearch={handleSearchIconClick}
          />
        </div>
      </ClickAwayListener>
    </div>
  );
};

export default Autocomplete;

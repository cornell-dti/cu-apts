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
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../colors';
import { useHistory } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import searchPropertyIcon from '../../assets/search-property.svg';
import searchLandlordIcon from '../../assets/search-landlord.svg';
import filterIcon from '../../assets/filter.svg';
import FilterSection, { FilterState } from './FilterSection';

type Props = {
  drawerOpen: boolean;
};

const defaultFilters: FilterState = {
  locations: [],
  minPrice: '',
  maxPrice: '',
  bedrooms: 0,
  bathrooms: 0,
};

const Autocomplete = ({ drawerOpen }: Props): ReactElement => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
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
      justifyContent: 'center',
    },
    text: {
      backgroundColor: colors.white,
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
      height: '62%',
      width: '62%',
    },
    searchIconBackground: {
      backgroundColor: colors.red1,
      width: '50px',
      height: isMobile ? '35px' : '45px',
      position: 'absolute',
      right: '0',
      borderRadius: '0px 10px 10px 0px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
    },
    filterIconBackground: {
      backgroundColor: colors.white,
      width: '40px',
      height: isMobile ? '35px' : '40px',
      position: 'absolute',
      right: '55px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
    },
    searchLabelIcon: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    },
    field: {
      borderRadius: '10px',
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          border: `1px solid ${colors.red1}`,
          borderRadius: '10px',
        },
      },
      height: isMobile ? '35px' : '45px',
    },
  }));
  const {
    searchBarRow,
    filterIconBackground,
    text,
    searchIcon,
    homeSearchIcon,
    searchIconBackground,
    searchLabelIcon,
    field,
    menuList,
    menuItem,
    subText,
    buildingText,
  } = useStyles();
  const inputRef = useRef<HTMLDivElement>(document.createElement('div'));
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [width, setWidth] = useState(inputRef.current?.offsetWidth);
  const [focus, setFocus] = useState(false);
  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
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
      setOpen(false);
    }
  }

  function textFieldHandleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      setFocus(true);
    } else if (event.key === 'Enter') {
      setFocus(true);
      console.log('Current filter state:', filters);
      const filterParams = encodeURIComponent(JSON.stringify(filters));
      console.log('Encoded filter params:', filterParams);
      history.push(`/search?q=${query}&filters=${filterParams}`);
      setQuery('');
      setOpen(false);
    }
  }

  const handleSearchIconClick = () => {
    console.log('Current filter state:', filters);
    const filterParams = encodeURIComponent(JSON.stringify(filters));
    console.log('Encoded filter params:', filterParams);
    history.push(`/search?q=${query}&filters=${filterParams}`);
    setQuery('');
  };

  const handleToggleFilter = () => {
    setOpenFilter(!openFilter);
    setOpen(false);
  };

  const handleOnChange = (query: string) => {
    setQuery(query);
    setSelected(null);
    if (query !== '') {
      setLoading(true);
    } else {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const Menu = () => {
    return (
      <div>
        <ClickAwayListener
          onClickAway={() => {
            setOpen(false);
            setOpenFilter(false);
          }}
        >
          <div>
            {open ? (
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
                          onClick={() => setOpen(false)}
                          className={menuItem}
                          style={index === options.length - 1 ? { borderBottom: 'none' } : {}}
                        >
                          <Grid container spacing={2} alignItems="center">
                            <Grid item className={searchLabelIcon}>
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
      setOpen(false);
    } else if (selected === null) {
      setOpen(true);
    } else {
      setOpen(false);
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

  const location = useLocation();
  let placeholderText =
    location.pathname === '/' && !drawerOpen
      ? 'Search by any location e.g. "301 College Ave"'
      : 'Search';

  /**
   * @returns The the InputProps for the search bar depending on user's location.
   * If: home and NavBar drawer is closed –> returns search bar style without red input adornment on right.
   * If: home/NavBar drawer is open –> returns search bar style with red input adornment on right.
   */
  const getInputProps = () => {
    if (location.pathname === '/' && !drawerOpen) {
      return {
        style: { fontSize: isMobile ? 16 : 20 },
        endAdornment: <>{loading ? <CircularProgress color="inherit" size={20} /> : null}</>,
        startAdornment: (
          <SearchIcon
            style={{ fontSize: isMobile ? 17 : 22, marginLeft: isMobile ? -3 : 0 }}
            className={homeSearchIcon}
          />
        ),
        className: field,
      };
    } else {
      return {
        style: {
          height: isMobile ? '35px' : '45px',
        },
        endAdornment: (
          <React.Fragment>
            {loading ? <CircularProgress color="inherit" size={20} /> : null}
            <div className={searchIconBackground} onClick={handleSearchIconClick}>
              <SearchIcon className={searchIcon} />
            </div>
          </React.Fragment>
        ),
        className: field,
      };
    }
  };

  return (
    <div style={{ position: 'relative', width: drawerOpen ? '100%' : '65%' }}>
      <div className={searchBarRow}>
        <TextField
          fullWidth
          ref={inputRef}
          value={query}
          placeholder={placeholderText}
          className={text}
          variant="outlined"
          style={{
            borderRadius: '10px',
            width: !isMobile ? '100%' : '98%',
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
        <IconButton onClick={handleToggleFilter} className={filterIconBackground} disableRipple>
          <img src={filterIcon} alt={'filter-icon'} style={{ width: '21.4px', height: '21.4px' }} />
        </IconButton>
      </div>
      <Menu />
      <FilterSection filters={filters} onChange={handleFilterChange} open={openFilter} />
    </div>
  );
};

export default Autocomplete;

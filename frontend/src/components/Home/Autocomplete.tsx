import React, { ReactElement, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Chip,
  CircularProgress,
  ClickAwayListener,
  Grid,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  Link,
} from '@material-ui/core';
import { get } from '../../utils/call';
import { LandlordOrApartmentWithLabel } from '../../../../common/types/db-types';
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import { colors } from '../../colors';
import { useHistory } from 'react-router-dom';

type Props = {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Autocomplete = ({ drawerOpen, setDrawerOpen }: Props): ReactElement => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const useStyles = makeStyles((theme) => ({
    menuList: {
      position: 'absolute',
      backgroundColor: colors.white,
      maxHeight: 200,
      overflow: 'auto',
      boxShadow: '1px 8px rgba(49, 49, 49, 0.35)',
    },
    text: {
      backgroundColor: colors.white,
    },

    addressText: {
      color: colors.gray2,
    },
    buildingText: {
      color: colors.black,
    },
    homeSearchIcon: {
      paddingRight: '10px',
    },
    searchIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      // fontSize: isMobile ? 17 : 22
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
    },
    resultChip: { cursor: 'pointer' },
    field: {
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          border: `1px solid #c4c4c4`,
        },
      },
      height: isMobile ? '35px' : '45px',
    },
  }));
  const {
    menuList,
    text,
    searchIcon,
    homeSearchIcon,
    searchIconBackground,
    resultChip,
    field,
    addressText,
    buildingText,
  } = useStyles();
  const [focus, setFocus] = useState(false);
  const inputRef = useRef<HTMLDivElement>(document.createElement('div'));
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LandlordOrApartmentWithLabel[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<LandlordOrApartmentWithLabel | null>(null);
  const [width, setWidth] = useState(inputRef.current?.offsetWidth);

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
      history.push(`/search?q=${query}`);
      setOpen(false);
    }
  }

  const handleOnChange = (query: string) => {
    setQuery(query);
    setSelected(null);
    if (query !== '') {
      setLoading(true);
    } else {
      setLoading(false);
    }
  };

  const Menu = () => {
    return (
      <div>
        <ClickAwayListener
          onClickAway={() => {
            setOpen(false);
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
                        <MenuItem button={true} key={index} onClick={() => setOpen(false)}>
                          <Grid container justifyContent="space-between">
                            <Grid item xl={8}>
                              <Typography className={buildingText}>{name}</Typography>

                              <Typography className={addressText}>
                                {address !== name && address}
                              </Typography>
                            </Grid>
                            <Grid item xl={4}>
                              <Chip
                                color="primary"
                                label={label.toLowerCase()}
                                className={resultChip}
                              />
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
      ? 'Search by any location e.g. “301 College Ave”'
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
        style: { height: isMobile ? '35px' : '45px', borderRadius: '10px' },
        endAdornment: (
          <React.Fragment>
            {loading ? <CircularProgress color="inherit" size={20} /> : null}
            <div className={searchIconBackground}>
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
    </div>
  );
};

export default Autocomplete;

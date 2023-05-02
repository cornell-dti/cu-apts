import React, { useEffect, useState, useRef } from 'react';
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

export default function Autocomplete() {
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
    searchIcon: { paddingRight: '10px' },
    resultChip: { cursor: 'pointer' },
    field: {
      '&.Mui-focused': {
        border: '20px black ',
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
      },
      height: isMobile ? '35px' : '50px',
    },
  }));
  const { menuList, text, searchIcon, resultChip, field, addressText, buildingText } = useStyles();
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
      setQuery('');
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

  return (
    <div>
      <TextField
        fullWidth
        ref={inputRef}
        value={query}
        placeholder="Search by any location e.g. “301 College Ave”"
        className={text}
        variant="outlined"
        style={{
          borderRadius: '6px',
          width: !isMobile ? '70%' : '98%',
        }}
        onKeyDown={textFieldHandleListKeyDown}
        onChange={(event) => {
          const value = event.target.value;
          if (value !== '' || value !== null) {
            handleOnChange(value);
          }
        }}
        InputProps={{
          style: { fontSize: isMobile ? 16 : 20 },
          endAdornment: <>{loading ? <CircularProgress color="inherit" size={20} /> : null}</>,
          startAdornment: (
            <SearchIcon
              style={{ fontSize: isMobile ? 17 : 22, marginLeft: isMobile ? -3 : 0 }}
              className={searchIcon}
            />
          ),
          className: field,
        }}
      />

      <Menu />
    </div>
  );
}

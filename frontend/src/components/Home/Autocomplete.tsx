import React, { useEffect, useState, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Chip,
  CircularProgress,
  ClickAwayListener,
  Grid,
  IconButton,
  MenuItem,
  MenuList,
  TextField,
  Typography,
} from '@material-ui/core';
import get from '../../utils/get';
import { LandlordOrApartmentWithLabel } from '../../../../common/types/db-types';
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';
import { isMobile } from '../../utils/isMobile';

const useStyles = makeStyles({
  menuList: {
    position: 'absolute',
    backgroundColor: 'white',
    maxHeight: 200,
    overflow: 'auto',
  },
  text: { backgroundColor: 'white', borderRadius: '10px' },
  desktop: { width: '70%' },
});

export default function Autocomplete() {
  const { menuList, text, desktop } = useStyles();
  const [focus, setFocus] = useState(false);
  const inputRef = useRef<HTMLDivElement>(document.createElement('div'));
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LandlordOrApartmentWithLabel[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<LandlordOrApartmentWithLabel | null>(null);
  const [width, setWidth] = useState(inputRef.current.offsetWidth);
  const [selectedId, setSelectedId] = useState<string | null>('');

  function handleListKeyDown(event: React.KeyboardEvent) {
    event.preventDefault();
    if (event.key === 'Tab') {
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

  const handleSubmit = () => {
    // TODO: get id of item selected selected.id, if its a landlord redirect to landlords/id,
    // else get the landlordId of the apartment and redirect to that
    console.log('clicked');
  };

  const getLandlordId = (option: LandlordOrApartmentWithLabel) => {
    switch (option.label) {
      case 'LANDLORD':
        return option.id;
      case 'APARTMENT':
        return option.landlordId;
      default:
        return null;
    }
  };

  const handleClickMenu = (
    event: React.MouseEvent<EventTarget>,
    option: LandlordOrApartmentWithLabel
  ) => {
    setSelectedId(getLandlordId(option));
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
                style={{ width: `${width}px` }}
                className={menuList}
                autoFocusItem={focus}
                onKeyDown={handleListKeyDown}
              >
                {options.length === 0 ? (
                  <MenuItem disabled>No search results.</MenuItem>
                ) : (
                  options.map((option, index) => {
                    return (
                      <MenuItem
                        button={true}
                        key={index}
                        onClick={(event) => handleClickMenu(event, option)}
                      >
                        <Grid container justify="space-between">
                          <Grid item xl={8}>
                            <Typography>{option.name}</Typography>
                          </Grid>
                          <Grid item xl={4}>
                            <Chip color="primary" label={option.label.toLowerCase()} />
                          </Grid>
                        </Grid>
                      </MenuItem>
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
      setWidth(inputRef.current.offsetWidth);
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
      get<LandlordOrApartmentWithLabel[]>(`/search?q=${query}`, {
        callback: (data) => {
          setOptions(data);
          setLoading(false);
        },
      });
    }
  }, [loading, query]);

  return selectedId !== '' ? (
    <Redirect to={`/landlord/${selectedId}`} />
  ) : (
    <div>
      <TextField
        fullWidth
        ref={inputRef}
        value={query}
        placeholder="Search by landlord or building address"
        className={isMobile() ? text : `${text} ${desktop}`}
        variant="outlined"
        onKeyDown={(event) => (event.key === 'ArrowDown' ? setFocus(true) : setFocus(false))}
        onChange={(event) => {
          const value = event.target.value;
          if (value !== '' || value !== null) {
            handleOnChange(value);
          }
        }}
        InputProps={{
          endAdornment: (
            <>
              {loading ? <CircularProgress color="inherit" size={20} /> : null}
              <IconButton disabled={options.length === 0} onClick={handleSubmit}>
                <SearchIcon />
              </IconButton>
            </>
          ),
        }}
      />
      <Menu />
    </div>
  );
}

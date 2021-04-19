import React, { useEffect, useState, useRef } from 'react';
import {
  TextField,
  ClickAwayListener,
  MenuItem,
  MenuList,
  IconButton,
  CircularProgress,
} from '@material-ui/core';
import get from '../../utils/get';
import { Landlord, Apartment } from '../../../../common/types/db-types';
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  menuList: {
    position: 'absolute',
    backgroundColor: 'white',
    maxHeight: 200,
    overflow: 'auto',
  },
  text: { backgroundColor: 'white' },
});

export default function Autocomplete() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<(Landlord | Apartment)[]>([]);
  const [loading, setLoading] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Landlord | Apartment | null>(null);
  const [focus, setFocus] = useState(false);
  const { menuList, text } = useStyles();
  const inputRef = useRef<HTMLDivElement>(document.createElement('div'));
  const [width, setWidth] = useState(inputRef.current.offsetWidth);

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  const handleMenuClose = (event: React.MouseEvent<EventTarget>, option: Apartment | Landlord) => {
    var element = event.currentTarget as HTMLInputElement;
    setQuery(element.innerText);
    setSelected(option);
    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  const handleOnChange = async (query: string) => {
    setLoading(true);
    setQuery(query);
    setSelected(null);
    await get<Landlord | Apartment>(`/reviews?q=${query}`, setOptions);
    setLoading(false);
  };

  const handleSubmit = () => {
    // TODO: get id of item selected selected.id, if its a landlord redirect to landlords/id,
    // else get the landlordId of the apartment and redirect to that
    console.log('clicked');
  };

  const Menu = () => {
    return (
      <div>
        <ClickAwayListener onClickAway={handleClose}>
          <div>
            {open ? (
              <MenuList
                style={{ width: `${width}px` }}
                className={menuList}
                autoFocusItem={focus}
                onKeyDown={handleListKeyDown}
              >
                {options.length === 0 ? (
                  <MenuItem disabled>No landlords or apartments match this search</MenuItem>
                ) : (
                  options.map((option, index) => {
                    return (
                      <MenuItem key={index} onClick={(event) => handleMenuClose(event, option)}>
                        {option.name}
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
      console.log(width);
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

  return (
    <div>
      <TextField
        fullWidth
        ref={inputRef}
        value={query}
        placeholder="Search by renting company or building address"
        className={text}
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
            <React.Fragment>
              {loading ? <CircularProgress color="inherit" size={20} /> : null}
              <IconButton disabled={options === []} onClick={handleSubmit}>
                <SearchIcon />
              </IconButton>
            </React.Fragment>
          ),
        }}
      />
      <Menu />
    </div>
  );
}

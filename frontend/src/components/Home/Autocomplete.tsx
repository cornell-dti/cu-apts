import React, { useState, useRef } from 'react';
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
    width: '550px',
  },
  text: { backgroundColor: 'white' },
});

export default function Autocomplete() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<(Landlord | Apartment)[]>([]);
  const [loading, setLoading] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState('');
  // eslint-disable-next-line
  const [selected, setSelected] = useState<Landlord | Apartment | null>(null);
  const [focus, setFocus] = useState(false);
  const { menuList, text } = useStyles();

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
    console.log(option);
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
              <MenuList className={menuList} autoFocusItem={focus} onKeyDown={handleListKeyDown}>
                {options === null ? (
                  <MenuItem disabled>No Options</MenuItem>
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

  // useEffect(() => {
  //   if (query === '') {
  //     setOpen(false);
  //   } else {
  //     setOpen(true);
  //   }
  // }, [query]);

  return (
    <div>
      <TextField
        fullWidth
        value={query}
        placeholder="Search by renting company or building address"
        className={text}
        onClick={() => setOpen(true)}
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

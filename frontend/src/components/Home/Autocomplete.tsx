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
import get, { backendUrl } from '../../utils/get';
import { ApartmentWithId, LandlordOrApartmentWithLabel } from '../../../../common/types/db-types';
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';

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
  const { menuList, text } = useStyles();
  const [focus, setFocus] = useState(false);
  const inputRef = useRef<HTMLDivElement>(document.createElement('div'));
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LandlordOrApartmentWithLabel[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<LandlordOrApartmentWithLabel | null>(null);
  const [width, setWidth] = useState(inputRef.current.offsetWidth);
  const [selectedId, setSelectedId] = useState('');

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  const handleOnChange = (query: string) => {
    setLoading(true);
    setQuery(query);
    setSelected(null);
  };

  const handleSubmit = () => {
    // TODO: get id of item selected selected.id, if its a landlord redirect to landlords/id,
    // else get the landlordId of the apartment and redirect to that
    console.log('clicked');
  };

  const getLandlordIdFromAptId = (aptId: string) => {
    axios
      .get(`${backendUrl}/apts/${aptId}`)
      .then((response) => {
        const apt: ApartmentWithId = response.data;
        const landlordId = apt.landlordId;
        if (landlordId !== null) {
          setSelectedId(landlordId);
        }
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  const handleClickMenu = (
    event: React.MouseEvent<EventTarget>,
    option: LandlordOrApartmentWithLabel
  ) => {
    setSelected(option);
    if (option.label === 'LANDLORD') {
      setSelectedId(option.id);
    } else if (option.label === 'APARTMENT') {
      getLandlordIdFromAptId(option.id);
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
    if (loading) {
      get<LandlordOrApartmentWithLabel[]>(`/reviews?q=${query}`, setOptions, setLoading);
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
        label="Search by renting company or building address"
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

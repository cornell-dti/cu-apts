import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import get from '../../utils/get';
import { Landlord, Apartment } from '../../../../common/types/db-types';

export default function Asynchronous() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<(Landlord)[]>([]);
  const loading = open && options.length === 0;
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      if (active) {
        await get<Landlord>(`/reviews?q=${query}`, setOptions);
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, query]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={(option) => option.name}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search"
          placeholder="Search by renting company or building address"
          variant="outlined"
          onChange={(event) => {setQuery(event.target.value)}}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import get from '../../utils/get';
import { Landlord, Apartment } from '../../../../common/types/db-types';
// import SearchIcon from '@material-ui/icons/Search';

export default function Asynchronous() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<(Landlord | Apartment)[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOnChange = async (query:string) => {
    setLoading(true);
    await get<Landlord | Apartment>(`/reviews?q=${query}`, setOptions);
    setLoading(false);
    console.log(options);
    if (options.length !== 0) {
    console.log(options[0].name)}
    
  }

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      style={{backgroundColor: "white"}}
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
          placeholder="Search by renting company or building address"
          variant="outlined"
          onChange={event => { 
            const value = event.target.value;
            if (value !== "" || value !== null) {
              handleOnChange(value);
            }
          }}
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
import React, { ReactElement } from 'react';
import { ReactComponent as SearchIcon } from '../../assets/search.svg';

const SearchBar = (): ReactElement => {
  return (
    <div className="search input-group mb-3">
      <input
        type="text"
        className="form-control"
        placeholder="Search by any location..."
        aria-label="Search locations"
        aria-describedby="basic-addon2"
      />
      <div className="input-group-append">
        <button className="btn btn-light" type="button">
          <SearchIcon />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;

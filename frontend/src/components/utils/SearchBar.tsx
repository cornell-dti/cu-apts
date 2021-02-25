import React, { ReactElement } from 'react';
import { ReactComponent as SearchIcon } from '../../assets/search.svg';
import styles from './SearchBar.module.scss';

type Props = {
  readonly placeholder: string;
  readonly ariaLabel: string;
};

const SearchBar = ({ placeholder, ariaLabel }: Props): ReactElement => {
  return (
    <div className={`${styles.search} input-group mb-3`}>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        aria-label={ariaLabel}
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
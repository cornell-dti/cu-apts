import { RadioButtonUncheckedSharp } from '@material-ui/icons';
import React, {ReactElement} from 'react';

  const SearchBar=(): ReactElement => {
    return <div className="search input-group mb-3 mt-4 pt-1">
      <div className="input-group-prepend">
        <button className="form-control border-right-0 rounded-left" type="button" style={{borderRadius:0}}>
          <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-search" fill="grey" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/>
            <path fillRule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
          </svg>
        </button>
    </div>
    <input type="text" className="form-control border-left-0" placeholder="Search by any location e.g. &quot;301 College Ave&quot;" aria-label="Search locations" aria-describedby="basic-addon2"/>

  </div>
    }

export default SearchBar;
import { RadioButtonUncheckedSharp } from '@material-ui/icons';
import React, {ReactElement} from 'react';
import { ReactComponent as SearchBarStyle } from './homesearchbar.svg';

  const SearchBar=(): ReactElement => {
    return <div className="search input-group mb-3 mt-4 pt-1">
      <div className="input-group-prepend">
        <button className="form-control border-right-0 rounded-left" type="button" style={{borderRadius:0}}>
            <SearchBarStyle />
        </button>
    </div>
    <input type="text" className="form-control border-left-0" placeholder="Search by any location e.g. &quot;301 College Ave&quot;" aria-label="Search locations" aria-describedby="basic-addon2"/>

  </div>
    }

export default SearchBar;

import React, { ReactElement } from 'react';
import SearchBar from '../components/Home/SearchBar';
import NavBar from '../components/Home/NavBar';

const HomePage = (): ReactElement => {
  return (
    <div className="Home">
      <NavBar />
      <SearchBar />
    </div>
  );
};

export default HomePage;

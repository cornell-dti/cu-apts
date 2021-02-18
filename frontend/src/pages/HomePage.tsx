import React, { ReactElement } from 'react';
import SearchBar from '../components/Home/SearchBar';
import NavBar from '../components/Home/NavBar';
import styles from './HomePage.module.scss';

const HomePage = (): ReactElement => {
  return (
    <div className={styles.Home}>
      <NavBar />
      <SearchBar />
    </div>
  );
};

export default HomePage;

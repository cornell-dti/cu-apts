import React, { ReactElement } from 'react';
import SearchBar from '../components/utils/SearchBar';
import NavBar from '../components/Home/NavBar';
import styles from './HomePage.module.scss';

const HomePage = (): ReactElement => {
  return (
    <div className={styles.Home}>
      <NavBar />
      <div className={styles.search}>
        <SearchBar placeholder="Search by any location..." ariaLabel="Search locations" />
      </div>
    </div>
  );
};

export default HomePage;

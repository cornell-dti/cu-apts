import React, { ReactElement } from 'react';
import SearchBar from '../utils/SearchBar';
import styles from './FAQHelp.module.scss';

const FAQHelp = (): ReactElement => {
  return (
    <div className={styles.helpComponent}>
      <h2 className={styles.helpTitle}>Need Help?</h2>
      <SearchBar placeholder="Search for any question..." ariaLabel="Search questions" />
    </div>
  );
};

export default FAQHelp;

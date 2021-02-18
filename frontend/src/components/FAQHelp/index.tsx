import React, { ReactElement } from 'react';
import HelpSearchBar from './HelpSearchBar';
import styles from './FAQHelp.module.scss';

const FAQHelp = (): ReactElement => {
  return (
    <div className={styles.helpComponent}>
      <h2 className={styles.helpTitle}>Need Help?</h2>
      <HelpSearchBar />
    </div>
  );
};

export default FAQHelp;

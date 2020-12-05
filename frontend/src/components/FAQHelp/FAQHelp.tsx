import React, { ReactElement } from 'react'
import HelpSearchBar from './HelpSearchBar'
import styles from './FAQHelp.module.scss';

const FAQHelp = (): ReactElement => {
  return (

    <div className={styles.helpComponent}>
      <p className={styles.helpTitle}>
        Need Help?
      </p>
      <HelpSearchBar />
    </div>
  )
}

export default FAQHelp;
import React, { ReactElement, useState } from 'react';
import SearchBar from '../components/utils/SearchBar';
import NavBar from '../components/Home/NavBar';
import styles from './HomePage.module.scss';
import { Button } from '@material-ui/core';
import ReviewModal from '../components/LeaveReview/ReviewModal';

const HomePage = (): ReactElement => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  return (
    <div className={styles.Home}>
      <NavBar />
      <div className={styles.search}>
        <SearchBar placeholder="Search by any location..." ariaLabel="Search locations" />
        <Button onClick={() => setShowReviewModal(true)}>Leave a Review</Button>
      </div>
      <ReviewModal open={showReviewModal} onClose={() => setShowReviewModal(false)} />
    </div>
  );
};

export default HomePage;

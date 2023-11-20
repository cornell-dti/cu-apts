import React, { ReactElement, useEffect, useState } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { colors } from '../colors';
import { useTitle } from '../utils';
import axios from 'axios';
import { createAuthHeaders } from '../utils/firebase';
import { ReviewWithId } from '../../../common/types/db-types';

type Props = {
  user: firebase.User | null;
};

const useStyles = makeStyles((theme) => ({
  background: {
    backgroundColor: colors.gray3,
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: '10px',
  },
  root: {
    minHeight: '80vh',
    width: '75%',
  },
  gridContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: '10px',
  },
  headerStyle: {
    fontFamily: 'Work Sans',
  },
}));

/**
 * Saved Apartments Page
 * This component represents the Bookmarks page. It displays the user's saved properties and landlords, and their reviews marked helpful.
 * @component
 * @param user props.user - The current user, null if not logged in.
 * @returns BookmarksPage The BookmarksPage component.
 */

const BookmarksPage = ({ user }: Props): ReactElement => {
  const { background, root, gridContainer, headerStyle } = useStyles();
  const [likedReviews, setLikedReviews] = useState<ReviewWithId[]>([]);

  useTitle('Bookmarks');

  useEffect(() => {
    const fetchLikedReviews = async () => {
      if (user) {
        const token = await user.getIdToken(true);
        const response = await axios.get(`/api/review/like/${user.uid}`, createAuthHeaders(token));
        setLikedReviews(response.data);
      }
    };
    fetchLikedReviews();
  }, [user]);

  console.log(likedReviews);

  return (
    <div className={background}>
      <div className={root}>
        <h2 className={headerStyle}>Saved Properties and Landlords</h2>
        <Grid container spacing={2} className={gridContainer}></Grid>

        <h2 className={headerStyle}>Reviews Marked Helpful</h2>
        <Grid container spacing={2} className={gridContainer}></Grid>
      </div>
    </div>
  );
};

export default BookmarksPage;

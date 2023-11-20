import React, { ReactElement } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { colors } from '../colors';
import { useTitle } from '../utils';

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

  useTitle('Bookmarks');

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

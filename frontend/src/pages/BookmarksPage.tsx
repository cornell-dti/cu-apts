import React, { ReactElement, useEffect, useState } from 'react';
import { Button, Grid, Link, makeStyles, Typography } from '@material-ui/core';
import { colors } from '../colors';
import { useTitle } from '../utils';
import { CardData } from '../App';
import { get } from '../utils/call';
import BookmarkAptCard from '../components/Bookmarks/BookmarkAptCard';
import { Link as RouterLink } from 'react-router-dom';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { loadingLength } from '../constants/HomeConsts';

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
    marginTop: '10px',
  },
  headerStyle: {
    fontFamily: 'Work Sans',
    fontWeight: 800,
    marginTop: '1.6em',
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
  const defaultShow = 6;

  const [toShow, setToShow] = useState<number>(defaultShow);

  const handleViewAll = () => {
    setToShow(toShow + (data.length - defaultShow));
  };

  const handleCollapse = () => {
    setToShow(defaultShow);
  };

  useTitle('Bookmarks');

  const [data, setData] = useState<CardData[]>([]);
  const savedAPI = '/api/location/West/';

  useEffect(() => {
    get<CardData[]>(savedAPI, {
      callback: setData,
    });
  }, [savedAPI]);

  return (
    <div className={background}>
      <div className={root}>
        <Typography variant="h3" className={headerStyle}>
          Saved Properties and Landlords ({data.length})
        </Typography>
        <Grid container spacing={4} className={gridContainer}>
          {data &&
            data.slice(0, toShow).map(({ buildingData, numReviews, company }, index) => {
              const { id } = buildingData;
              return (
                <Grid item xs={12} md={4} key={index}>
                  <Link
                    {...{
                      to: `/apartment/${id}`,
                      style: { textDecoration: 'none' },
                      component: RouterLink,
                    }}
                  >
                    <BookmarkAptCard
                      key={index}
                      numReviews={numReviews}
                      buildingData={buildingData}
                      company={company}
                    />
                  </Link>
                </Grid>
              );
            })}
          <Grid item xs={12} container justifyContent="center">
            {data.length > 0 &&
              (data.length > toShow ? (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleViewAll}
                  endIcon={<KeyboardArrowDownIcon />}
                >
                  View All
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCollapse}
                  endIcon={<KeyboardArrowUpIcon />}
                >
                  Collapse
                </Button>
              ))}
          </Grid>
        </Grid>

        <Typography variant="h3" className={headerStyle}>
          Reviews Marked Helpful
        </Typography>
        <Grid container spacing={2} className={gridContainer}></Grid>
      </div>
    </div>
  );
};

export default BookmarksPage;

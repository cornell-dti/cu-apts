import React, { ReactElement, useEffect, useState } from 'react';
import { Button, Grid, Link, makeStyles, Typography, Box } from '@material-ui/core';
import { colors } from '../colors';
import { useTitle } from '../utils';
import { CardData } from '../App';
import { get } from '../utils/call';
import BookmarkAptCard from '../components/Bookmarks/BookmarkAptCard';
import { Link as RouterLink } from 'react-router-dom';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { Likes, ReviewWithId } from '../../../common/types/db-types';
import axios from 'axios';
import { createAuthHeaders, getUser } from '../utils/firebase';
import ReviewComponent from '../components/Review/Review';
import DropDown from '../components/utils/DropDown';
import { sortReviews } from '../utils/sortReviews';

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
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
    marginBottom: '3em',
  },
  headerStyle: {
    fontFamily: 'Work Sans',
    fontWeight: 800,
  },
  sortByButton: {
    background: '#E8E8E8',
    border: 'none',
    borderRadius: '10px',
    paddingRight: '5px',
    paddingLeft: '5px',
  },
  headerContainer: {
    marginTop: '2em',
    marginBottom: '2em',
  },
}));

/**
 * Bookmarks Page
 * This component represents the Bookmarks page. It displays the user's saved properties and landlords, and their reviews marked helpful.
 * @component
 * @param user props.user - The current user, null if not logged in.
 * @returns BookmarksPage The BookmarksPage component.
 */
const BookmarksPage = ({ user, setUser }: Props): ReactElement => {
  const { background, root, headerStyle, sortByButton, headerContainer, gridContainer } =
    useStyles();
  const defaultShow = 6;

  const [toShow, setToShow] = useState<number>(defaultShow);

  const handleViewAll = () => {
    setToShow(toShow + (data.length - defaultShow));
  };

  const handleCollapse = () => {
    setToShow(defaultShow);
  };

  const [helpfulReviewsData, setHelpfulReviewsData] = useState<ReviewWithId[]>([]);
  const [sortBy, setSortBy] = useState<Fields>('date');
  const [resultsToShow, setResultsToShow] = useState<number>(2);
  const [likeStatuses, setLikeStatuses] = useState<Likes>({});
  const [toggle, setToggle] = useState(false);
  const [showMoreLessState, setShowMoreLessState] = useState<String>('Show More');

  useTitle('Bookmarks');

  const [data, setData] = useState<CardData[]>([]);
  const savedAPI = '/api/location/West/';

  useEffect(() => {
    get<CardData[]>(savedAPI, {
      callback: setData,
    });
  }, [savedAPI]);

  // Fetch helpful reviews data when the component mounts or when user changes or when toggle changes
  useEffect(() => {
    const fetchLikedReviews = async () => {
      if (user) {
        const token = await user.getIdToken(true);
        const response = await axios.get(`/api/review/like/${user.uid}`, createAuthHeaders(token));
        setHelpfulReviewsData(response.data);
      }
    };
    fetchLikedReviews();
  }, [user, toggle]);

  // Define the type of the properties used for sorting reviews
  type Fields = keyof typeof helpfulReviewsData[0];

  // Function to handle "Show More" button click
  const handleShowMoreLess = () => {
    if (showMoreLessState === 'Show More') {
      setResultsToShow(helpfulReviewsData.length);
      setShowMoreLessState('Show Less');
    } else if (showMoreLessState === 'Show Less') {
      setResultsToShow(2);
      setShowMoreLessState('Show More');
    }
  };

  // Function to handle liking or disliking a review
  const likeHelper = (dislike = false) => {
    return async (reviewId: string) => {
      setLikeStatuses((reviews) => ({ ...reviews, [reviewId]: true }));
      try {
        const user = await getUser(true);
        if (!user) {
          throw new Error('Failed to login');
        }
        const defaultLikes = dislike ? 1 : 0;
        const offsetLikes = dislike ? -1 : 1;
        const token = await user.getIdToken(true);
        const endpoint = dislike ? '/api/remove-like' : '/api/add-like';
        await axios.post(endpoint, { reviewId }, createAuthHeaders(token));
        setHelpfulReviewsData((reviews) =>
          reviews.map((review) =>
            review.id === reviewId
              ? { ...review, likes: (review.likes || defaultLikes) + offsetLikes }
              : review
          )
        );
      } catch (err) {
        throw new Error('Error with liking review');
      }
      setLikeStatuses((reviews) => ({ ...reviews, [reviewId]: false }));
      setToggle(!toggle);
    };
  };

  // Define two functions for handling likes and dislikes
  const addLike = likeHelper(false);
  const removeLike = likeHelper(true);

  return (
    <div className={background}>
      <div className={root}>
        <Box className={headerContainer}>
          <Typography variant="h3" className={headerStyle}>
            Saved Properties and Landlords ({data.length})
          </Typography>
        </Box>

        {data.length > 0 ? (
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
        ) : (
          <Typography paragraph>You have not saved any apartments.</Typography>
        )}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          className={headerContainer}
        >
          <Box>
            <Typography variant="h3" className={headerStyle}>
              Reviews Marked Helpful ({helpfulReviewsData.length})
            </Typography>
          </Box>

          <Box>
            <Grid container spacing={1} direction="row" alignItems="center">
              <Grid item>
                <Typography>Sort by:</Typography>
              </Grid>
              <Grid item className={sortByButton}>
                <DropDown
                  menuItems={[
                    {
                      item: 'Recent',
                      callback: () => {
                        setSortBy('date');
                      },
                    },
                    {
                      item: 'Helpful',
                      callback: () => {
                        setSortBy('likes');
                      },
                    },
                  ]}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>

        {helpfulReviewsData.length === 0 && (
          <Typography paragraph>You have not marked any reviews helpful.</Typography>
        )}

        {helpfulReviewsData.length > 0 && (
          <Grid container spacing={5} justifyContent="center" style={{ marginBottom: '20px' }}>
            <Grid container item spacing={3}>
              {sortReviews(helpfulReviewsData, sortBy)
                .slice(0, resultsToShow)
                .map((review, index) => (
                  <Grid item xs={12} key={index}>
                    <ReviewComponent
                      review={review}
                      liked={true}
                      likeLoading={likeStatuses[review.id]}
                      addLike={addLike}
                      removeLike={removeLike}
                      setToggle={setToggle}
                      user={user}
                      setUser={setUser}
                      showLabel={true}
                    />
                  </Grid>
                ))}
            </Grid>
            {helpfulReviewsData.length > 2 && (
              <Box textAlign="center">
                <Grid item style={{ padding: '30px' }}>
                  <Button
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #A3A3A3',
                      borderRadius: '9px',
                      width: '10em',
                      textTransform: 'initial',
                    }}
                    variant="contained"
                    disableElevation
                    onClick={handleShowMoreLess}
                  >
                    {showMoreLessState}
                  </Button>
                </Grid>
              </Box>
            )}
          </Grid>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;

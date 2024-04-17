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
import { sortReviews } from '../utils/sortReviews';
import DropDownWithLabel from '../components/utils/DropDownWithLabel';
import { AptSortField, sortApartments } from '../utils/sortApartments';

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
  gridContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '3em',
  },
  headerStyle: {
    fontFamily: 'Work Sans',
    fontWeight: 800,
  },
  headerContainer: {
    marginTop: '2em',
    marginBottom: '2em',
  },
}));

const ToggleButton = ({
  text,
  callback,
  icon,
}: {
  text: string;
  callback: () => void;
  icon: React.ReactElement;
}) => {
  return (
    <Button
      style={{
        backgroundColor: 'white',
        borderRadius: '9px',
        textTransform: 'initial',
      }}
      variant="outlined"
      color="secondary"
      onClick={callback}
      endIcon={icon}
    >
      {text}
    </Button>
  );
};

/**
 * Bookmarks Page
 * This component represents the Bookmarks page. It displays the user's saved properties and landlords, and their reviews marked helpful.
 * @component
 * @param user props.user - The current user, null if not logged in.
 * @returns BookmarksPage The BookmarksPage component.
 */
const BookmarksPage = ({ user, setUser }: Props): ReactElement => {
  const { background, headerStyle, headerContainer, gridContainer } = useStyles();
  const defaultShow = 6;
  const savedAPI = '/api/saved-apartments';

  const [aptsToShow, setAptsToShow] = useState<number>(defaultShow);
  const [savedAptsData, setSavedAptsData] = useState<CardData[]>([]);
  // handle sort (either number of reviews or average rate)
  const [sortAptsBy, setSortAptsBy] = useState<AptSortField>('numReviews');

  // handle toggle
  const handleViewAll = () => {
    setAptsToShow(aptsToShow + (savedAptsData.length - defaultShow));
  };
  const handleCollapse = () => {
    setAptsToShow(defaultShow);
  };

  /**** Helpful reviews ****/
  const [helpfulReviewsData, setHelpfulReviewsData] = useState<ReviewWithId[]>([]);
  const [sortBy, setSortBy] = useState<Fields>('date');
  const [resultsToShow, setResultsToShow] = useState<number>(2);
  const [likeStatuses, setLikeStatuses] = useState<Likes>({});
  const [toggle, setToggle] = useState(false);
  const [showMoreLessState, setShowMoreLessState] = useState<String>('Show More');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useTitle('Bookmarks');

  const [savedAptsData, setsavedAptsData] = useState<CardData[]>([]);
  const savedAPI = '/api/saved-apartments';

  // Fetch helpful reviews data when the component mounts or when user changes or when toggle changes
  useEffect(() => {
    const fetchLikedReviews = async () => {
      if (user) {
        const token = await user.getIdToken(true);
        get<ReviewWithId[]>(
          `/api/review/like/${user.uid}`,
          {
            callback: setHelpfulReviewsData,
          },
          createAuthHeaders(token)
        );

        // this is here so we can get the token when it's fetched and not cause an unauthorized error
        get<CardData[]>(
          savedAPI,
          {
            callback: (data) => {
              sortApartments(data, sortAptsBy).then((res) => {
                setSavedAptsData(res);
              });
            },
          },
          createAuthHeaders(token)
        );
      }
    };
    fetchLikedReviews();
  }, [user, toggle, savedAPI, sortAptsBy]);

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
      <Grid item xs={11} sm={11} md={9}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          className={headerContainer}
        >
          <Box>
            <Typography variant="h3" className={headerStyle}>
              Saved Properties and Landlords ({savedAptsData.length})
            </Typography>
          </Box>

          <Box>
            <DropDownWithLabel
              label="Sort by"
              menuItems={[
                {
                  item: 'Review Count',
                  callback: () => {
                    setSortAptsBy('numReviews');
                    sortApartments(savedAptsData, 'numReviews').then((res) => {
                      setSavedAptsData(res);
                    });
                  },
                },
                {
                  item: 'Rating',
                  callback: () => {
                    setSortAptsBy('overallRating');
                    sortApartments(savedAptsData, 'overallRating').then((res) => {
                      setSavedAptsData(res);
                    });
                  },
                },
              ]}
              isMobile={isMobile}
            />
          </Box>
        </Box>

        {savedAptsData.length > 0 ? (
          <Grid container spacing={4} className={gridContainer}>
            {savedAptsData &&
              savedAptsData
                .slice(0, aptsToShow)
                .map(({ buildingData, numReviews, company }, index) => {
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
            <Grid item xs={12} justifyContent="center">
              {savedAptsData.length > defaultShow &&
                (savedAptsData.length > aptsToShow ? (
                  <ToggleButton
                    text="View All"
                    callback={handleViewAll}
                    icon={<KeyboardArrowDownIcon />}
                  />
                ) : (
                  <ToggleButton
                    text="Collapse"
                    callback={handleCollapse}
                    icon={<KeyboardArrowUpIcon />}
                  />
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

          {!isMobile && (
            <Box>
              <DropDownWithLabel
                label="Sort by"
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
                isMobile={isMobile}
              />
            </Box>
          )}
        </Box>
        {isMobile && (
          <Box>
            <DropDownWithLabel
              label="Sort by"
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
              isMobile={isMobile}
            />
          </Box>
        )}

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
                  <ToggleButton
                    text={showMoreLessState}
                    callback={handleShowMoreLess}
                    icon={
                      showMoreLessState === 'Show More' ? (
                        <KeyboardArrowDownIcon />
                      ) : (
                        <KeyboardArrowUpIcon />
                      )
                    }
                  />
                </Grid>
              </Box>
            )}
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default BookmarksPage;

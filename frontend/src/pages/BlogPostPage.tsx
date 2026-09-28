import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  makeStyles,
  Typography,
  TextField,
  InputAdornment,
  Button,
  ButtonBase,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useTitle } from '../utils';

/**
 * BlogPost type
 *
 * Represents a single blog post as returned by the backend API and consumed
 * by the blog listing page. Includes metadata used for filtering, sorting,
 * and display in the card grid.
 */
type BlogPost = {
  readonly id: string;
  readonly content: string;
  readonly blurb: string;
  readonly date: Date | string;
  readonly likes?: number;
  readonly photos: string[];
  readonly tags: string[];
  readonly title: string;
  readonly userId?: string | null;
  readonly visibility: string;
  readonly saves: number;
};

// Styles for the BlogPostPage component
const useStyles = makeStyles(() => ({
  background: {
    backgroundColor: '#FFFFFF',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  pageContainer: {
    marginTop: '78px',
    width: '100%',
    maxWidth: '1313px',
  },
  header: {
    fontFamily: 'Work Sans',
    fontWeight: 600,
    fontSize: '48px',
    lineHeight: '50px',
  },
  searchWrap: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    boxShadow: '0px 8px 24px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  searchField: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'transparent',
      borderRadius: 10,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiOutlinedInput-input': {
      padding: '20px 24px',
      fontFamily: 'Work Sans',
      fontSize: 18,
    },
    '& .MuiOutlinedInput-input::placeholder': {
      color: '#9CA3AF',
      opacity: 1,
    },
  },
  tabsRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
    marginTop: '100px',
    flexWrap: 'wrap',
  },
  tabButton: {
    color: 'var(--color-neutral-gray-1, #5D5D5D)',
    fontWeight: 400,
    padding: '8px 24px',
    minWidth: 'auto',
    textTransform: 'none',
    fontFamily: 'Work Sans',
    fontSize: '22px',
    lineHeight: '32px',
    borderRadius: 0,
    borderBottom: '1.5px solid var(--color-neutral-gray-3, #E8E8E8)',
  },
  activeTab: {
    color: 'var(--Tokens-Content-color-content-primary-default, #1C1B1B)',
    fontWeight: 400,
    borderBottom: '1.5px solid #1C1B1B !important',
    borderRadius: 0,
  },
  cardsGrid: {
    marginTop: '64px',
    marginBottom: '40px',
  },
  cardButton: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    textAlign: 'left',
    backgroundColor: 'transparent',
    borderRadius: '12px',
    padding: '12px 12px 0px 12px',
    boxSizing: 'border-box',
    border: '1px solid transparent',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
    outline: 'none',
    '&:focus': { outline: 'none' },
    '&:focus-visible': { outline: 'none' },
    '& .MuiTouchRipple-root': { display: 'none' },
  },
  cardInteractive: {
    '&:hover': {
      borderColor: '#EB5757',
      boxShadow: '0px 12px 30px rgba(0,0,0,0.10)',
    },
    '&:focus-visible': {
      borderColor: '#EB5757',
      boxShadow: '0px 12px 30px rgba(0,0,0,0.10)',
    },
  },
  card: {
    width: '411px',
    height: '563px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '12px',
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
  },
  cardImage: {
    position: 'relative',
    width: '100%',
    height: '267px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #ECECEC',
    backgroundColor: '#F3F4F6',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    },
  },
  cardTitle: {
    fontFamily: 'Work Sans',
    fontWeight: 600,
    fontSize: '22px',
    lineHeight: '32px',
    color: '#000',
  },
  cardDescription: {
    fontFamily: 'Work Sans',
    fontSize: '18px',
    lineHeight: '28px',
    fontWeight: 400,
    color: '#5D5D5D',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 5,
  },
  cardFooter: {
    marginTop: 'auto',
    marginBottom: '28px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    color: '#000000',
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'Work Sans',
    fontSize: '18px',
    lineHeight: '28px',
    color: '#000000',
    fontWeight: 400,
  },
  footerIcon: {
    width: 24,
    height: 21.5,
  },
}));

// Labels for the blog post filter tabs
const TABS = ['All', 'Most Popular', 'Tips & Tricks', 'Finances', 'Landlords', 'Op-Eds'];

/**
 * BlogPostPage Component
 *
 * This component represents the main blog landing page for apartment advice.
 * It fetches and displays blog posts in a responsive card grid, supports
 * searching by title, filtering by topic tab, and optionally sorting by
 * popularity. Users can click a card to navigate to a full blog post view.
 *
 * @component
 * @returns BlogPostPage The BlogPostPage component.
 */
const BlogPostPage = (): ReactElement => {
  const classes = useStyles();
  const history = useHistory();

  // Set the page title using the useTitle custom hook
  useTitle('APT Advice');

  // State to store all blog posts loaded from the API
  const [posts, setPosts] = useState<BlogPost[]>([]);

  // State to store the current search query entered by the user
  const [search, setSearch] = useState('');

  // State to track which tab is currently active
  const [activeTab, setActiveTab] = useState<string>('All');

  // Fetch blog posts when the component mounts
  useEffect(() => {
    axios
      .get<BlogPost[]>('/api/blog-posts')
      .then((res) => setPosts(res.data))
      .catch((err) => {
        console.error('Error fetching blog posts', err);
        setPosts([]);
      });
  }, []);

  // Helper function to determine whether a post belongs in the selected tab
  const tabMatchesPost = (post: BlogPost, tab: string) => {
    if (tab === 'All') return true;
    if (tab === 'Most Popular') return true;
    const t = tab.toLowerCase();
    return (post.tags || []).some((x) => x?.toLowerCase() === t);
  };

  // Memoized list of posts filtered by the active tab and search query
  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesTab = tabMatchesPost(post, activeTab);
      const matchesSearch = q.length === 0 || post.title.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [posts, search, activeTab]);

  // Apply additional sorting when the "Most Popular" tab is active
  const visiblePosts =
    activeTab === 'Most Popular'
      ? [...filteredPosts].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
      : filteredPosts;

  return (
    <Box className={classes.background}>
      {/* Page container that constrains content width and centers the layout */}
      <Box className={classes.pageContainer}>
        {/* Page header and search bar section */}
        <Box style={{ width: '688px', height: '200px' }}>
          <Box style={{ width: '576px', height: '92px' }}>
            <Typography className={classes.header}>Advice for All Things Apartment</Typography>
          </Box>

          <Box style={{ marginTop: '40px' }}>
            <Box className={classes.searchWrap}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={classes.searchField}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon style={{ color: '#898989' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Row of filter tabs for switching between categories */}
        <Box className={classes.tabsRow}>
          {TABS.map((t) => (
            <Button
              key={t}
              disableRipple
              disableFocusRipple
              className={`${classes.tabButton} ${activeTab === t ? classes.activeTab : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </Button>
          ))}
        </Box>

        {/* Grid of blog post cards */}
        <Grid container className={classes.cardsGrid} spacing={4}>
          {visiblePosts.map((post) => {
            const hero = post.photos?.[0] ?? '';

            return (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <ButtonBase
                  className={`${classes.cardButton} ${classes.cardInteractive}`}
                  disableRipple
                  disableTouchRipple
                  focusRipple={false}
                  onClick={() => {
                    // Navigate to the full blog post view in the same tab
                    history.push(`/apt-advice/${post.id}`);
                  }}
                >
                  <Box className={classes.card}>
                    <Box className={classes.cardImage}>
                      {hero && <img src={hero} alt={post.title} />}
                    </Box>

                    <Box style={{ marginTop: '24px', maxWidth: '100%' }}>
                      <Typography className={classes.cardTitle}>{post.title}</Typography>
                    </Box>

                    <Box style={{ marginTop: '16px', maxWidth: '100%' }}>
                      <Typography className={classes.cardDescription}>{post.blurb}</Typography>
                    </Box>

                    {/* Footer with likes and saves summary */}
                    <Box className={classes.cardFooter}>
                      <Box className={classes.footerItem}>
                        <FavoriteBorderIcon className={classes.footerIcon} />
                        <span>{post.likes ?? 0}</span>
                      </Box>

                      <Box className={classes.footerItem}>
                        <BookmarkBorderIcon className={classes.footerIcon} />
                        <span>{post.saves ?? 0}</span>
                      </Box>
                    </Box>
                  </Box>
                </ButtonBase>
              </Grid>
            );
          })}

          {/* Fallback message when no posts match the current filters */}
          {visiblePosts.length === 0 && (
            <Grid item xs={12}>
              <Typography>No posts found.</Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default BlogPostPage;

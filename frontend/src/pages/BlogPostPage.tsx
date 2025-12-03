import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  makeStyles,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  ButtonBase,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import { colors } from '../colors';
import { useTitle } from '../utils';
import axios from 'axios';

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

// Matches your backend shape (db-types BlogPostWithId)
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
    border: '1px solid #E5E7EB', // subtle gray like the design
    boxShadow: '0px 8px 24px rgba(0,0,0,0.06)',
    overflow: 'hidden', // <-- this prevents the “leak”
  },
  searchField: {
    // keep the TextField itself “invisible”, wrapper handles visuals
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'transparent',
      borderRadius: 10,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none', // <-- remove MUI’s fieldset border
    },
    '& .MuiOutlinedInput-input': {
      padding: '20px 24px', // adjust height/feel here
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

  // Whole card = button
  cardButton: {
    width: '100%',
    display: 'inline-flex', // so padding wraps tightly around inner content
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    textAlign: 'left',
    backgroundColor: 'transparent',
    borderRadius: '12px',

    padding: '12px 12px 0px 12px', // <-- THIS is the inner padding you want
    boxSizing: 'border-box',

    border: '1px solid transparent', // <-- border lives on the button now
    transition: 'border-color 150ms ease, box-shadow 150ms ease',

    outline: 'none',
    '&:focus': { outline: 'none' },
    '&:focus-visible': { outline: 'none' },
    '& .MuiTouchRipple-root': { display: 'none' },
  },

  // hover/focus should target the button itself now
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

  // make the inner card the fixed size, but NO border/shadow here
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
  },

  cardBody: {
    padding: '0 12px 12px 12px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
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
    WebkitLineClamp: 5, // <- number of lines before "..."
  },
  tagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    height: 24,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    color: '#111827',
    fontFamily: 'Work Sans',
    fontWeight: 500,
  },
  cardFooter: {
    marginTop: 'auto', // <-- pushes footer to the bottom
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

const TABS = ['All', 'Most Popular', 'Tips & Tricks', 'Finances', 'Landlords', 'Op-Eds'];

const BlogPostPage = ({ user, setUser }: Props): ReactElement => {
  const classes = useStyles();
  useTitle('APT Advice');

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');

  useEffect(() => {
    axios
      .get<BlogPost[]>('/api/blog-posts')
      .then((res) => setPosts(res.data))
      .catch((err) => {
        console.error('Error fetching blog posts', err);
        setPosts([]);
      });
  }, []);

  const tabMatchesPost = (post: BlogPost, tab: string) => {
    if (tab === 'All') return true;
    if (tab === 'Most Popular') return true;
    const t = tab.toLowerCase();
    return (post.tags || []).some((x) => x?.toLowerCase() === t);
  };

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesTab = tabMatchesPost(post, activeTab);
      const matchesSearch = q.length === 0 || post.title.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [posts, search, activeTab]);

  const visiblePosts =
    activeTab === 'Most Popular'
      ? [...filteredPosts].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
      : filteredPosts;

  return (
    <Box className={classes.background}>
      <Box className={classes.pageContainer}>
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

        <Grid container className={classes.cardsGrid}>
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
                    // TODO: navigate to post detail page
                    console.log('clicked post', post.id);
                  }}
                >
                  <Box className={classes.card}>
                    <Box className={classes.cardImage}>
                      {hero ? <img src={hero} alt={post.title} /> : null}
                    </Box>

                    <Box style={{ marginTop: '24px', maxWidth: '100%' }}>
                      <Typography className={classes.cardTitle}>{post.title}</Typography>
                    </Box>

                    <Box style={{ marginTop: '16px', maxWidth: '100%' }}>
                      <Typography className={classes.cardDescription}>{post.blurb}</Typography>
                    </Box>

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

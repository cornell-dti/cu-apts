// BlogPostDetailPage.tsx

import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { Box, Chip, makeStyles, Typography, ButtonBase } from '@material-ui/core';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import { useTitle } from '../utils';
import heroImage from '../assets/blog-hero.jpg';

type BlogPost = {
  readonly id: string;
  readonly content: string; // TinyMCE HTML string
  readonly blurb: string;
  readonly date: Date | string;
  readonly likes?: number;
  readonly tags: string[];
  readonly title: string;
  readonly userId?: string | null;
  readonly visibility: string;
  readonly saves: number;

  // NEW: you’re saving this from AdminPage
  readonly coverImageUrl?: string;

  // Optional: keep if your backend still returns photos
  readonly photos?: string[];
};

type RouteParams = { postId: string };

const useStyles = makeStyles(() => ({
  pageRoot: {
    backgroundColor: '#FFFFFF',
    minHeight: '100vh',
    width: '100%',
  },
  heroWrapper: {
    position: 'relative',
    width: '100%',
    height: '614px',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 1,
      pointerEvents: 'none',
    },
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    color: '#FFFFFF',
    zIndex: 2,
  },
  heroOverlayInner: {
    marginTop: '321px',
    marginLeft: '169px',
    width: '610px',
    height: '240px',
  },
  heroTitle: {
    fontFamily: 'Work Sans',
    fontWeight: 600,
    fontSize: '30px',
    lineHeight: '36px',
    marginBottom: '16px',
  },
  tagRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  tagChipRed: {
    fontFamily: 'Work Sans',
    height: '40px',
    width: '129px',
    borderRadius: '8px',
    backgroundColor: '#9C3B29',
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: '24px',
  },
  heroMetaRowTop: {
    fontFamily: 'Work Sans',
    fontSize: '22px',
    fontWeight: 500,
    lineHeight: '32px',
    marginBottom: '16px',
  },
  heroMetaRowBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  heroMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'Work Sans',
    fontSize: '22px',
    fontWeight: 400,
    lineHeight: '32px',
  },
  heroMetaIcon: {
    width: 23,
    height: 21,
  },
  contentContainer: {
    width: '100%',
    maxWidth: '1102px',
    margin: '69px 169px',
  },

  // IMPORTANT: this styles the HTML you injected from TinyMCE
  articleContent: {
    fontFamily: 'Work Sans',
    '& h2': {
      fontFamily: 'Work Sans',
      fontWeight: 600,
      fontSize: 20,
      margin: '24px 0 10px',
      color: '#111827',
    },
    '& h3': {
      fontFamily: 'Work Sans',
      fontWeight: 600,
      fontSize: 14,
      margin: '20px 0 6px',
      color: '#111827',
    },
    '& p': {
      fontFamily: 'Work Sans',
      fontWeight: 400,
      fontSize: 14,
      lineHeight: '24px',
      color: '#4B5563',
      margin: '0 0 16px',
    },
    '& hr': {
      border: 'none',
      borderTop: '1px solid #E5E7EB',
      margin: '32px 0',
    },
    '& a': {
      color: '#9C3B29',
      textDecoration: 'underline',
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: 12,
      display: 'block',
      margin: '16px 0',
    },
    // In case your templates use figure blocks
    '& figure': {
      margin: '16px 0',
    },
  },

  moreSection: {
    maxWidth: '1102px',
    marginTop: '72px',
    borderTop: '1px solid #C4C4C4',
  },
  moreTitle: {
    marginLeft: '12px',
    fontFamily: 'Work Sans',
    fontWeight: 600,
    fontSize: '22px',
    lineHeight: '32px',
    marginTop: '72px',
    marginBottom: '32px',
  },
  moreCardsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '110px',
    marginLeft: '12px',
    alignItems: 'flex-start',
  },
  moreCardButton: {
    backgroundColor: 'transparent !important',
    borderRadius: '24px',
    textAlign: 'left',
    width: '490px',
    overflow: 'visible',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',

    '&:hover, &:active, &:focus, &:focus-visible, &.Mui-focusVisible': {
      backgroundColor: 'transparent !important',
    },

    '& .MuiTouchRipple-root': { display: 'none' },

    '&:hover $moreCardOuter:after, &:focus-visible $moreCardOuter:after, &.Mui-focusVisible $moreCardOuter:after':
      {
        borderColor: '#EB5757',
        boxShadow: '0px 12px 30px rgba(0,0,0,0.10)',
      },
  },
  moreCardOuter: {
    width: '490px',
    boxSizing: 'border-box',
    borderRadius: '24px',
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'visible',

    '&:after': {
      content: '""',
      position: 'absolute',
      top: -12,
      left: -12,
      right: -12,
      bottom: -12,
      borderRadius: '24px',
      border: '1px solid transparent',
      boxShadow: 'none',
      transition: 'border-color 150ms ease, box-shadow 150ms ease',
      pointerEvents: 'none',
    },
  },
  moreCard: {
    width: '490px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '12px',
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
  },
  moreCardImage: {
    width: '490px',
    height: '317px',
    marginTop: '24px',
    borderRadius: '12px',
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
  moreCardText: {
    width: '490px',
    height: '160',
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
  },
  moreCardTitle: {
    fontFamily: 'Work Sans',
    fontWeight: 600,
    fontSize: '22px',
    lineHeight: '32px',
    color: '#000000',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 1,
  },
  moreCardDescription: {
    marginTop: '16px',
    fontFamily: 'Work Sans',
    fontSize: '18px',
    lineHeight: '28px',
    fontWeight: 400,
    color: '#5D5D5D',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 4,
  },
  moreCardFooter: {
    marginTop: '24px',
    marginBottom: '28px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    color: '#000000',
  },
  moreFooterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'Work Sans',
    fontSize: '18px',
    lineHeight: '28px',
    color: '#000000',
    fontWeight: 400,
  },
  moreFooterIcon: {
    width: 24,
    height: 21.5,
  },
}));

const BlogPostDetailPage = (): ReactElement => {
  const classes = useStyles();
  const { postId } = useParams<RouteParams>();
  const history = useHistory();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get<BlogPost>(`/api/blog-post-by-id/${postId}`);
        if (!isMounted) return;
        setPost(res.data);

        const listRes = await axios.get<BlogPost[]>('/api/blog-posts');
        if (!isMounted) return;
        setAllPosts(listRes.data);
      } catch (err) {
        console.error('Error fetching blog post detail', err);
        if (!isMounted) return;
        setError('We couldn’t load this article. Please try again later.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPost();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  useTitle(post?.title || 'APT Advice');

  const moreArticles = useMemo(
    () => allPosts.filter((p) => p.id !== postId).slice(0, 2),
    [allPosts, postId]
  );

  if (loading) {
    return (
      <Box className={classes.pageRoot}>
        <Box className={classes.contentContainer}>
          <Typography>Loading…</Typography>
        </Box>
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box className={classes.pageRoot}>
        <Box className={classes.contentContainer}>
          <Typography color="error" style={{ marginBottom: 16 }}>
            {error ?? 'Article not found.'}
          </Typography>
          <Typography
            style={{ cursor: 'pointer', color: '#EB5757' }}
            onClick={() => history.push('/blogs')}
          >
            ← Back to all advice articles
          </Typography>
        </Box>
      </Box>
    );
  }

  const likeCount = post.likes ?? 0;
  const saveCount = post.saves ?? 0;

  const displayDate = new Date(post.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // ✅ FIX: use coverImageUrl first (since that’s what you save)
  const hero = post.coverImageUrl || post.photos?.[0] || heroImage;

  return (
    <Box className={classes.pageRoot}>
      <Box className={classes.heroWrapper}>
        <img src={hero} alt={post.title} className={classes.heroImage} />

        <Box className={classes.heroOverlay}>
          <Box className={classes.heroOverlayInner}>
            <Typography className={classes.heroTitle}>{post.title}</Typography>

            <Box className={classes.tagRow}>
              {(post.tags ?? []).filter(Boolean).map((t, idx) => (
                <Chip key={`${t}-${idx}`} label={t} className={classes.tagChipRed} />
              ))}
            </Box>

            <Box className={classes.heroMetaRowTop}>
              <span>Published {displayDate}</span>
            </Box>

            <Box className={classes.heroMetaRowBottom}>
              <Box className={classes.heroMetaItem}>
                <FavoriteBorderIcon className={classes.heroMetaIcon} />
                <span>{likeCount}</span>
              </Box>

              <Box className={classes.heroMetaItem}>
                <BookmarkBorderIcon className={classes.heroMetaIcon} />
                <span>{saveCount}</span>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className={classes.contentContainer}>
        {/* ✅ This is how you display TinyMCE HTML */}
        <div
          className={classes.articleContent}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <Box className={classes.moreSection}>
          <Typography className={classes.moreTitle}>More Articles Like This</Typography>

          <Box className={classes.moreCardsWrap}>
            {moreArticles.map((p) => {
              const img = p.coverImageUrl || p.photos?.[0] || heroImage;

              return (
                <ButtonBase
                  key={p.id}
                  className={classes.moreCardButton}
                  disableRipple
                  disableTouchRipple
                  focusRipple={false}
                  onClick={() => history.push(`/apt-advice/${p.id}`)}
                >
                  <Box className={classes.moreCardOuter}>
                    <Box className={classes.moreCard}>
                      <Box className={classes.moreCardImage}>
                        {img && <img src={img} alt={p.title} />}
                      </Box>

                      <Box className={classes.moreCardText}>
                        <Typography className={classes.moreCardTitle}>{p.title}</Typography>
                        <Typography className={classes.moreCardDescription}>{p.blurb}</Typography>
                      </Box>

                      <Box className={classes.moreCardFooter}>
                        <Box className={classes.moreFooterItem}>
                          <FavoriteBorderIcon className={classes.moreFooterIcon} />
                          <span>{p.likes ?? 0}</span>
                        </Box>

                        <Box className={classes.moreFooterItem}>
                          <BookmarkBorderIcon className={classes.moreFooterIcon} />
                          <span>{p.saves ?? 0}</span>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BlogPostDetailPage;

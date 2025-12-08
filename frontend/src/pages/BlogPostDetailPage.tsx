// src/pages/BlogPostDetailPage.tsx
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { Box, Chip, Grid, makeStyles, Typography, ButtonBase } from '@material-ui/core';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import { useTitle } from '../utils';
import heroImage from '../assets/blog-hero.jpg';

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

type RouteParams = { postId: string };

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

const useStyles = makeStyles(() => ({
  pageBackground: {
    backgroundColor: '#F3F4F6',
    minHeight: '100vh',
    width: '100%',
    padding: '40px 0',
    display: 'flex',
    justifyContent: 'center',
  },
  frame: {
    width: '100%',
    maxWidth: 1200,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0px 24px 60px rgba(0,0,0,0.08)',
  },
  heroWrapper: {
    position: 'relative',
    width: '100%',
    height: 360,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  heroOverlay: {
    position: 'absolute',
    left: 72,
    bottom: 48,
    color: '#FFFFFF',
    maxWidth: 480,
  },
  heroTitle: {
    fontFamily: 'Work Sans',
    fontWeight: 600,
    fontSize: 28,
    lineHeight: '36px',
    marginBottom: 12,
  },
  tagRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  tagChipRed: {
    height: 28,
    borderRadius: 999,
    backgroundColor: '#EB5757',
    color: '#FFFFFF',
    fontFamily: 'Work Sans',
    fontWeight: 500,
    fontSize: 12,
  },
  tagChipOrange: {
    height: 28,
    borderRadius: 999,
    backgroundColor: '#F2994A',
    color: '#FFFFFF',
    fontFamily: 'Work Sans',
    fontWeight: 500,
    fontSize: 12,
  },
  heroMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    fontFamily: 'Work Sans',
    fontSize: 14,
  },
  heroMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  heroMetaIcon: {
    width: 20,
    height: 20,
  },
  body: {
    padding: '40px 96px 56px 96px',
  },
  articleContent: {
    maxWidth: 800,
    margin: '0 auto',
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
  },
  moreSection: {
    maxWidth: 960,
    margin: '56px auto 0',
    borderTop: '1px solid #E5E7EB',
    paddingTop: 32,
  },
  moreTitle: {
    fontFamily: 'Work Sans',
    fontWeight: 600,
    fontSize: 16,
    marginBottom: 24,
  },
  moreCardButton: {
    width: '100%',
    textAlign: 'left',
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
    boxShadow: '0px 16px 40px rgba(0,0,0,0.06)',
    backgroundColor: '#FFFFFF',
    display: 'block',
  },
  moreCardInner: {
    display: 'flex',
    padding: 16,
    gap: 24,
  },
  moreImageWrapper: {
    width: 260,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    flexShrink: 0,
  },
  moreImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  moreCardBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  moreCardTitle: {
    fontFamily: 'Work Sans',
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 8,
  },
  moreCardBlurb: {
    fontFamily: 'Work Sans',
    fontSize: 13,
    lineHeight: '20px',
    color: '#4B5563',
    marginBottom: 16,
  },
  moreFooterRow: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    fontFamily: 'Work Sans',
    fontSize: 13,
    color: '#000000',
  },
  moreFooterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
}));

const BlogPostDetailPage = ({ user, setUser }: Props): ReactElement => {
  const classes = useStyles();
  const { postId } = useParams<RouteParams>();
  const history = useHistory();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ call the route your backend actually exposes
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
      <Box className={classes.pageBackground}>
        <Box className={classes.frame}>
          <Box padding={4}>
            <Typography>Loading…</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box className={classes.pageBackground}>
        <Box className={classes.frame}>
          <Box padding={4}>
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
      </Box>
    );
  }

  const likeCount = post.likes ?? 0;
  const saveCount = post.saves ?? 0;
  const commentCount = 5; // placeholder
  const displayDate = new Date(post.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const hero = post.photos?.[0] || heroImage;

  return (
    <Box className={classes.pageBackground}>
      <Box className={classes.frame}>
        {/* HERO */}
        <Box className={classes.heroWrapper}>
          <img src={hero} alt={post.title} className={classes.heroImage} />

          <Box className={classes.heroOverlay}>
            <Typography className={classes.heroTitle}>{post.title}</Typography>

            <Box className={classes.tagRow}>
              <Chip label="Most Popular" className={classes.tagChipRed} />
              {post.tags
                .filter((t) => t.toLowerCase() === 'tips & tricks')
                .map((t) => (
                  <Chip key={t} label={t} className={classes.tagChipOrange} />
                ))}
            </Box>

            <Box className={classes.heroMetaRow}>
              <span>Published {displayDate}</span>

              <Box className={classes.heroMetaItem}>
                <FavoriteBorderIcon className={classes.heroMetaIcon} />
                <span>{likeCount}</span>
              </Box>

              <Box className={classes.heroMetaItem}>
                <ChatBubbleOutlineIcon className={classes.heroMetaIcon} />
                <span>{commentCount}</span>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* BODY + MORE */}
        <Box className={classes.body}>
          <div
            className={classes.articleContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <Box className={classes.moreSection}>
            <Typography className={classes.moreTitle}>More Articles Like This</Typography>

            <Grid container spacing={4}>
              {moreArticles.map((p) => {
                const img = p.photos?.[0] || heroImage;
                return (
                  <Grid item xs={12} md={6} key={p.id}>
                    <ButtonBase
                      className={classes.moreCardButton}
                      onClick={() => history.push(`/apt-advice/${p.id}`)}
                    >
                      <Box className={classes.moreCardInner}>
                        <Box className={classes.moreImageWrapper}>
                          <img src={img} alt={p.title} className={classes.moreImage} />
                        </Box>

                        <Box className={classes.moreCardBody}>
                          <Typography className={classes.moreCardTitle}>{p.title}</Typography>
                          <Typography className={classes.moreCardBlurb}>{p.blurb}</Typography>

                          <Box className={classes.moreFooterRow}>
                            <Box className={classes.moreFooterItem}>
                              <FavoriteBorderIcon style={{ width: 18, height: 18 }} />
                              <span>{p.likes ?? 0}</span>
                            </Box>
                            <Box className={classes.moreFooterItem}>
                              <BookmarkBorderIcon style={{ width: 18, height: 18 }} />
                              <span>{p.saves ?? 0}</span>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </ButtonBase>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BlogPostDetailPage;

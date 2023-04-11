import React, { ReactElement, useState } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Button,
  IconButton,
  Collapse,
} from '@material-ui/core';
import HeartRating from '../utils/HeartRating';
import { format } from 'date-fns';
import { makeStyles } from '@material-ui/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';
import { DetailedRating, ReviewWithId } from '../../../../common/types/db-types';
import axios from 'axios';
import { colors } from '../../colors';
import { RatingInfo } from '../../pages/LandlordPage';
import ReviewHeader from './ReviewHeader';
import { getUser } from '../../utils/firebase';

type Props = {
  readonly review: ReviewWithId;
  readonly liked: boolean;
  readonly likeLoading: boolean;
  readonly addLike: (reviewId: string) => Promise<void>;
  readonly removeLike: (reviewId: string) => Promise<void>;
  readonly toggle: boolean;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: '10px',
  },
  bottomborder: {
    borderBottom: '1px #E8E8E8 solid',
    marginBottom: '5px',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    borderColor: colors.black,
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  dateText: {
    color: colors.gray1,
  },
  heartSpacing: {
    marginBottom: '10px',
  },
  button: {
    textTransform: 'none',
    '&.Mui-disabled': {
      color: 'inherit',
    },
  },
}));

const ReviewComponent = ({
  review,
  liked,
  likeLoading,
  addLike,
  removeLike,
  toggle,
  setToggle,
  user,
  setUser,
}: Props): ReactElement => {
  const { id, detailedRatings, overallRating, date, reviewText, likes, photos } = review;
  const formattedDate = format(new Date(date), 'MMM dd, yyyy').toUpperCase();
  const { root, bottomborder, expand, expandOpen, dateText, button, heartSpacing } = useStyles();
  const [expanded, setExpanded] = useState(false);
  const [expandedText, setExpandedText] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const getRatingInfo = (ratings: DetailedRating): RatingInfo[] => {
    return [
      { feature: 'Location', rating: ratings.location },
      { feature: 'Safety', rating: ratings.safety },
      { feature: 'Value', rating: ratings.value },
      { feature: 'Maintenance', rating: ratings.maintenance },
      { feature: 'Communication', rating: ratings.communication },
      { feature: 'Conditions', rating: ratings.conditions },
    ];
  };

  const handleReportAbuse = async (reviewId: string) => {
    if (!user) {
      let user = await getUser(true);
      setUser(user);
    }
    if (!user) {
      throw new Error('Failed to login');
    }

    const endpoint = `update-review-status/${reviewId}/PENDING`;
    await axios.put(endpoint);
    setToggle(!toggle);
  };

  return (
    <Card className={root} variant="outlined">
      <Box minHeight="200px">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container justifyContent="space-between">
              <Grid item container justifyContent="space-between" className={bottomborder}>
                <Grid container item xs={10} spacing={2}>
                  <Grid item className={heartSpacing}>
                    <HeartRating value={overallRating} readOnly />
                  </Grid>
                  <Grid item>
                    <IconButton
                      className={clsx(expand, {
                        [expandOpen]: expanded,
                      })}
                      onClick={handleExpandClick}
                      aria-expanded={expanded}
                      aria-label="show more"
                      size="small"
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Grid>
                </Grid>

                <Grid item>
                  <Typography className={dateText}>{formattedDate}</Typography>
                </Grid>

                <Grid item>
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                      <ReviewHeader aveRatingInfo={getRatingInfo(detailedRatings)} />
                    </CardContent>
                  </Collapse>
                </Grid>
              </Grid>

              <Grid item container alignContent="center">
                <Typography>
                  {expandedText ? reviewText : reviewText.substring(0, 500)}
                  {!expandedText && reviewText.length > 500 && '...'}
                  {reviewText.length > 500 ? (
                    <Button className={button} onClick={() => setExpandedText(!expandedText)}>
                      {expandedText ? 'Read Less' : 'Read More'}
                    </Button>
                  ) : null}
                </Typography>
              </Grid>
              {photos.length > 0 && (
                <Grid container alignItems="center" justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <CardMedia
                      component="img"
                      alt="Apt image"
                      image={photos[0]}
                      title="Apt image"
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Box>
      <CardActions>
        <Grid item container justifyContent="space-between">
          <Grid item>
            <Button
              color={liked ? 'primary' : 'default'}
              onClick={() => (liked ? removeLike : addLike)(id)}
              className={button}
              size="small"
              disabled={likeLoading}
            >
              Helpful {`(${likes || 0})`}
            </Button>
          </Grid>
          <Grid item>
            <Button onClick={() => handleReportAbuse(review.id)} className={button} size="small">
              Report Abuse
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default ReviewComponent;

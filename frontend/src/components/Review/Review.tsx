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
import DetailedRatings from './DetailedRating';
import { ReviewWithId } from '../../../../common/types/db-types';
import { colors } from '../../colors';

type Props = {
  readonly review: ReviewWithId;
  readonly liked: boolean;
  readonly likeLoading: boolean;
  // readonly addLike: (reviewId: string) => Promise<void>;
  // readonly removeLike: (reviewId: string) => Promise<void>;
};

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: '10px',
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
}: // addLike,
// removeLike,
Props): ReactElement => {
  const { id, detailedRatings, overallRating, date, reviewText, likes, photos } = review;
  const formattedDate = format(new Date(date), 'MMM dd, yyyy').toUpperCase();
  const { root, expand, expandOpen, dateText, button } = useStyles();
  const [expanded, setExpanded] = useState(false);
  const [expandedText, setExpandedText] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className={root} variant="outlined">
      <Box minHeight="200px">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container justify="space-between">
              <Grid container item xs={10} spacing={2}>
                <Grid item>
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
                    <DetailedRatings ratings={detailedRatings} />
                  </CardContent>
                </Collapse>
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
                <Grid container alignItems="center" justify="center">
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
        <Grid item container justify="space-between">
          <Grid item>
            <Button
              color={liked ? 'primary' : 'default'}
              // onClick={() => (liked ? removeLike : addLike)(id)}
              className={button}
              size="small"
              disabled={likeLoading}
            >
              Helpful {`(${likes || 0})`}
            </Button>
          </Grid>
          <Grid item>
            <Button className={button} size="small">
              Report Abuse
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default ReviewComponent;

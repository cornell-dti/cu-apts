import React, { ReactElement } from 'react';
import {
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

type Props = {
  readonly review: ReviewWithId;
  readonly liked: boolean;
  readonly addLike: (reviewId: string) => Promise<void>;
  readonly removeLike: (reviewId: string) => Promise<void>;
};

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: '10px',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    borderColor: 'black',
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  dateText: {
    color: '#5D5D5D',
  },
  button: {
    textTransform: 'none',
    '&.Mui-disabled': {
      color: '#EB5757',
    },
  },
}));

const ReviewComponent = ({ review, liked, addLike, removeLike }: Props): ReactElement => {
  const { id, detailedRatings, overallRating, date, reviewText, likes, photos } = review;
  const formattedDate = format(new Date(date), 'MMM dd, yyyy').toUpperCase();
  const { root, expand, expandOpen, dateText, button } = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Grid item>
      <Card className={root} variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container justify="space-between">
              <Grid container spacing={2}>
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
            </Grid>
            <Grid item>
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                  <DetailedRatings ratings={detailedRatings} />
                </CardContent>
              </Collapse>
            </Grid>
            <Grid item container alignContent="center">
              <Typography>{reviewText}</Typography>
            </Grid>
            {photos.length > 0 && (
              <Grid container alignItems="center" justify="center">
                <Grid item xs={12} sm={6}>
                  <CardMedia component="img" alt="Apt image" image={photos[0]} title="Apt image" />
                </Grid>
              </Grid>
            )}
          </Grid>
        </CardContent>
        <CardActions>
          <Grid item container justify="space-between">
            <Grid item>
              <Button
                color={liked ? 'primary' : 'default'}
                onClick={() => (liked ? removeLike : addLike)(id)}
                className={button}
                size="small"
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
    </Grid>
  );
};

export default ReviewComponent;

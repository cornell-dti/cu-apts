import React, { ReactElement, useEffect, useState } from 'react';
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
  FormLabel,
} from '@material-ui/core';
import HeartRating from '../utils/HeartRating';
import { format } from 'date-fns';
import { makeStyles } from '@material-ui/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';
import DetailedRatings from '../Review/DetailedRating';
import { ApartmentWithId, Landlord, ReviewWithId } from '../../../../common/types/db-types';
import { colors } from '../../colors';
import { get } from '../../utils/call';

type Props = {
  readonly review: ReviewWithId;
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

type ItemProps = {
  readonly aspect: string;
  readonly rating: number;
};

const Item = ({ aspect, rating }: ItemProps): ReactElement => {
  return (
    <Grid container item xs={12} md={6}>
      <Grid container item xs={12} sm={7} lg={5}>
        <HeartRating value={rating} readOnly />
      </Grid>
      <Grid container item xs={12} sm={5} lg={7}>
        <FormLabel>{aspect}</FormLabel>
      </Grid>
    </Grid>
  );
};

const AdminReviewComponent = ({ review }: Props): ReactElement => {
  const { id, detailedRatings, overallRating, date, reviewText, likes, photos } = review;
  const formattedDate = format(new Date(date), 'MMM dd, yyyy').toUpperCase();
  const { root, expand, expandOpen, dateText, button } = useStyles();
  const [expanded, setExpanded] = useState(true);
  const [expandedText, setExpandedText] = useState(false);
  const [apt, setApt] = useState<ApartmentWithId[]>([]);
  const [landlord, setLandlord] = useState<Landlord | null>(null);

  useEffect(() => {
    if (review.aptId !== null) {
      get<ApartmentWithId[]>(`/apts/${review.aptId}`, {
        callback: setApt,
      });
    }
    get<Landlord>(`/landlord/${review.landlordId}`, {
      callback: setLandlord,
    });
  }, [review]);

  return (
    <Card className={root} variant="outlined">
      <Box minHeight="200px">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container justifyContent="space-between">
              <Grid item>
                <HeartRating value={overallRating} readOnly />
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
      {/* <CardActions>
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
            <Button className={button} size="small">
              Report Abuse
            </Button>
          </Grid>
        </Grid>
      </CardActions> */}
    </Card>
  );
};

export default AdminReviewComponent;

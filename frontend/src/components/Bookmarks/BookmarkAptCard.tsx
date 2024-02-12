import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { ApartmentWithId, ReviewWithId } from '../../../../common/types/db-types';
import ApartmentImg from '../../assets/apartment-placeholder.svg';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import HeartRating from '../utils/HeartRating';
import { getAverageRating } from '../../utils/average';
import { get } from '../../utils/call';
import { colors } from '../../colors';

type Props = {
  buildingData: ApartmentWithId;
  numReviews: number;
  company?: string;
};

const useStyles = makeStyles({
  root: {
    borderRadius: '0.8em',
  },
  media: {
    maxHeight: '210px',
    borderRadius: '0.8em',
    marginBottom: '1em',
  },
  aptNameTxt: {
    fontWeight: 700,
  },
  reviewNum: {
    fontWeight: 600,
    marginLeft: '10px',
    fontSize: '16px',
  },
  bookmark: {
    color: colors.red1,
  },
});

const BookmarkAptCard = ({ buildingData, numReviews, company }: Props) => {
  const { id, name, photos } = buildingData;
  const img = photos.length > 0 ? photos[0] : ApartmentImg;
  const [reviewList, setReviewList] = useState<ReviewWithId[]>([]);

  const { root, media, aptNameTxt, reviewNum, bookmark } = useStyles();

  useEffect(() => {
    // Fetches approved reviews for the current apartment.
    get<ReviewWithId[]>(`/api/review/aptId/${id}/APPROVED`, {
      callback: setReviewList,
    });
  }, [id]);

  return (
    <Card className={root}>
      <CardActionArea>
        <CardContent>
          <CardMedia image={img} component="img" title={name} className={media} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" className={aptNameTxt}>
                {name}
              </Typography>
            </Box>
            <Box>
              <BookmarkIcon fontSize="large" className={bookmark} />
            </Box>
          </Box>
          {company && (
            <Grid container item justifyContent="space-between">
              <Grid>
                <Typography variant="subtitle1">{buildingData.address}</Typography>
              </Grid>
            </Grid>
          )}
          <Grid container direction="row" alignItems="center">
            <HeartRating value={getAverageRating(reviewList)} precision={0.5} readOnly />
            <Typography variant="h6" className={reviewNum}>
              {numReviews + (numReviews !== 1 ? ' Reviews' : ' Review')}
            </Typography>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BookmarkAptCard;

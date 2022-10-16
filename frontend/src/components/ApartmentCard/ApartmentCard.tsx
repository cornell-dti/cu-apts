import React, { ReactElement, useState, useEffect } from 'react';
import { get } from '../../utils/call';
import ApartmentImg from '../../assets/apartment-placeholder.png';
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { ApartmentWithId, ReviewWithId } from '../../../../common/types/db-types';
import HeartRating from '../utils/HeartRating';
import { getAverageRating } from '../../utils/average';
import { colors } from '../../colors';

type Props = {
  buildingData: ApartmentWithId;
  numReviews: number;
  company?: string;
};
const useStyles = makeStyles({
  imgStyle: {
    borderRadius: '12%',
    padding: '17px',
  },
  imgMobile: {
    borderRadius: '9%',
    padding: '15px',
  },

  aptNameTxt: {
    fontWeight: 800,
    marginLeft: '25px',
  },
  marginTxt: {
    marginLeft: '25px',
  },
  card: {
    borderRadius: '10px',
    backgroundColor: colors.red6,
  },
  reviewNum: {
    fontWeight: 700,
    marginLeft: '10px',
  },
  textStyle: {
    maxWidth: '100%',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginLeft: '25px',
    marginRight: '5px',
  },
});

const ApartmentCard = ({ buildingData, numReviews, company }: Props): ReactElement => {
  const { id, name, photos } = buildingData;
  const img = photos.length > 0 ? photos[0] : ApartmentImg;
  const { imgStyle, imgMobile, aptNameTxt, marginTxt, card, reviewNum, textStyle } = useStyles();
  const matches = useMediaQuery('(min-width:600px)');
  const [reviewList, setReviewList] = useState<ReviewWithId[]>([]);
  const sampleReview = reviewList.length === 0 ? 'No Reviews' : reviewList[0].reviewText;

  useEffect(() => {
    get<ReviewWithId[]>(`/review/aptId/${id}`, {
      callback: setReviewList,
    });
  }, [id]);

  return (
    <Card className={card}>
      <Grid container direction="row" alignItems="center">
        {matches && (
          <Grid item xs={11} sm={4} md={2}>
            <CardMedia className={imgStyle} image={img} component="img" title={name} />
          </Grid>
        )}
        {!matches && (
          <Grid item xs={11} sm={4} md={2}>
            <CardMedia className={imgMobile} image={img} component="img" title={name} />
          </Grid>
        )}
        <Grid item sm={8} md={10}>
          <CardContent>
            <Grid container spacing={1}>
              <Grid item>
                <Typography variant="h5" className={aptNameTxt}>
                  {name}
                </Typography>
              </Grid>
              {company && (
                <Grid container item justify="space-between" className={marginTxt}>
                  <Grid>
                    <Typography variant="subtitle1">{buildingData.address}</Typography>
                  </Grid>
                </Grid>
              )}
              <Grid container direction="row" alignItems="center" className={marginTxt}>
                <HeartRating value={getAverageRating(reviewList)} precision={0.5} readOnly />
                <Typography variant="h6" className={reviewNum}>
                  {numReviews + (numReviews !== 1 ? ' Reviews' : ' Review')}
                </Typography>
              </Grid>
              <Grid>
                {matches && (
                  <Typography variant="subtitle1" className={textStyle}>
                    {sampleReview}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ApartmentCard;

import React, { ReactElement, useState, useEffect } from 'react';
import { get } from '../../utils/call';
import ApartmentImg from '../../assets/apartment-placeholder.svg';
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  Typography,
  useMediaQuery,
  IconButton,
} from '@material-ui/core';
import savedIcon from '../../assets/filled-saved-icon.png';
import unsavedIcon from '../../assets/unfilled-saved-icon.png';
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
  root: {
    borderRadius: '10px',
    '&:hover': {
      background: colors.red5,
    },
  },
  imgStyle: {
    borderRadius: '12%',
    padding: '17px',
  },
  aptNameTxt: {
    fontWeight: 800,
  },
  marginTxt: {
    paddingBottom: '-10px',
    paddingLeft: '20px',
  },
  reviewNum: {
    fontWeight: 700,
    marginLeft: '10px',
    fontSize: '18px',
  },
  textStyle: {
    maxWidth: '100%',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginLeft: '3px',
    marginRight: '5px',
  },
  imgMobile: {
    borderRadius: '10px',
    marginTop: '13px',
  },
  imgContainerMobile: {
    borderRadius: '10px',
  },
});

/**
 * ApartmentCard Component
 *
 * This component displays a card containing information about a specific apartment,
 * including its name, address, average rating, number of reviews, and a sample review.
 * The card is responsive and adjusts its layout based on the screen size.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {ApartmentWithId} props.buildingData - The data for the apartment.
 * @param {number} props.numReviews - The number of reviews for the apartment.
 * @param {string} [props.company] - The company associated with the apartment (optional).
 * @returns {ReactElement} ApartmentCard component.
 */
const ApartmentCard = ({ buildingData, numReviews, company }: Props): ReactElement => {
  const { id, name, photos } = buildingData;
  const saved = savedIcon;
  const unsaved = unsavedIcon;
  const img = photos.length > 0 ? photos[0] : ApartmentImg;
  const isMobile = useMediaQuery('(max-width:600px)');
  const [reviewList, setReviewList] = useState<ReviewWithId[]>([]);
  const sampleReview = reviewList.length === 0 ? '' : reviewList[0].reviewText;
  const [isSaved, setIsSaved] = useState(false);
  const [key, setKey] = useState(0);

  const {
    imgStyle,
    imgMobile,
    aptNameTxt,
    marginTxt,
    root,
    reviewNum,
    textStyle,
    imgContainerMobile,
  } = useStyles();

  const handleSaveToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault(); // Prevent the default behavior
    setIsSaved((prevIsSaved) => !prevIsSaved);
    setKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    // Fetches approved reviews for the current apartment.
    get<ReviewWithId[]>(`/api/review/aptId/${id}/APPROVED`, {
      callback: setReviewList,
    });
  }, [id]);

  return (
    <Card className={root} variant="outlined">
      <Grid container direction="row" alignItems="center">
        {!isMobile && (
          <Grid item xs={11} sm={4} md={2}>
            <CardMedia className={imgStyle} image={img} component="img" title={name} />
          </Grid>
        )}
        {isMobile && (
          <Grid container direction="row" alignItems="center" justifyContent="center">
            <Grid item xs={11} sm={4} md={2} className={imgContainerMobile}>
              <CardMedia
                className={imgMobile}
                style={{ height: isMobile ? '160px' : '480px' }}
                image={img}
                component="img"
                title={name}
              />
            </Grid>
          </Grid>
        )}
        <Grid item sm={8} md={10} className={marginTxt}>
          <CardContent>
            <Grid container direction="row" alignItems="center">
              <Grid item style={{ flex: 1 }}>
                <Typography
                  variant="h5"
                  className={aptNameTxt}
                  style={{ fontSize: isMobile ? '20px' : '25px' }}
                >
                  {name}
                </Typography>
              </Grid>
              {/* Add saved and unsaved icons on the right side */}
              <Grid item>
                <IconButton
                  onClick={handleSaveToggle}
                  style={{
                    padding: 30,
                    marginLeft: 'auto', // This pushes the icon to the right
                  }}
                >
                  <img
                    key={key}
                    src={isSaved ? saved : unsaved}
                    alt={isSaved ? 'Saved' : 'Unsaved'}
                    style={{ width: '25.2', height: '32.4px' }}
                  />
                </IconButton>
              </Grid>

              {company && (
                <Grid container item justifyContent="space-between">
                  <Grid>
                    <Typography
                      variant="subtitle1"
                      style={{ fontSize: isMobile ? '15px' : '20px' }}
                    >
                      {buildingData.address}
                    </Typography>
                  </Grid>
                </Grid>
              )}
              <Grid container direction="row" alignItems="center">
                <HeartRating value={getAverageRating(reviewList)} precision={0.5} readOnly />
                <Typography variant="h6" className={reviewNum}>
                  {numReviews + (numReviews !== 1 ? ' Reviews' : ' Review')}
                </Typography>
              </Grid>
              {!isMobile && (
                <Grid>
                  <Typography variant="subtitle1" className={textStyle}>
                    {sampleReview}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ApartmentCard;

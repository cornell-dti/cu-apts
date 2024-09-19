import React, { useEffect, ReactElement, useState, useCallback } from 'react';
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
  Link,
  useMediaQuery,
} from '@material-ui/core';
import HeartRating from '../utils/HeartRating';
import { format } from 'date-fns';
import { makeStyles } from '@material-ui/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import clsx from 'clsx';
import {
  DetailedRating,
  ReviewWithId,
  ApartmentWithId,
  Landlord,
} from '../../../../common/types/db-types';
import axios from 'axios';
import { colors } from '../../colors';
import { RatingInfo } from '../../pages/LandlordPage';
import ReviewHeader from './ReviewHeader';
import { Link as RouterLink } from 'react-router-dom';
import { createAuthHeaders, getUser } from '../../utils/firebase';
import { get } from '../../utils/call';
import getPriceRange from '../../utils/priceRange';
import { ReactComponent as BedIcon } from '../../assets/bed-icon.svg';
import { ReactComponent as MoneyIcon } from '../../assets/money-icon.svg';

type Props = {
  readonly review: ReviewWithId;
  readonly liked: boolean;
  readonly likeLoading: boolean;
  readonly addLike: (reviewId: string) => Promise<void>;
  readonly removeLike: (reviewId: string) => Promise<void>;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
  readonly showLabel: boolean;
};

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: '10px',
  },
  // styling for apartment indicator text
  apartmentIndicator: {
    display: 'inline-flex',
    marginTop: '7px',
    marginBottom: '7px',
    fontSize: '19px',
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
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  button: {
    textTransform: 'none',
    '&.Mui-disabled': {
      color: 'inherit',
    },
  },
  photoStyle: {
    borderRadius: '4px',
    height: '15em',
    width: '15em',
  },
  photoRowStyle: {
    overflowX: 'auto',
    display: 'flex',
    lexDirection: 'row',
    gap: '1vw',
    paddingTop: '2%',
    paddingLeft: '0.6%',
  },
  bedroomsPrice: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  bedroomsPriceText: {
    fontWeight: 600,
  },
  bedPriceIcon: {
    width: '21px',
    height: '21px',
  },
}));

const ReviewComponent = ({
  review,
  liked,
  likeLoading,
  addLike,
  removeLike,
  setToggle,
  user,
  setUser,
  showLabel,
}: Props): ReactElement => {
  const { id, detailedRatings, overallRating, date, bedrooms, price, reviewText, likes, photos } =
    review;
  const formattedDate = format(new Date(date), 'MMM dd, yyyy').toUpperCase();
  const {
    root,
    expand,
    expandOpen,
    dateText,
    button,
    photoStyle,
    photoRowStyle,
    bottomborder,
    reviewHeader,
    apartmentIndicator,
    bedroomsPrice,
    bedPriceIcon,
    bedroomsPriceText,
  } = useStyles();
  const [expanded, setExpanded] = useState(false);
  const [expandedText, setExpandedText] = useState(false);
  const [apt, setApt] = useState<ApartmentWithId[]>([]);
  const [landlordData, setLandlordData] = useState<Landlord>();
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  //Retreieving apartment data
  useEffect(() => {
    if (review.aptId !== null) {
      get<ApartmentWithId[]>(`/api/apts/${review.aptId}`, {
        callback: setApt,
      });
    }
  }, [review]);

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

  const reportAbuseHandler = async (reviewId: string) => {
    const endpoint = `/api/update-review-status/${review.id}/PENDING`;
    if (user) {
      const token = await user.getIdToken(true);
      await axios.put(endpoint, {}, createAuthHeaders(token));
      setToggle((cur) => !cur);
    } else {
      let user = await getUser(true);
      setUser(user);
    }
  };

  const likeHandler = async (id: string) => {
    if (user) {
      (liked ? removeLike : addLike)(id);
    } else {
      let user = await getUser(true);
      setUser(user);
    }
  };

  const handleLinkClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const landlordNotFound = useCallback(() => {
    console.error('Landlord with id ' + review.landlordId + ' not found.');
  }, [review.landlordId]);

  // Fetch landlord data when the component mounts or when landlordId changes
  useEffect(() => {
    get<Landlord>(`/api/landlord/${review.landlordId}`, {
      callback: setLandlordData,
      errorHandler: landlordNotFound,
    });
  }, [review.landlordId, landlordNotFound]);

  const propertyLandlordLabel = () => {
    return (
      showLabel && (
        <>
          <Grid style={{ fontWeight: 'bold', marginRight: '5px' }}>
            {apt.length > 0 ? 'Property: ' : 'Landlord: '}
          </Grid>
          <Link
            {...{
              to: apt.length > 0 ? `/apartment/${review.aptId}` : `/landlord/${review.landlordId}`,
              style: {
                color: 'black',
                textDecoration: 'underline',
                paddingBottom: '3px',
              },
              component: RouterLink,
            }}
            onClick={handleLinkClick}
          >
            {apt.length > 0 ? apt[0].name : landlordData ? landlordData.name : ''}
          </Link>
        </>
      )
    );
  };

  const bedroomsPriceLabel = () => {
    return (
      <Grid item className={bedroomsPrice} style={isMobile ? { width: '100%' } : {}}>
        {bedrooms > 0 && (
          <div
            className={bedroomsPrice}
            style={isMobile ? { marginLeft: '0' } : { marginLeft: '30px' }}
          >
            <BedIcon className={bedPriceIcon} />
            <Typography className={bedroomsPriceText}>
              {bedrooms} {bedrooms == 1 ? 'Bedroom' : 'Bedrooms'}
            </Typography>
          </div>
        )}
        {price > 0 && (
          <div
            className={bedroomsPrice}
            style={isMobile ? { marginLeft: 'auto' } : { marginLeft: '30px' }}
          >
            <MoneyIcon className={bedPriceIcon} />
            <Typography className={bedroomsPriceText}> {getPriceRange(price) || 0}</Typography>
          </div>
        )}
      </Grid>
    );
  };

  return (
    <Card className={root} variant="outlined">
      <Box minHeight="200px">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container justifyContent="space-between">
              <Grid item container justifyContent="space-between" className={bottomborder}>
                <Grid container item spacing={1} className={reviewHeader}>
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

                  {!isMobile && bedroomsPriceLabel()}

                  <Grid item style={{ marginLeft: 'auto' }}>
                    <Typography className={dateText}>{formattedDate}</Typography>
                  </Grid>
                </Grid>
                {isMobile && bedroomsPriceLabel()}
                <Grid item>
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                      <ReviewHeader aveRatingInfo={getRatingInfo(detailedRatings)} />
                    </CardContent>
                  </Collapse>
                </Grid>
              </Grid>

              <Grid>
                <Typography className={apartmentIndicator}>{propertyLandlordLabel()}</Typography>
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
                <Grid container>
                  <Grid item className={photoRowStyle}>
                    {photos.map((photo) => {
                      return (
                        <CardMedia
                          component="img"
                          alt="Apt image"
                          image={photo}
                          title="Apt image"
                          className={photoStyle}
                        />
                      );
                    })}
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
              onClick={() => likeHandler(id)}
              className={button}
              size="small"
              disabled={likeLoading}
            >
              Helpful {`(${likes || 0})`}
            </Button>
          </Grid>
          <Grid item>
            <Button onClick={() => reportAbuseHandler(review.id)} className={button} size="small">
              Report Abuse
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default ReviewComponent;

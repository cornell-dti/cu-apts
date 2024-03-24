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
  Link,
  Button,
} from '@material-ui/core';
import savedIcon from '../../assets/filled-saved-icon.png';
import unsavedIcon from '../../assets/unfilled-saved-icon.png';
import axios from 'axios';
import { createAuthHeaders, getUser } from '../../utils/firebase';
import { ApartmentWithId, ReviewWithId } from '../../../../common/types/db-types';
import HeartRating from '../utils/HeartRating';
import { getAverageRating } from '../../utils/average';
import { colors } from '../../colors';
import { Link as RouterLink } from 'react-router-dom';

type Props = {
  buildingData: ApartmentWithId;
  numReviews: number;
  company?: string;
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

const useStyles = makeStyles({
  root: {
    borderRadius: '10px',
  },
  redHighlight: {
    borderRadius: '10px',
    background: colors.red5,
  },
  imgStyle: {
    borderRadius: '12%',
    padding: '17px',
    width: '205px',
    height: '205px',
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
  landlordButton: {
    textTransform: 'none',
    '&.Mui-disabled': {
      color: 'inherit',
    },
  },
});

/**
 * ApartmentCard Component
 *
 * This component displays a card containing information about a specific apartment,
 * including its name, landlord, address, average rating, number of reviews, and a sample review.
 * The landlord button redirects users to the landlord page.
 * The card is responsive and adjusts its layout based on the screen size.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {ApartmentWithId} props.buildingData - The data for the apartment.
 * @param {number} props.numReviews - The number of reviews for the apartment.
 * @param {string} [props.company] - The company associated with the apartment (optional).
 * @returns {ReactElement} ApartmentCard component.
 */
const ApartmentCard = ({
  buildingData,
  numReviews,
  company,
  user,
  setUser,
}: Props): ReactElement => {
  const { id, name, photos } = buildingData;
  const saved = savedIcon;
  const unsaved = unsavedIcon;
  const img = photos.length > 0 ? photos[0] : ApartmentImg;
  const isMobile = useMediaQuery('(max-width:600px)');
  const [reviewList, setReviewList] = useState<ReviewWithId[]>([]);
  const sampleReview = reviewList.length === 0 ? '' : reviewList[0].reviewText;
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    imgStyle,
    imgMobile,
    aptNameTxt,
    marginTxt,
    root,
    redHighlight,
    reviewNum,
    textStyle,
    imgContainerMobile,
    landlordButton,
  } = useStyles();

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        if (user) {
          const token = await user.getIdToken(true);
          const response = await axios.post(
            '/api/check-saved-apartment',
            { apartmentId: id },
            createAuthHeaders(token)
          );
          setIsSaved(response.data.result);
        } else {
          setIsSaved(false);
        }
      } catch (err) {
        throw new Error('Error with checking if apartment is saved');
      }
    };
    checkIfSaved();
  }, [user, setUser, id]);

  const handleSaveToggle = async (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const newIsSaved = !isSaved;
    try {
      if (!user) {
        let user = await getUser(true);
        setUser(user);
      }
      if (!user) {
        throw new Error('Failed to login');
      }
      const token = await user.getIdToken(true);
      const endpoint = newIsSaved ? '/api/add-saved-apartment' : '/api/remove-saved-apartment';
      await axios.post(endpoint, { apartmentId: id }, createAuthHeaders(token));
      setIsSaved((prevIsSaved) => !prevIsSaved);
    } catch (err) {
      throw new Error(newIsSaved ? 'Error with saving apartment' : 'Error with unsaving apartment');
    }
  };

  useEffect(() => {
    // Fetches approved reviews for the current apartment.
    get<ReviewWithId[]>(`/api/review/aptId/${id}/APPROVED`, {
      callback: setReviewList,
    });
  }, [id]);

  //  Function which returns the apartment's "Landlord: " label
  const landlordLabel = () => {
    return (
      <Grid item style={{ width: '285px', display: 'flex' }}>
        <Link
          {...{
            to: `/landlord/${buildingData.landlordId}`,
            style: { textDecoration: 'none', display: 'inline-block', width: '100%' },
            component: RouterLink,
          }}
        >
          <Button
            className={landlordButton}
            size="small"
            onMouseEnter={() => setIsHovered(false)}
            onMouseLeave={() => setIsHovered(true)}
          >
            <Typography
              variant="subtitle1"
              className={aptNameTxt}
              style={{ fontSize: isMobile ? '15px' : '20px', marginRight: '6px' }}
            >
              Landlord:
            </Typography>

            <Typography variant="subtitle1" style={{ fontSize: isMobile ? '15px' : '20px' }}>
              {company && company.length > 14 ? `${company.slice(0, 14)}...` : company}
            </Typography>
          </Button>
        </Link>
      </Grid>
    );
  };

  return (
    <Card
      className={isHovered ? redHighlight : root}
      variant="outlined"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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

              {!isMobile && landlordLabel()}

              {/* Add saved and unsaved icons on the right side */}
              <Grid item>
                <IconButton
                  disableRipple
                  onClick={handleSaveToggle}
                  style={{
                    padding: isMobile ? 10 : 30,
                    paddingLeft: 10,
                    marginLeft: 'auto', // This pushes the icon to the right
                    backgroundColor: 'transparent',
                  }}
                >
                  <img
                    src={isSaved ? saved : unsaved}
                    alt={isSaved ? 'Saved' : 'Unsaved'}
                    style={{ width: '25.2', height: '32.4px' }}
                  />
                </IconButton>
              </Grid>

              {isMobile && landlordLabel()}

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

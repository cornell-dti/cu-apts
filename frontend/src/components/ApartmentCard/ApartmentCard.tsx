import React, { ReactElement, useState, useEffect } from 'react';
import { get } from '../../utils/call';
import ApartmentImg from '../../assets/apartment-placeholder.svg';
import {
  Card,
  CardMedia,
  Grid,
  makeStyles,
  Typography,
  useMediaQuery,
  IconButton,
  Link,
  Button,
} from '@material-ui/core';
import savedIcon from '../../assets/saved-icon-filled.svg';
import unsavedIcon from '../../assets/saved-icon-unfilled.svg';
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
  avgRating: number;
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
  aptNameTxt: {
    fontWeight: 800,
  },
  reviewNum: {
    fontWeight: 700,
    marginLeft: '10px',
    fontSize: '18px',
  },
  textStyle: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  landlordButton: {
    textTransform: 'none',
    '&.Mui-disabled': {
      color: 'inherit',
    },
  },
  saveRibbonIcon: {
    width: '34px',
    height: '24px',
    objectPosition: 'center',
    objectFit: 'cover',
    transition: 'scale 0.2s',
    '&:hover': {
      backgroundColor: 'transparent',
      scale: '0.9',
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
 * @param {number} props.avgRating - The average rating for the apartment.
 * @param {string} [props.company] - The company associated with the apartment (optional).
 * @returns {ReactElement} ApartmentCard component.
 */
const ApartmentCard = ({
  buildingData,
  numReviews,
  avgRating,
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
  const sampleReview =
    reviewList.length === 0
      ? ''
      : reviewList.sort((a, b) => {
          return (b.likes ?? 0) - (a.likes ?? 0);
        })[0].reviewText;
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [savedIsHovered, setSavedIsHovered] = useState(false);

  const { aptNameTxt, root, redHighlight, reviewNum, textStyle, landlordButton, saveRibbonIcon } =
    useStyles();

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
      <Grid item style={{ display: 'flex' }}>
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
      <Grid
        container
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        style={{ padding: '1.5rem' }}
        spacing={2}
      >
        {/* Left Grid Element (Image) */}
        <Grid item xs={isMobile ? 12 : true}>
          <CardMedia
            image={img}
            component="img"
            title={name}
            style={{
              aspectRatio: isMobile ? '2' : '1',
              objectFit: 'cover',
              objectPosition: 'center',
              borderRadius: '6px',
            }}
          />
        </Grid>
        {/* Right Grid Elements (Title, Text, Etc...) */}
        <Grid item xs={isMobile ? 12 : 9} container direction="column">
          {/* First Row Elements (Title, Subtitle, Landlord Button, Save Ribbon) */}
          <Grid item container direction="row" justifyContent="space-between">
            {/* Title and Subtitle in a Column */}
            <Grid item direction="column" alignItems="stretch" xs={isMobile ? 'auto' : true}>
              {/* Title Element */}
              <Grid item>
                <Typography
                  variant="h5"
                  className={aptNameTxt}
                  style={{
                    fontSize: isMobile ? '18px' : '29px',
                    fontWeight: 700,
                    lineHeight: isMobile ? 'normal' : '36px',
                  }}
                >
                  {name}
                </Typography>
              </Grid>
              {/* Subtitle Element */}
              {company && (
                <Grid item>
                  <Typography
                    style={{
                      fontSize: isMobile ? '10px' : '20px',
                      fontWeight: 400,
                      lineHeight: isMobile ? 'normal' : '32px',
                    }}
                  >
                    {buildingData.address}
                  </Typography>
                </Grid>
              )}
            </Grid>
            {/* Landlord Button and Save Ribbon in a Row*/}
            {!isMobile && (
              <Grid item>
                <Grid container direction="row" alignItems="center">
                  {landlordLabel()}

                  {/* Add saved and unsaved icons on the right side */}
                  <Grid item>
                    <IconButton
                      disableRipple
                      onClick={handleSaveToggle}
                      onMouseEnter={() => setSavedIsHovered(true)}
                      onMouseLeave={() => setSavedIsHovered(false)}
                      className={saveRibbonIcon}
                    >
                      <img
                        src={savedIsHovered || isSaved ? saved : unsaved}
                        alt={isSaved ? 'Saved' : 'Unsaved'}
                      />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            )}
            {/* Mobile Version of Rating (inline with title and subtitle on mobile) */}
            {isMobile && (
              <Grid
                item
                xs={true}
                container
                direction="row"
                alignItems="flex-start"
                justifyContent={'flex-end'}
                style={{ paddingTop: '4px' }}
              >
                <HeartRating
                  value={getAverageRating(reviewList)}
                  precision={0.5}
                  readOnly
                  fontSize={'12px'}
                />
                <Typography
                  variant="h6"
                  className={reviewNum}
                  style={{ fontSize: '10px', lineHeight: 'normal' }}
                >
                  {numReviews + (numReviews !== 1 ? ' Reviews' : ' Review')}
                </Typography>
              </Grid>
            )}
          </Grid>
          {/* Desktop Version of Rating (below title and subtitle on desktop) */}
          {!isMobile && (
            <Grid
              item
              xs={12}
              container
              direction="row"
              alignItems="flex-start"
              justifyContent={'flex-start'}
              style={{ paddingTop: '10px' }}
            >
              <HeartRating
                value={getAverageRating(reviewList)}
                precision={0.5}
                readOnly
                size="medium"
              />
              <Typography
                variant="h6"
                className={reviewNum}
                style={{ fontSize: isMobile ? '10px' : '18px', lineHeight: 'normal' }}
              >
                {numReviews + (numReviews !== 1 ? ' Reviews' : ' Review')}
              </Typography>
              {/* TODO: TESTING!! */}
              <Typography
                variant="h6"
                className={reviewNum}
                style={{ fontSize: '10px', lineHeight: 'normal' }}
              >
                {`Area: ${buildingData.area}`}
              </Typography>
              <Typography
                variant="h6"
                className={reviewNum}
                style={{ fontSize: '10px', lineHeight: 'normal' }}
              >
                {`Rating: ${avgRating.toFixed(1)}`}
              </Typography>
              <Typography
                variant="h6"
                className={reviewNum}
                style={{ fontSize: '10px', lineHeight: 'normal' }}
              >
                {`Beds: ${buildingData.numBeds}`}
              </Typography>
              <Typography
                variant="h6"
                className={reviewNum}
                style={{ fontSize: '10px', lineHeight: 'normal' }}
              >
                {`Baths: ${buildingData.numBaths}`}
              </Typography>
              <Typography
                variant="h6"
                className={reviewNum}
                style={{ fontSize: '10px', lineHeight: 'normal' }}
              >
                {`Price: ${buildingData.price}`}
              </Typography>
            </Grid>
          )}
          {/* Sample Review */}
          {!isMobile && (
            <Grid item alignItems="center">
              <Typography
                style={{
                  fontSize: '18.25px',
                  fontWeight: 400,
                  lineHeight: '32px',
                  paddingTop: '20px',
                }}
                className={textStyle}
              >
                {sampleReview}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Card>
  );
};

export default ApartmentCard;

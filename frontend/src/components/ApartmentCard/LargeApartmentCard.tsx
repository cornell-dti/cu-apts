import React, { ReactElement, useState, useEffect } from 'react';
import { get } from '../../utils/call';
import ApartmentImg from '../../assets/apartment-placeholder.svg';
import verticalLine from '../../assets/vertical-line.svg';
import {
  Card,
  CardMedia,
  makeStyles,
  Typography,
  useMediaQuery,
  IconButton,
} from '@material-ui/core';
import savedIcon from '../../assets/apartment-card-saved-icon-filled.svg';
import unsavedIcon from '../../assets/apartment-card-saved-icon-unfilled.svg';
import bedIcon from '../../assets/apartment-card-bedroom-icon.svg';
import moneyIcon from '../../assets/apartment-card-money-icon.svg';
import axios from 'axios';
import { createAuthHeaders, getUser } from '../../utils/firebase';
import { ApartmentWithId, DetailedRating, ReviewWithId } from '../../../../common/types/db-types';
import { colors } from '../../colors';
import HeartRating from '../utils/HeartRating';
import ReviewHeader from '../Review/ReviewHeader';
import { RatingInfo } from '../../pages/ApartmentPage';

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
    borderRadius: '14px',
    padding: '22px',
    width: '924px',
    aspectRatio: '5/2',
    border: '0.72px solid #E8E8E8',
    boxSizing: 'border-box',
  },
  redHighlight: {
    borderRadius: '14px',
    background: colors.red5,
    padding: '22px',
    width: '924px',
    aspectRatio: '5/2',
    border: '0.72px solid #E8E8E8',
    boxSizing: 'border-box',
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    alignItems: 'center',
    height: '100%',
  },
  apartmentImageContainer: {
    height: '100%',
    aspectRatio: '100/67',
    objectFit: 'cover',
    borderRadius: '11px',
    position: 'relative',
  },
  apartmentImage: {
    width: '100%',
    aspectRatio: '100/67',
    borderRadius: '11px',
    objectFit: 'cover',
  },
  saveRibbonIcon: {
    width: '34px',
    height: '24px',
    objectPosition: 'center',
    objectFit: 'cover',
    transition: 'scale 0.2s',
    '&:hover': {
      backgroundColor: 'transparent',
      scale: '1.05',
    },
  },
  apartmentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    alignItems: 'center',
    height: '100%',
    width: '50%',
    justifyContent: 'flex-start',
  },
  apartmentBackground: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '10px',
    width: '100%',
  },
  apartmentStatsContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-start',
  },
  verticalLine: {
    width: '4px',
    height: '100%',
  },
  sampleReviewContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    width: '100%',
    height: '100%',
    paddingTop: '8px',
    alignItems: 'center',
  },
  apartmentTitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '-2px',
  },
  apartmentName: {
    fontSize: '20px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '25.806px',
  },
  apartmentAddress: {
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '22.939px',
  },
  apartmentLocationTag: {
    borderRadius: '12.186px',
    background: '#FFCFC7',
    padding: '3px 8px',
    width: 'fit-content',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '20.071px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apartmentRatingContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '8px',
    width: '50%',
    alignItems: 'center',
  },
  apartmentReviewsCount: {
    fontSize: '15.77px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '22.939px',
  },
  apartmentStatsTitle: {
    fontSize: '13px',
    fontWeight: 'normal',
  },
  sampleReviewText: {
    fontSize: '11.677px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '17.515px',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '90%',
  },
});

/**
 * NewApartmentCard Component
 *
 * This component displays a card containing information about a specific apartment,
 * including its name, landlord, address, average rating, number of reviews, and a sample review.
 * The landlord button redirects users to the landlord page.
 * The card is responsive and adjusts its layout based on the screen size.
 * Users can save/unsave apartments if they are logged in.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {ApartmentWithId} props.buildingData - The data for the apartment.
 * @param {number} props.numReviews - The number of reviews for the apartment.
 * @param {number} props.avgRating - The average rating for the apartment.
 * @param {string} [props.company] - The company associated with the apartment (optional).
 * @param {firebase.User | null} props.user - The currently logged in Firebase user.
 * @param {React.Dispatch<React.SetStateAction<firebase.User | null>>} props.setUser - Function to update the user state.
 * @returns {ReactElement} NewApartmentCard component.
 */
const NewApartmentCard = ({
  buildingData,
  numReviews,
  avgRating,
  company,
  user,
  setUser,
}: Props): ReactElement => {
  const { id, name, photos, address, area } = buildingData;
  const saved = savedIcon;
  const unsaved = unsavedIcon;
  const img = photos.length > 0 ? photos[0] : ApartmentImg;
  const isMobile = useMediaQuery('(max-width:600px)');
  const [reviewList, setReviewList] = useState<ReviewWithId[]>([]);
  const [aveRatingInfo, setAveRatingInfo] = useState<RatingInfo[]>([]);
  const sampleReview = reviewList.length === 0 ? '' : reviewList[0].reviewText;
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [savedIsHovered, setSavedIsHovered] = useState(false);

  const {
    root,
    redHighlight,
    cardContainer,
    apartmentImageContainer,
    apartmentImage,
    saveRibbonIcon,
    apartmentInfo,
    apartmentBackground,
    apartmentStatsContainer,
    sampleReviewContainer,
    apartmentTitleContainer,
    apartmentName,
    apartmentAddress,
    apartmentLocationTag,
    apartmentRatingContainer,
    apartmentReviewsCount,
    apartmentStatsTitle,
    sampleReviewText,
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

  const calculateAveRating = (reviews: ReviewWithId[]): RatingInfo[] => {
    const features = ['location', 'maintenance', 'safety', 'conditions'];
    return features.map((feature) => {
      let key = feature as keyof DetailedRating;
      let rating =
        reviews.reduce((sum, review) => sum + review.detailedRatings[key], 0) / reviews.length;

      return { feature, rating };
    });
  };

  // Set the average rating after calculating it from the data.
  useEffect(() => {
    setAveRatingInfo(calculateAveRating(reviewList));
  }, [reviewList]);

  return (
    <Card
      className={isHovered ? redHighlight : root}
      variant="outlined"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cardContainer}>
        <CardMedia className={apartmentImageContainer}>
          <img src={img} alt="apartment" className={apartmentImage} />
        </CardMedia>
        <div className={apartmentInfo}>
          <div className={apartmentBackground}>
            <div className={apartmentTitleContainer}>
              <Typography className={apartmentName}>{name}</Typography>
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
            </div>
            <Typography className={apartmentAddress}>{address}</Typography>
            <div className={apartmentLocationTag}>
              {area.charAt(0) + area.slice(1).toLowerCase()}
            </div>
            <div className={apartmentRatingContainer}>
              <HeartRating value={avgRating} precision={0.5} readOnly fontSize={'18.5px'} />
              <Typography className={apartmentReviewsCount}>{numReviews} reviews</Typography>
            </div>
          </div>
          <div className={apartmentStatsContainer}>
            <ReviewHeader aveRatingInfo={aveRatingInfo} isAptCard={true} />
          </div>
          <div className={sampleReviewContainer}>
            <img src={verticalLine} alt="vertical line" style={{ width: '4px', height: '80%' }} />
            <Typography className={sampleReviewText}>{sampleReview}</Typography>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NewApartmentCard;

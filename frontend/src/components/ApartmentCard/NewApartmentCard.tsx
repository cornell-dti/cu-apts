import React, { ReactElement, useState, useEffect } from 'react';
import { get } from '../../utils/call';
import ApartmentImg from '../../assets/apartment-placeholder.svg';
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
import { ApartmentWithId } from '../../../../common/types/db-types';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { colors } from '../../colors';

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
    padding: '12px',
    width: '264px',
    aspectRatio: '39/50',
    border: '0.72px solid #E8E8E8',
    boxSizing: 'border-box',
  },
  redHighlight: {
    borderRadius: '10px',
    background: colors.red5,
    padding: '12px',
    width: '264px',
    aspectRatio: '39/50',
    border: '0.72px solid #E8E8E8',
    boxSizing: 'border-box',
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
    height: '100%',
  },
  apartmentImageContainer: {
    width: '100%',
    aspectRatio: '5/4',
    objectFit: 'cover',
    borderRadius: '10px',
    position: 'relative',
  },
  apartmentImage: {
    width: '100%',
    aspectRatio: '5/4',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  saveRibbonIcon: {
    width: '34px',
    height: '24px',
    position: 'absolute',
    top: '12px',
    right: '12px',
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
    gap: '16px',
    width: '90%',
    justifyContent: 'space-between',
  },
  apartmentBackground: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '12px',
  },
  apartmentText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  apartmentRatingSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'right',
    gap: '4px',
    width: '21%',
    height: '30%',
  },
  apartmentRatingIcon: {
    color: colors.red2,
    height: '19px',
    width: '19px',
  },
  apartmentRating: {
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '25px',
  },
  apartmentName: {
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 600,
    height: '18px',
  },
  apartmentAddress: {
    color: colors.gray1,
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    height: '14px',
  },
  apartmentReviews: {
    color: colors.gray1,
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    height: '14px',
  },
  apartmentStats: {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    height: '20%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  apartmentMoneyIcon: {
    width: '22px',
    height: '22px',
  },
  apartmentBedIcon: {
    width: '23px',
    height: '23px',
  },
  apartmentStatsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
  },
  apartmentStatsText: {
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 600,
  },
});

/**
 * NewApartmentCard Component
 *
 * This component displays a card containing information about a specific apartment,
 * including its name, address, average rating, number of reviews, number of bedrooms,
 * and distance to campus. Users can save/unsave apartments if they are logged in.
 * The card is responsive and adjusts its layout based on the screen size.
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
  const { id, name, photos, address, numBeds = 0, distanceToCampus = 0 } = buildingData;
  const saved = savedIcon;
  const unsaved = unsavedIcon;
  const img = photos.length > 0 ? photos[0] : ApartmentImg;
  const isMobile = useMediaQuery('(max-width:600px)');
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
    apartmentText,
    apartmentRatingSection,
    apartmentRatingIcon,
    apartmentRating,
    apartmentName,
    apartmentAddress,
    apartmentReviews,
    apartmentStats,
    apartmentMoneyIcon,
    apartmentBedIcon,
    apartmentStatsContainer,
    apartmentStatsText,
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

  return (
    <Card
      className={isHovered ? redHighlight : root}
      variant="outlined"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cardContainer}>
        <CardMedia className={apartmentImageContainer}>
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
          <img src={img} alt="apartment" className={apartmentImage} />
        </CardMedia>
        <div className={apartmentInfo}>
          <div className={apartmentBackground}>
            <div className={apartmentText}>
              {/* <Typography>{distanceToCampus} miles away</Typography> */}
              <Typography
                className={apartmentName}
                style={{ fontSize: name.length > 19 ? '13px' : '14px' }}
              >
                {name.slice(0, 20) + (name.length > 20 ? '...' : '')}
              </Typography>
              <Typography
                className={apartmentAddress}
                style={{ fontSize: name.length > 19 ? '12.5px' : '14px' }}
              >
                {address}
              </Typography>
              <Typography className={apartmentReviews}>
                {numReviews} {numReviews === 1 ? 'review' : 'reviews'}
              </Typography>
            </div>
            <div className={apartmentRatingSection}>
              <FavoriteIcon fontSize="default" className={apartmentRatingIcon} />
              <Typography className={apartmentRating}>{avgRating.toFixed(1)}</Typography>
            </div>
          </div>
          <div className={apartmentStats}>
            <div className={apartmentStatsContainer}>
              <img src={moneyIcon} alt="money" className={apartmentMoneyIcon} />
              <Typography className={apartmentStatsText}>$2K - $3K</Typography>
            </div>
            <div className={apartmentStatsContainer}>
              <img src={bedIcon} alt="bed" className={apartmentBedIcon} />
              <Typography className={apartmentStatsText}>
                {numBeds ? `${numBeds - 1}-${numBeds + 1}` : '0'} bed
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NewApartmentCard;

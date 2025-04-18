import React, { ReactElement, useEffect, useState } from 'react';
import ApartmentCard from './ApartmentCard';
import NewApartmentCard from './NewApartmentCard';
import { Grid, Link, makeStyles, Button, Box, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { CardData } from '../../App';
import { loadingLength } from '../../constants/HomeConsts';
import { ApartmentWithId } from '../../../../common/types/db-types';
import { sortApartments } from '../../utils/sortApartments';
import LargeApartmentCard from './LargeApartmentCard';

type Props = {
  data: CardData[];
  initialResultsToShow?: number;
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
  onMoreResultsLoaded?: (results: number) => void;
  sortMethod?: keyof CardData | keyof ApartmentWithId | 'originalOrder';
  orderLowToHigh?: boolean;
  title: string;
  cardSize?: 'small' | 'large';
};

const useStyles = makeStyles({
  container: {
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    // border: `1px solid black`,
    marginBottom: '16px',
  },
  titleText: {
    fontSize: '24px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 'normal',
    letterSpacing: '0.48px',
  },
  viewMoreButton: {
    textTransform: 'none',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '28px',
  },
  cardsContainer: {
    display: 'flex',
    overflowX: 'auto',
    scrollbarWidth: 'none', // Firefox
    '&::-webkit-scrollbar': {
      // Chrome, Safari, Edge
      display: 'none',
    },
    '-ms-overflow-style': 'none', // IE
    gap: '20px',
    padding: '4px',
    // border: `1px solid black`,
  },
});

/**
 * HomePageApartmentCards Component
 *
 * @remarks
 * This component displays a horizontal scrollable list of apartment cards on the homepage.
 * It includes a header with a title and "View More" button, followed by a row of cards
 * that can be scrolled horizontally. The cards maintain a fixed width and spacing.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {CardData[]} props.data - Array of apartment data to display in cards.
 * @param {number} [props.initialResultsToShow] - Initial number of cards to display.
 * @param {firebase.User | null} props.user - The currently logged in Firebase user.
 * @param {React.Dispatch<React.SetStateAction<firebase.User | null>>} props.setUser - Function to update the user state.
 * @param {(results: number) => void} [props.onMoreResultsLoaded] - Callback when more results are loaded.
 * @param {keyof CardData | keyof ApartmentWithId | 'originalOrder'} [props.sortMethod='originalOrder'] - How to sort the apartment cards.
 * @param {boolean} [props.orderLowToHigh=false] - Sort direction - true for ascending, false for descending.
 * @param {string} props.title - Title text displayed above the card list.
 * @param {'small' | 'large'} [props.cardSize='small'] - Size variant for the apartment cards.
 * @returns {ReactElement} HomePageApartmentCards component.
 */
const ApartmentCards = ({
  data,
  initialResultsToShow,
  user,
  onMoreResultsLoaded,
  setUser,
  sortMethod = 'originalOrder',
  orderLowToHigh = false,
  title,
  cardSize = 'small',
}: Props): ReactElement => {
  const { container, header, titleText, viewMoreButton, cardsContainer } = useStyles();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Handle resizing of the window depending on mobile and if it is clicked.
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (onMoreResultsLoaded) {
      onMoreResultsLoaded(initialResultsToShow ?? loadingLength);
    }
  }, [initialResultsToShow, onMoreResultsLoaded]);

  return (
    <div className={container}>
      <div className={header}>
        <Typography className={titleText}>{title}</Typography>
        <Button className={viewMoreButton}>View More</Button>
      </div>
      <div className={cardsContainer}>
        {data &&
          sortApartments(data, sortMethod, orderLowToHigh).map(
            ({ buildingData, numReviews, company, avgRating }, index) => {
              const { id } = buildingData;
              return (
                <>
                  <div key={index}>
                    <Link
                      {...{
                        to: `/apartment/${id}`,
                        style: { textDecoration: 'none' },
                        component: RouterLink,
                      }}
                    >
                      {cardSize === 'small' ? (
                        <NewApartmentCard
                          key={index}
                          numReviews={numReviews}
                          avgRating={avgRating ?? 0}
                          buildingData={buildingData}
                          company={company}
                          user={user}
                          setUser={setUser}
                        />
                      ) : (
                        <LargeApartmentCard
                          key={index}
                          numReviews={numReviews}
                          avgRating={avgRating ?? 0}
                          buildingData={buildingData}
                          company={company}
                          user={user}
                          setUser={setUser}
                        />
                      )}
                    </Link>
                  </div>
                </>
              );
            }
          )}
      </div>
    </div>
  );
};

export default ApartmentCards;

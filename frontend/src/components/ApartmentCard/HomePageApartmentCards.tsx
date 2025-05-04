import React, { ReactElement, useEffect, useState, useRef } from 'react';
import ApartmentCard from './ApartmentCard';
import NewApartmentCard from './NewApartmentCard';
import { Grid, Link, makeStyles, Button, Box, Typography, IconButton } from '@material-ui/core';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { CardData } from '../../App';
import { ApartmentWithId } from '../../../../common/types/db-types';
import { sortApartments } from '../../utils/sortApartments';
import LargeApartmentCard from './LargeApartmentCard';
import { defaultFilters, FilterState } from '../Search/FilterSection';
import Arrows from '../../assets/apartment-cards-arrow.svg';

type Props = {
  data: CardData[];
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
    '&:hover .scrollButton': {
      opacity: 1,
    },
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
    scrollBehavior: 'smooth',
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
  scrollButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1,
    backgroundColor: 'transparent',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    padding: '0px',
    width: '50px',
    height: '50px',
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '&.hidden': {
      display: 'none',
    },
    '&.MuiIconButton-root': {
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },
  leftButton: {
    left: -20,
  },
  rightButton: {
    right: -20,
  },
  arrowIcon: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
    '&:hover': {
      opacity: 1,
    },
    transition: 'opacity 0.2s ease',
  },
  leftArrow: {
    transform: 'rotate(180deg)',
  },
});

/**
 * HomePageApartmentCards Component
 *
 * @remarks
 * This component displays a horizontal scrollable list of apartment cards on the homepage.
 * It includes a header with a title and "View More" button, followed by a row of cards
 * that can be scrolled horizontally using arrow buttons. The cards maintain a fixed width
 * and spacing. Scroll arrows appear/disappear based on scroll position.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {CardData[]} props.data - Array of apartment data to display in cards.
 * @param {firebase.User | null} props.user - The currently logged in Firebase user.
 * @param {React.Dispatch<React.SetStateAction<firebase.User | null>>} props.setUser - Function to update the user state.
 * @param {(results: number) => void} [props.onMoreResultsLoaded] - Callback when more results are loaded.
 * @param {keyof CardData | keyof ApartmentWithId | 'originalOrder'} [props.sortMethod='originalOrder'] - How to sort the apartment cards.
 * @param {boolean} [props.orderLowToHigh=false] - Sort direction - true for ascending, false for descending.
 * @param {string} props.title - Title text displayed above the card list.
 * @param {'small' | 'large'} [props.cardSize='small'] - Size variant for the apartment cards.
 * @returns {ReactElement} HomePageApartmentCards component with horizontally scrollable cards and navigation arrows.
 */
const ApartmentCards = ({
  data,
  user,
  onMoreResultsLoaded,
  setUser,
  sortMethod = 'originalOrder',
  orderLowToHigh = false,
  title,
  cardSize = 'small',
}: Props): ReactElement => {
  const classes = useStyles();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(true);
  const history = useHistory();
  const containerRef = useRef<HTMLDivElement>(null);

  const checkScrollPosition = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      // Show left arrow if we're not at the start
      setShowLeftArrow(container.scrollLeft > 0);
      // Show right arrow if we haven't scrolled to the end
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
    };
  }, []);

  // Recheck arrows when data changes
  useEffect(() => {
    checkScrollPosition();
  }, [data]);

  const scrollCards = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const container = containerRef.current;
      const cardWidth = container.firstElementChild?.clientWidth || 0;
      const scrollAmount = direction === 'left' ? -cardWidth - 20 : cardWidth + 20; // 20 is the gap
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Handle resizing of the window depending on mobile and if it is clicked.
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleViewMoreClick = (
    sortMethod: keyof CardData | keyof ApartmentWithId | 'originalOrder',
    orderLowToHigh: boolean
  ) => {
    const query = '';
    // Create a new filter object instead of using defaultFilters directly
    const filters: FilterState = {
      ...defaultFilters,
      initialSortBy: sortMethod,
      initialSortLowToHigh: orderLowToHigh,
    };
    console.log('apartment cards starting with ', sortMethod, orderLowToHigh);
    const filterParams = encodeURIComponent(JSON.stringify(filters));

    history.push(`/search?q=${query}&filters=${filterParams}`);
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Typography className={classes.titleText}>{title}</Typography>
        <Button
          className={classes.viewMoreButton}
          disableRipple
          onClick={() => handleViewMoreClick(sortMethod, orderLowToHigh)}
        >
          View More
        </Button>
      </div>
      <IconButton
        className={`${classes.scrollButton} ${classes.leftButton} scrollButton ${
          !showLeftArrow ? 'hidden' : ''
        }`}
        onClick={() => scrollCards('left')}
        disableRipple
      >
        <img src={Arrows} alt="Previous" className={`${classes.arrowIcon} ${classes.leftArrow}`} />
      </IconButton>
      <IconButton
        className={`${classes.scrollButton} ${classes.rightButton} scrollButton ${
          !showRightArrow ? 'hidden' : ''
        }`}
        onClick={() => scrollCards('right')}
        disableRipple
      >
        <img src={Arrows} alt="Next" className={classes.arrowIcon} />
      </IconButton>
      <div className={classes.cardsContainer} ref={containerRef}>
        {data &&
          sortApartments(data, sortMethod, orderLowToHigh).map(
            ({ buildingData, numReviews, company, avgRating }, index) => {
              const { id } = buildingData;
              return (
                <div key={id}>
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
              );
            }
          )}
      </div>
    </div>
  );
};

export default ApartmentCards;

import React, { ReactElement, useEffect, useState } from 'react';
import ApartmentCard from './ApartmentCard';
import { Grid, Link, makeStyles, Button } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { CardData } from '../../App';
import { loadingLength } from '../../constants/HomeConsts';
import { ApartmentWithId } from '../../../../common/types/db-types';
import { sortApartments } from '../../utils/sortApartments';
import DropDownWithLabel from '../utils/DropDownWithLabel';

type Props = {
  data: CardData[];
  initialResultsToShow?: number;
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
  onMoreResultsLoaded?: (results: number) => void;
};

const useStyles = makeStyles({
  boundingBox: {
    marginTop: '0.2em',
    marginBottom: '2em',
  },
  showMoreButton: {
    border: '1px solid #A3A3A3',
    borderRadius: '9px',
    color: '#000000B2',
    width: '10em',
    textTransform: 'initial',
  },
  horizontalLine: {
    borderTop: '1px solid #C4C4C4',
    width: '95%',
    margin: '16px auto',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: 'none',
  },
});

/**
 * ApartmentCards Component
 *
 * @remarks
 * This component displays ApartmentCard components of the data.
 * It also shows a 'Show more' button if there is more data than the loadingLength constant.
 * It also has a dropdown to sort the apartments based on different properties, such as price and rating.
 * The component is responsive and adjusts its layout based on the screen size.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {CardData[]} props.data - The data of apartments.
 * @param {number} [props.initialResultsToShow] - Initial number of results to show.
 * @param {firebase.User | null} props.user - The current user.
 * @param {React.Dispatch<React.SetStateAction<firebase.User | null>>} props.setUser - Function to set the current user.
 * @param {(results: number) => void} [props.onMoreResultsLoaded] - Callback function when more results are loaded.
 * @returns {ReactElement} ApartmentCards component.
 */
const ApartmentCards = ({
  data,
  initialResultsToShow,
  user,
  onMoreResultsLoaded,
  setUser,
}: Props): ReactElement => {
  const { boundingBox, showMoreButton, horizontalLine } = useStyles();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [resultsToShow, setResultsToShow] = useState<number>(initialResultsToShow ?? loadingLength);

  const handleShowMore = () => {
    setResultsToShow(resultsToShow + loadingLength);
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

  useEffect(() => {
    if (onMoreResultsLoaded) {
      onMoreResultsLoaded(resultsToShow);
    }
  }, [resultsToShow, onMoreResultsLoaded]);

  type Fields = keyof CardData | keyof ApartmentWithId | 'originalOrder';
  const [sortBy, setSortBy] = useState<Fields>('originalOrder');
  const [orderLowToHigh, setOrderLowToHigh] = useState<boolean>(false);

  return (
    <>
      <Grid item style={{ marginRight: '8px' }}>
        <DropDownWithLabel
          label="Sort by"
          menuItems={[
            {
              item: 'Recommended',
              callback: () => {
                setSortBy('originalOrder');
                setOrderLowToHigh(false);
              },
            },
            {
              item: 'Lowest Price',
              callback: () => {
                setSortBy('avgPrice');
                setOrderLowToHigh(true);
              },
            },
            {
              item: 'Highest Price',
              callback: () => {
                setSortBy('avgPrice');
                setOrderLowToHigh(false);
              },
            },
            {
              item: 'Lowest Rating',
              callback: () => {
                setSortBy('avgRating');
                setOrderLowToHigh(true);
              },
            },
            {
              item: 'Highest Rating',
              callback: () => {
                setSortBy('avgRating');
                setOrderLowToHigh(false);
              },
            },
            {
              item: 'Most Loved',
              callback: () => {
                setSortBy('avgRating');
                setOrderLowToHigh(false);
              },
            },
            {
              item: 'Most Reviewed',
              callback: () => {
                setSortBy('numReviews');
                setOrderLowToHigh(false);
              },
            },
          ]}
          isMobile={isMobile}
        />
      </Grid>
      <Grid container spacing={3} className={boundingBox}>
        {data &&
          sortApartments(data, sortBy, orderLowToHigh)
            .slice(0, Math.min(3, resultsToShow))
            .map(({ buildingData, numReviews, company, avgRating }, index) => {
              const { id } = buildingData;
              return (
                <Grid item md={4} key={index}>
                  <Link
                    {...{
                      to: `/apartment/${id}`,
                      style: { textDecoration: 'none' },
                      component: RouterLink,
                    }}
                  >
                    <ApartmentCard
                      key={index}
                      numReviews={numReviews}
                      avgRating={avgRating ?? 0}
                      buildingData={buildingData}
                      company={company}
                      user={user}
                      setUser={setUser}
                    />
                  </Link>
                </Grid>
              );
            })}

        {data && data.length > 3 && resultsToShow > 3 && (
          <>
            <Grid item xs={12}>
              <hr className={horizontalLine} />
            </Grid>
            <Grid item xs={12} container justifyContent="center">
              <Button className={showMoreButton} onClick={handleShowMore}>
                Show more
              </Button>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default ApartmentCards;

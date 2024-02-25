import React, { ReactElement, useState } from 'react';
import ApartmentCard from './ApartmentCard';
import { Grid, Link, makeStyles, Button, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { CardData } from '../../App';
import { loadingLength } from '../../constants/HomeConsts';
import DropDown from '../utils/DropDown';
import { ApartmentWithId } from '../../../../common/types/db-types';
import { sortApartments } from '../../utils/sortApartments';

type Props = {
  data: CardData[];
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
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
  sortByButton: {
    background: '#E8E8E8',
    border: 'none',
    borderRadius: '10px',
    paddingRight: '5px',
    paddingLeft: '5px',
  },
});

/**
 * ApartmentCards Component
 *
 * This component displays ApartmentCard components of the data. It also shows
 * a 'Show more' button if there is more data than the loadingLength constant.
 * The component is responsive and adjusts its layout based on the screen size.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {CardData[]} props.data - The data of apartments.
 * @returns {ReactElement} ApartmentCards component.
 */
const ApartmentCards = ({ data, user, setUser }: Props): ReactElement => {
  const { boundingBox, showMoreButton, horizontalLine, sortByButton } = useStyles();

  const [resultsToShow, setResultsToShow] = useState<number>(loadingLength);

  const handleShowMore = () => {
    setResultsToShow(resultsToShow + loadingLength);
  };

  type Fields = keyof CardData | keyof ApartmentWithId | 'originalOrder';
  const [sortBy, setSortBy] = useState<Fields>('originalOrder');
  const [orderLowToHigh, setOrderLowToHigh] = useState<boolean>(false);

  return (
    <>
      <Grid item style={{ marginRight: '8px' }}>
        <Grid container spacing={1} direction="row" alignItems="center" justifyContent="flex-end">
          <Grid item>
            <Typography style={{ fontSize: '15px' }}>Sort by:</Typography>
          </Grid>
          <Grid item className={sortByButton}>
            <DropDown
              menuItems={[
                {
                  item: 'Relevance',
                  callback: () => {
                    setSortBy('originalOrder');
                  },
                },
                {
                  item: 'Date Added',
                  callback: () => {
                    setSortBy('id');
                  },
                },
                {
                  item: 'Name',
                  callback: () => {
                    setSortBy('name');
                  },
                },
                {
                  item: 'Address',
                  callback: () => {
                    setSortBy('address');
                  },
                },
                {
                  item: 'LandlordID',
                  callback: () => {
                    setSortBy('landlordId');
                  },
                },
                {
                  item: 'Avg Price',
                  callback: () => {
                    setSortBy('avgPrice');
                  },
                },
                {
                  item: 'Avg Rating',
                  callback: () => {
                    setSortBy('avgRating');
                  },
                },
              ]}
            />
          </Grid>
          <Grid item className={sortByButton}>
            <DropDown
              menuItems={[
                {
                  item: '⬇ High To Low',
                  callback: () => {
                    setOrderLowToHigh(false);
                  },
                },
                {
                  item: '⬆ Low to High',
                  callback: () => {
                    setOrderLowToHigh(true);
                  },
                },
              ]}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={3} className={boundingBox}>
        {data &&
          sortApartments(data, sortBy, orderLowToHigh)
            .slice(0, resultsToShow)
            .map(({ buildingData, numReviews, company }, index) => {
              const { id } = buildingData;
              return (
                <Grid item md={12} key={index}>
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
                      buildingData={buildingData}
                      company={company}
                      user={user}
                      setUser={setUser}
                    />
                  </Link>
                </Grid>
              );
            })}

        {data && data.length > resultsToShow && (
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

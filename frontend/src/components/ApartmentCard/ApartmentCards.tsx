import React, { ReactElement, useState, useEffect } from 'react';
import ApartmentCard from './ApartmentCard';
import { Grid, Link } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { CardData } from '../../App';
import InfiniteScroll from 'react-infinite-scroll-component';
import { loadingLength } from '../../constants/ApartmentCardConst';

type Props = {
  data: CardData[];
};

const ApartmentCards = ({ data }: Props): ReactElement => {
  const [currentData, setCurrentData] = useState<CardData[]>([]);

  const fetchMoreData = () => {
    setTimeout(() => {
      const curLength = currentData.length;
      const nextData = data.slice(0, curLength + loadingLength);
      setCurrentData(nextData);
    }, 1500);
  };

  return (
    <InfiniteScroll
      dataLength={data.length}
      next={fetchMoreData}
      hasMore={true}
      loader={<h4>Loading more apartments...</h4>}
    >
      <Grid container spacing={3}>
        {currentData &&
          currentData.map(({ buildingData, numReviews, company }, index) => {
            const { id } = buildingData;
            return (
              <Grid item key={index}>
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
                  />
                </Link>
              </Grid>
            );
          })}
      </Grid>
    </InfiniteScroll>
  );
};

export default ApartmentCards;

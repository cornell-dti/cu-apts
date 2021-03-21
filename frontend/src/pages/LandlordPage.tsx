import { Container, Grid } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InfoFeatures from '../components/Review/InfoFeatures';
import Review from '../components/Review/Review';
import ReviewHeader from '../components/Review/ReviewHeader';
import { getWidth } from '../utils/isMobile';
import { useTitle } from '../utils';

type LandlordData = {
  features: string[];
  properties: string[];
  phone: string;
  address: string;
};

export type RatingInfo = {
  feature: string;
  rating: number;
};

const reviews = [
  {
    overallRating: 3,
    date: new Date(),
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam auctor mauris a scelerisque rhoncus. Nam vitae lacus at neque faucibus porttitor. Phasellus mollis maximus neque, vehicula consectetur enim sagittis ac. Sed viverra risus nibh, non pulvinar mauris fermentum sed. Praesent pellentesque dapibus felis nec interdum. ',
  },
  {
    name: 'user2',
    overallRating: 2,
    date: new Date(),
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam auctor mauris a scelerisque rhoncus. Nam vitae lacus at neque faucibus porttitor. Phasellus mollis maximus neque, vehicula consectetur enim sagittis ac. Sed viverra risus nibh, non pulvinar mauris fermentum sed. Praesent pellentesque dapibus felis nec interdum. ',
  },
  {
    overallRating: 1,
    date: new Date(),
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam auctor mauris a scelerisque rhoncus. Nam vitae lacus at neque faucibus porttitor. Phasellus mollis maximus neque, vehicula consectetur enim sagittis ac. Sed viverra risus nibh, non pulvinar mauris fermentum sed. Praesent pellentesque dapibus felis nec interdum. ',
  },
];

const dummyData: LandlordData = {
  properties: ['111 Dryden Rd', '151 Dryden Rd', '418 Eddy St'],
  features: ['Parking', 'Heating', 'Trash removal', 'Snow plowing', 'Maintenance'],
  phone: '555-555-5555',
  address: '119 S Cayuga St, Ithaca, NY 14850',
};

const dummyRatingInfo: RatingInfo[] = [
  {
    feature: 'Parking',
    rating: 4.9,
  },
  {
    feature: 'Heating',
    rating: 4.0,
  },
  {
    feature: 'Trash Removal',
    rating: 4.4,
  },
  {
    feature: 'Snow Plowing',
    rating: 3.2,
  },
  {
    feature: 'Maintenance',
    rating: 2.7,
  },
];

const LandlordPage = (): ReactElement => {
  const { landlordId } = useParams<Record<string, string | undefined>>();
  const [width, setWidth] = useState(window.innerWidth);
  const [landlordData] = useState(dummyData);
  const [aveRatingInfo] = useState(dummyRatingInfo);
  const breakpoint = 600;

  useTitle(`Reviews for ${landlordId}`);
  useEffect(() => {
    window.addEventListener('resize', () => setWidth(getWidth()));
  });

  return (
    <Container>
      <h1>{`This is dummy text! My current landlordId is ${landlordId}`}</h1>
      <Container>
        <Grid container spacing={5}>
          {width >= breakpoint ? (
            <>
              <Grid item xs={12} sm={8}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <ReviewHeader numReviews={reviews.length} aveRatingInfo={aveRatingInfo} />
                  </Grid>

                  {reviews.map((reviewData, index) => (
                    <Grid item xs={12}>
                      <Review {...reviewData} key={index} />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <InfoFeatures
                propertyInfo={landlordData.properties}
                propertyFeatures={landlordData.features}
                phone={landlordData.phone}
                address={landlordData.address}
              />
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <ReviewHeader numReviews={reviews.length} aveRatingInfo={aveRatingInfo} />
              </Grid>
              <InfoFeatures
                propertyInfo={landlordData.properties}
                propertyFeatures={landlordData.features}
                phone={landlordData.phone}
                address={landlordData.address}
              />

              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {reviews.map((reviewData, index) => (
                    <Grid item xs={12}>
                      <Review {...reviewData} key={index} />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </Container>
  );
};

export default LandlordPage;

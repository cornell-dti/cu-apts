import { Box, Button, Container, Grid, Hidden, Typography } from '@material-ui/core';
import React, { ReactElement, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReviewModal from '../components/LeaveReview/ReviewModal';
import PhotoCarousel from '../components/PhotoCarousel/PhotoCarousel';
import InfoFeatures from '../components/Review/InfoFeatures';
import Review from '../components/Review/Review';
import ReviewHeader from '../components/Review/ReviewHeader';
import { useTitle } from '../utils';

type LandlordData = {
  properties: string[];
  photos: string[];
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
  photos: [
    'https://lifestylepropertiesithaca.com/gridmedia/img/slide1.jpg',
    'https://images1.apartments.com/i2/F7HtEfdZCVtvQ_DcqGjQuoQ2IcmcMb2nP1PJuOwOdFw/102/carriage-house-apartments-ithaca-ny-primary-photo.jpg',
  ],
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
  const [landlordData] = useState(dummyData);
  const [aveRatingInfo] = useState(dummyRatingInfo);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);

  useTitle(`Reviews for ${landlordId}`);

  const Modals = (
    <>
      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} />
      <PhotoCarousel
        photos={landlordData.photos}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
      />
    </>
  );

  const Header = (
    <>
      <Grid container item spacing={3} justify="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h4">Reviews ({reviews.length})</Typography>
        </Grid>
        <Button variant="contained" disableElevation onClick={() => setCarouselOpen(true)}>
          Show all photos
        </Button>
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            disableElevation
            onClick={() => setReviewOpen(true)}
          >
            Leave a Review
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <ReviewHeader aveRatingInfo={aveRatingInfo} />
      </Grid>
    </>
  );

  const InfoSection = (
    <Grid item xs={12} sm={4}>
      <InfoFeatures {...landlordData} />
    </Grid>
  );

  return (
    <>
      <Container>
        <Box py={3}>
          <Typography variant="h4">{`This is dummy text! My current landlordId is ${landlordId}`}</Typography>
        </Box>
        <Container>
          <Grid container spacing={5} justify="center">
            <Grid container spacing={3} item xs={12} sm={8}>
              {Header}
              <Hidden smUp>{InfoSection}</Hidden>
              <Grid container item spacing={3}>
                {reviews.map((reviewData, index) => (
                  <Grid item xs={12} key={index}>
                    <Review {...reviewData} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Hidden xsDown>{InfoSection}</Hidden>
          </Grid>
        </Container>
      </Container>
      {Modals}
    </>
  );
};

export default LandlordPage;

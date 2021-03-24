import { Button, Container, Grid } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReviewModal from '../components/LeaveReview/ReviewModal';
import PhotoCarousel from '../components/PhotoCarousel/PhotoCarousel';
import InfoFeatures from '../components/Review/InfoFeatures';
import Review from '../components/Review/Review';
import { getWidth } from '../utils/isMobile';

type LandlordData = {
  features: string[];
  properties: string[];
  photos: string[];
  phone: string;
  address: string;
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
  features: ['Parking', 'Heating', 'Trash removal', 'Snow plowing', 'Maintenance'],
  photos: [
    'https://lifestylepropertiesithaca.com/gridmedia/img/slide1.jpg',
    'https://images1.apartments.com/i2/F7HtEfdZCVtvQ_DcqGjQuoQ2IcmcMb2nP1PJuOwOdFw/102/carriage-house-apartments-ithaca-ny-primary-photo.jpg',
  ],
  phone: '555-555-5555',
  address: '119 S Cayuga St, Ithaca, NY 14850',
};

const LandlordPage = (): ReactElement => {
  const { landlordId } = useParams<Record<string, string | undefined>>();
  const [width, setWidth] = useState(window.innerWidth);
  const [landlordData] = useState(dummyData);
  const breakpoint = 600;

  const [reviewOpen, setReviewOpen] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', () => setWidth(getWidth()));
  });

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

  return (
    <>
      <Container>
        <h1>{`This is dummy text! My current landlordId is ${landlordId}`}</h1>
        <Container>
          <Button variant="contained" disableElevation onClick={() => setCarouselOpen(true)}>
            Show all photos
          </Button>
          <Button
            color="primary"
            variant="contained"
            disableElevation
            onClick={() => setReviewOpen(true)}
          >
            Leave a Review
          </Button>
          <Grid container spacing={3} direction={width >= breakpoint ? 'row-reverse' : 'column'}>
            <InfoFeatures
              propertyInfo={landlordData.properties}
              propertyFeatures={landlordData.features}
              phone={landlordData.phone}
              address={landlordData.address}
            />
            <Grid item xs={12} sm={8}>
              <Grid container spacing={3}>
                {reviews.map((reviewData, index) => (
                  <Grid item xs={12}>
                    <Review {...reviewData} key={index} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Container>
      {Modals}
    </>
  );
};

export default LandlordPage;

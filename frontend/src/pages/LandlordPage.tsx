import React, { ReactElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import styles from '../components/Reviews/Reviews.module.scss';
import InfoFeatures from '../components/Reviews/InfoFeatures';
import Review from '../components/Review/Review';

const reviews = [
  {
    name: 'user1',
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
    name: 'user3',
    overallRating: 1,
    date: new Date(),
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam auctor mauris a scelerisque rhoncus. Nam vitae lacus at neque faucibus porttitor. Phasellus mollis maximus neque, vehicula consectetur enim sagittis ac. Sed viverra risus nibh, non pulvinar mauris fermentum sed. Praesent pellentesque dapibus felis nec interdum. ',
  },
];

const LandlordPage = (): ReactElement => {
  const { landlordId } = useParams<Record<string, string | undefined>>();
  const features = ['parking', 'heating', 'trash removal', 'snow plowing', 'maintenance'];
  const phone = '555-555-5555';
  const address = '119 S Cayuga St, Ithaca, NY 14850';
  const [width, setWidth] = useState(window.innerWidth);
  const breakpoint = 600;

  useEffect(() => {
    window.addEventListener('resize', () => setWidth(window.innerWidth));
  });

  return (
    <div className={styles.container}>
      <h1>{`This is dummy text! My current landlordId is ${landlordId}`}</h1>
      <Container>
        <Grid container spacing={3} direction="row" justify="center" alignItems="stretch">
          {width >= breakpoint ? (
            <>
              <Grid item xs={9}>
                <Grid container spacing={3}>
                  {reviews.map((reviewData, index) => (
                    <Grid item xs={12}>
                      <Review {...reviewData} key={index}/>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <InfoFeatures features={features} phone={phone} address={address} />
            </>
          ) : (
            <>
              <InfoFeatures features={features} phone={phone} address={address} />

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
    </div>
  );
};

export default LandlordPage;

import React, { ReactElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import InfoFeatures from '../components/Review/InfoFeatures';
import Review from '../components/Review';
import { getWidth } from '../utils/isMobile';
import AppBar, { NavbarButton } from '../components/utils/NavBar';

type LandlordData = {
  features: string[];
  properties: string[];
  phone: string;
  address: string;
};

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

const dummyData: LandlordData = {
  properties: ['111 Dryden Rd', '151 Dryden Rd', '418 Eddy St'],
  features: ['Parking', 'Heating', 'Trash removal', 'Snow plowing', 'Maintenance'],
  phone: '555-555-5555',
  address: '119 S Cayuga St, Ithaca, NY 14850',
};

const faq: NavbarButton = {
  label: 'FAQ',
  href: '/faq',
};

const headersData = [faq];
const LandlordPage = (): ReactElement => {
  // eslint-disable-next-line
  const { landlordId } = useParams<Record<string, string | undefined>>();
  const [width, setWidth] = useState(window.innerWidth);
  const [landlordData] = useState(dummyData);
  const breakpoint = 600;

  useEffect(() => {
    window.addEventListener('resize', () => setWidth(getWidth()));
  });

  return (
    <div>
      <AppBar headersData={headersData} />
      <Container>
        <Grid container spacing={3} direction="row">
          {width > breakpoint ? (
            <>
              <Grid item xs={12} sm={8}>
                <Grid container spacing={1}>
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
    </div>
  );
};

export default LandlordPage;

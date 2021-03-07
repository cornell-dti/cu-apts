import React, { ReactElement } from 'react';
import SearchBar from '../components/utils/SearchBar';
import SectionDivider from '../components/Home/SectionDivider';
import ApartmentCard from '../components/Home/ApartmentCard';
import { Container, Row, Col } from 'react-bootstrap';
import styles from './HomePage.module.scss';
import AppBar, { NavbarButton }  from '../components/utils/NavBar';

const faq: NavbarButton = {
  label: 'FAQ',
  href: '/faq',
};

const review: NavbarButton = {
  label: 'Reviews',
  href: '/landlord/1',
};
const headersData = [faq, review];

const HomePage = (): ReactElement => {
  return (
    <Container className={styles.Home}>
      <AppBar headersData={headersData} />
      <div className={styles.homepageDescription}>
        <h5>Search for off-campus housing, review apartments, and share feedback!</h5>
      </div>
      <SearchBar placeholder="Search by any location e.g. “301 College Ave" ariaLabel="" />
      <SectionDivider />
      <Row>
        <Col xs={12} lg={4}>
          <ApartmentCard
            address="117 Eddy St"
            company="Ithaca Renting Company"
            bedsAndBaths="5 Br | 2 B"
            price="$800"
            numReviews="5 Reviews"
          />
        </Col>
        <Col xs={12} lg={4}>
          <ApartmentCard address="117 Eddy St" bedsAndBaths="1 Br | 2 B" />
        </Col>
        <Col xs={12} lg={4}>
          <ApartmentCard
            address="117 Eddy St"
            bedsAndBaths="5 Br | 2 B"
            price="$800"
            topReviewDisplay="3.62 (12)"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;

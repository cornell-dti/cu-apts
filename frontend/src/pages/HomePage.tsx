import React, { ReactElement } from 'react'
import SearchBar from '../components/Home/SearchBar'
import NavBar from '../components/Home/NavBar'
import SectionDivider from '../components/Home/SectionDivider'
import ApartmentCard from '../components/Home/ApartmentCard'
import { Container, Row, Col } from 'react-bootstrap'

const HomePage = (): ReactElement => {
    return <Container className='Home'>
        <NavBar />
        <SearchBar />
        <SectionDivider />
        <Row>
            <Col sm={12} md={4}><ApartmentCard address="117 Eddy St" company="Ithaca Renting Company" bedsAndBaths="5 Br | 2 B" price="$800" numReviews="5 Reviews" /></Col>
            <Col sm={12} md={4}><ApartmentCard address="117 Eddy St" bedsAndBaths="1 Br | 2 B" /></Col>
            <Col sm={12} md={4}><ApartmentCard address="117 Eddy St" bedsAndBaths="5 Br | 2 B" price="$800" topReviewDisplay="3.62 (12)" /></Col>
        </Row>
    </Container>
};

export default HomePage;

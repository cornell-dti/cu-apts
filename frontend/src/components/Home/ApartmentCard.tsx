import React, { ReactElement } from 'react';
import { Card, CardImg } from 'react-bootstrap';
import ApartmentImg from '../../assets/apartment-sample.png';
import { ReactComponent as MapIcon } from '../../assets/map-pin.svg';
import { ReactComponent as PriceIcon } from '../../assets/tag-outline.svg';
import { Container, Row, Col } from 'react-bootstrap';
type Props = {
  address: string;
  company?: string;
  bedsAndBaths?: string;
  price?: string;
  topReviewDisplay?: string;
  numReviews?: string;
};

const ApartmentCard = (props: Props): ReactElement => {
  function renderAdressSection() {
    return (
      <Row>
        <Col xs={8}>
          <Row>
            <MapIcon className="pr-1 mt-1" />
            <Card.Title className="pb-1 mt-0 mb-1" style={{ fontSize: '21px' }}>
              {props.address}
            </Card.Title>
          </Row>
        </Col>
        {renderPrice()}
      </Row>
    );
  }

  function renderPrice() {
    return props.price ? (
      <Col style={{ paddingRight: '0px', paddingLeft: '10px' }} xs={4}>
        <Row>
          <PriceIcon style={{ marginLeft: '12px', marginBottom: '5px' }} />
          <Card.Subtitle
            className="ml-1"
            style={{
              color: 'black',
              display: 'flex',
              position: 'relative',
              fontSize: '14px',
              marginTop: '3px',
            }}
          >
            {props.price}
          </Card.Subtitle>
        </Row>
      </Col>
    ) : (
      <Col xs={3}>
        <Card.Subtitle
          className="pl-4"
          style={{ color: 'black', display: 'flex', position: 'relative', fontSize: '14px' }}
        >
          $$
        </Card.Subtitle>
      </Col>
    );
  }

  return (
    <Container className="mb-2">
      <Card className="shadow rounded">
        <CardImg variant="top" width="100%" src={ApartmentImg} alt="Apartment Image" />
        <Card.Body className="pt-2">
          {renderAdressSection()}
          <Row>
            <Col>
              {props.company && (
                <Card.Subtitle className="pb-3 pr-2 pt-1">
                  <h6>{props.company}</h6>
                </Card.Subtitle>
              )}
            </Col>
          </Row>
          <Row>
            <Col xs={7} style={{ paddingRight: '0px', paddingLeft: '0px', marginLeft: '10px' }}>
              <Card.Subtitle className="pt-1" style={{ marginLeft: '5px', paddingRight: '2px' }}>
                <h6>{props.bedsAndBaths}</h6>
              </Card.Subtitle>
            </Col>
            {props.numReviews && (
              <Col xs={4} style={{ paddingRight: '0px', paddingLeft: '0px', marginLeft: '10px' }}>
                <Card.Text style={{ position: 'relative', fontSize: '12px' }}>
                  {props.numReviews}
                </Card.Text>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ApartmentCard;

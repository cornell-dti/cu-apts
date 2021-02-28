import React, { ReactElement } from 'react';
import {
  Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, Button
} from 'reactstrap';
import ApartmentImg from "../images/apartment-sample.png";
import { ReactComponent as MapIcon } from "../images/map-pin.svg";
import { ReactComponent as PriceIcon } from "../images/tag-outline.svg";
import { Container, Row, Col, Image } from 'react-bootstrap';
type Props = {
  address: string;
  company?: string;
  bedsAndBaths?: string;
  price?: string;
  topReviewDisplay?: string;
  numReviews?: string;
}

const ApartmentCard = (props: Props): ReactElement => {

  function renderAdressSection() {
    return <Row>
      <Col xs={8}>
        <Row>
          <MapIcon className="pr-1 mt-1" />
          <CardTitle className="pb-1 mt-0 mb-1" style={{ fontSize: "21px" }}>{props.address}</CardTitle>
        </Row>
      </Col>
      {renderPrice()}
    </Row>;
  }

  function renderPrice() {
    return props.price ? <Col style={{ paddingRight: "0px", paddingLeft: "10px" }} xs={4}>
      <Row>
        <PriceIcon style={{ marginLeft: "12px", marginBottom: "5px" }} />
        <CardSubtitle className="ml-1" style={{ color: "black", display: "flex", position: "relative", fontSize: "14px" }}>{props.price}</CardSubtitle>
      </Row>
    </Col> :
      <Col xs={3}>
        <CardSubtitle className="pl-4" style={{ color: "black", display: "flex", position: "relative", fontSize: "14px" }}>$$</CardSubtitle>
      </Col>;
  }

  return (
    <Container className="mb-2">
      <Card className="shadow rounded">
        <CardImg top width="100%" src={ApartmentImg} alt="Apartment Image" />
        <CardBody className="pt-2">
          {renderAdressSection()}
          <Row>
            <Col>{props.company && <CardSubtitle tag="h6" className="pb-2 pr-2">{props.company}</CardSubtitle>}</Col>
          </Row>
          <Row>
            <Col xs={7} style={{ paddingRight: "0px" }}><CardSubtitle tag="h6" className="pt-1" style={{ paddingRight: "2px" }}>{props.bedsAndBaths}</CardSubtitle></Col>
            {props.numReviews && <Col xs={5} style={{ paddingLeft: "0px" }}><CardText style={{ position: "relative", fontSize: "12px" }}>{props.numReviews}</CardText></Col>}
          </Row>
        </CardBody>
      </Card>
    </Container>
  );
}

export default ApartmentCard;


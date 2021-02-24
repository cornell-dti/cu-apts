import React from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import ReviewRating from './ReviewRating';

const ReviewModal = () => {
  return (
    <Modal show={true} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Leave a Review</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Name: </Form.Label>
            <Form.Control id="name" type="text" />
            <Form.Check id="anon" type="checkbox" label="Leave this review anonymously" />
          </Form.Group>
          <Form.Group>
            <Row>
              <Col>
                <ReviewRating name="management-rating" label="Management/Landlord"></ReviewRating>
              </Col>
              <Col>
                <ReviewRating name="maintenence-rating" label="Building Maintenence"></ReviewRating>
              </Col>
            </Row>
            <Row>
              <Col>
                <ReviewRating name="amenities-rating" label="Building Amenities"></ReviewRating>
              </Col>
              <Col>
                <ReviewRating name="condition-rating" label="Building Condition"></ReviewRating>
              </Col>
            </Row>
            <Row>
              <Col>
                <ReviewRating
                  name="neighbors-rating"
                  label="Neighborhood & Neighbors"
                ></ReviewRating>
              </Col>
              <Col>
                <ReviewRating
                  name="transportation-rating"
                  label="Transportation and Parking"
                ></ReviewRating>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group>
            <Form.Control
              id="comment"
              as="textarea"
              rows={10}
              placeholder="Write your review here"
            ></Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReviewModal;

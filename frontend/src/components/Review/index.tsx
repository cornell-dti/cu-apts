import React, { ReactElement } from 'react';
import styles from './Review.module.scss';
import Card from 'react-bootstrap/Card';
import Rating from './Rating';
import dateToString from '../../utils/date';

type Props = {
  readonly overall_rating: number;
  readonly date: Date;
  readonly text: string;
};

const Review = ({ overall_rating, date, text }: Props): ReactElement => {
  return (
    <Card className={styles.card}>
      <Card.Body>
        <Card.Title>Anonymous </Card.Title>
        <Rating rating={overall_rating} />
        <Card.Subtitle className={`${styles.date} mb-2 text-muted`}>
          {dateToString(date)}
        </Card.Subtitle>
        <hr />
        <Card.Text>{text}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Review;

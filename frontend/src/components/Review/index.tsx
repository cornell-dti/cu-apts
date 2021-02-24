import React, { ReactElement } from 'react';
import styles from './Review.module.scss';
import Card from 'react-bootstrap/Card';
import Rating from './Rating';

type Props = {
  readonly overall_rating: number;
  readonly date: Date;
  readonly text: string;
};

const months = [
  'Jan',
  'Feb',
  'March',
  'April',
  'May',
  'June',
  'July',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

const date_to_string = (date: Date): string => {
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const Review = ({ overall_rating, date, text }: Props): ReactElement => {
  return (
    <Card className={styles.card}>
      <Card.Body>
        <Card.Title>Anonymous </Card.Title>
        <Rating rating={overall_rating} />
        <Card.Subtitle className={`${styles.date} mb-2 text-muted`}>
          {date_to_string(date)}
        </Card.Subtitle>
        <hr />
        <Card.Text>{text}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Review;

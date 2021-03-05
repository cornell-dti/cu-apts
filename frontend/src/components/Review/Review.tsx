import React, { ReactElement } from 'react';
import styles from './Review.module.scss';
import Card from 'react-bootstrap/Card';
import Rating from './Rating';
import dateToString from '../../utils/date';

type Props = {
  readonly overallRating: number;
  readonly date: Date;
  readonly text: string;
};

export default function Review({ overallRating, date, text }: Props): ReactElement {
  return (
    <Card className={styles.card}>
      <Card.Body>
        <Card.Title>Anonymous </Card.Title>
        <Rating rating={overallRating} />
        <Card.Subtitle className={`${styles.date} mb-2 text-muted`}>
          {dateToString(date)}
        </Card.Subtitle>
        <hr />
        <Card.Text>{text}</Card.Text>
      </Card.Body>
    </Card>
  );
}

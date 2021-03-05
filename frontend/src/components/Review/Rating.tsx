import React, { ReactElement } from 'react';
import styles from './Rating.module.scss';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

type Props = {
  readonly rating: number;
};
const filledHearts = (rating: number) => {
  return [...Array(rating)].map((value, index) => <FavoriteIcon fontSize="small" className={styles.rating} key={index} />);
};

const emptyHearts = (rating: number) => {
  return [...Array(5 - rating)].map((value, index) => (
    <FavoriteBorderIcon fontSize="small" className={styles.rating} key={index}/>
  ));
};

const Rating = ({ rating }: Props): ReactElement => {
  return (
    <div>
      {filledHearts(rating)}
      {emptyHearts(rating)}
    </div>
  );
};

export default Rating;

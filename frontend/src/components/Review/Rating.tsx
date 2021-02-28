import React, { ReactElement } from 'react';
import styles from './Rating.module.scss';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

type Props = {
  readonly rating: number;
};
const filled_hearts = (rating: number) => {
  return [...Array(rating)].map(() => <FavoriteIcon fontSize="small" className={styles.rating} />);
};

const empty_hearts = (rating: number) => {
  return [...Array(5 - rating)].map(() => (
    <FavoriteBorderIcon fontSize="small" className={styles.rating} />
  ));
};

const Rating = ({ rating }: Props): ReactElement => {
  return (
    <div>
      {filled_hearts(rating)}
      {empty_hearts(rating)}
    </div>
  );
};

export default Rating;

import React, { ReactElement } from 'react';
import styles from './Rating.module.scss';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

type Props = {
  readonly rating: number;
};
const filled_hearts = (n: number) => {
  let rows = [];
  for (let i = 0; i < n; i++) {
    rows.push(<FavoriteIcon fontSize="small" className={styles.rating} />);
  }
  return rows;
};

const empty_hearts = (n: number) => {
  let rows = [];
  for (let i = 0; i < n; i++) {
    rows.push(<FavoriteBorderIcon fontSize="small" className={styles.rating} />);
  }
  return rows;
};

const Rating = ({ rating }: Props): ReactElement => {
  return (
    <div>
      {filled_hearts(rating)}
      {empty_hearts(5 - rating)}
    </div>
  );
};

export default Rating;

import React from 'react';
import { Rating } from '@material-ui/lab';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { withStyles } from '@material-ui/core';

type Props = React.ComponentProps<typeof Rating>;

const StyledRating = withStyles({
  iconFilled: {
    color: '#EB5757',
  },
  iconHover: {
    color: '#ff3d47',
  },
})(Rating);

const HeartRating = (props: Props) => {
  return (
    <StyledRating
      {...props}
      defaultValue={0}
      icon={<FavoriteIcon />}
      emptyIcon={<FavoriteBorderIcon />}
    />
  );
};

export default HeartRating;

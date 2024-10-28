import React from 'react';
import { Rating } from '@material-ui/lab';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { withStyles } from '@material-ui/core';
import { colors } from '../../colors';

type Props = React.ComponentProps<typeof Rating> & {
  fontSize?: number | string;
  defaultValue?: number;
};

const StyledRating = withStyles({
  iconEmpty: {
    color: colors.red2,
  },
  iconFilled: {
    color: colors.red2,
  },
})(Rating);

/**
 * HeartRating Component
 *
 * Represents a rating component with heart icons.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {number | string} [props.fontSize] - The specific font size of the icons
 * @param {"medium" | "large" | "small" | undefined} [props.size] - The general size of the icons. Used if fontSize is not provided
 * @returns {ReactElement} The rendered HeartRating component.
 */
const HeartRating = (props: Props) => {
  return (
    <StyledRating
      {...props}
      defaultValue={props.defaultValue || 0}
      icon={
        props.fontSize ? (
          <FavoriteIcon style={{ fontSize: props.fontSize }} />
        ) : (
          <FavoriteIcon fontSize={props.size} />
        )
      }
      emptyIcon={
        props.fontSize ? (
          <FavoriteBorderIcon style={{ fontSize: props.fontSize }} />
        ) : (
          <FavoriteBorderIcon fontSize={props.size} />
        )
      }
    />
  );
};

export default HeartRating;

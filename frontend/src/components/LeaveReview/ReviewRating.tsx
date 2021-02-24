import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { Rating } from '@material-ui/lab';
import FavoriteIcon from '@material-ui/icons/Favorite';
import styles from './ReviewRating.module.scss';
import { ReactComponent as Heart } from '../../assets/search.svg';
import { withStyles } from '@material-ui/core';

interface Props {
  name: string;
  label: string;
}

const StyledRating = withStyles({
  iconFilled: {
    color: '#ff6d75',
  },
  iconHover: {
    color: '#ff3d47',
  },
})(Rating);

const ReviewRating = ({ name, label }: Props) => {
  return (
    <>
      <StyledRating name={name} defaultValue={0} icon={<FavoriteIcon />} />
      <Form.Label> {label} </Form.Label>
    </>
  );
};

export default ReviewRating;

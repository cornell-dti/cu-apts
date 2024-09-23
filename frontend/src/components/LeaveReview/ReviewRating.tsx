import React from 'react';
import { FormLabel, Grid } from '@material-ui/core';
import HeartRating from '../utils/HeartRating';

interface Props {
  name: string;
  label: string;
  onChange: (event: React.ChangeEvent<{}>, value: number | null) => void;
  defaultValue?: number;
}

/**
 * ReviewRating component renders a rating system using hearts and a label.
 *
 * @component
 * @param {string} props.name - The name attribute for the HeartRating component.
 * @param {string} props.label - The label to be displayed next to the HeartRating component.
 * @param {function} props.onChange - Callback function to handle the change event when the rating is modified.
 * @param {number} [props.defaultValue] - The default value for the HeartRating component.
 * @returns {JSX.Element} The rendered ReviewRating component.
 */
const ReviewRating = ({ name, label, onChange, defaultValue }: Props) => {
  return (
    <Grid container justifyContent="flex-start" alignItems="center" item xs={12} md={6}>
      <Grid item>
        <HeartRating name={name} onChange={onChange} defaultValue={defaultValue || 0} />
      </Grid>
      <Grid item style={{ marginLeft: '25px' }}>
        <FormLabel>{label}</FormLabel>
      </Grid>
    </Grid>
  );
};

export default ReviewRating;

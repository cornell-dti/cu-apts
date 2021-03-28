import React, { ReactElement } from 'react';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import HeartRating from '../utils/HeartRating';
import { format } from 'date-fns';

type Props = {
  readonly overallRating: number;
  readonly date: Date;
  readonly text: string;
};

const Review = ({ overallRating, date, text }: Props): ReactElement => {
  const formattedDate = format(date, 'MMM dd, yyyy').toUpperCase();
  return (
    <Grid item>
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container justify="space-between">
              <Grid container item xs={6} spacing={2}>
                <Grid item>
                  <HeartRating value={overallRating} readOnly />
                </Grid>
                <Grid item>
                  <Typography>{formattedDate}</Typography>
                </Grid>
              </Grid>
              <Grid item>
                <Typography variant="h6">Anonymous</Typography>
              </Grid>
            </Grid>
            <Grid item container alignContent="center">
              <Typography>{text}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default Review;

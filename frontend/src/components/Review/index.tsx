import React, { ReactElement } from 'react';
import { Card, CardContent, CardHeader, Grid, Paper, Typography } from '@material-ui/core';
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
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container justify="space-between">
              <Grid container xs={6} spacing={2}>
                <Grid item>
                  <HeartRating value={overallRating} readOnly />
                </Grid>
                <Grid item>
                  <Typography>{formattedDate}</Typography>
                </Grid>
              </Grid>
              <Grid item>
                <Typography variant={'h6'}>Anonymous</Typography>
              </Grid>
            </Grid>
            <Grid item container alignContent="center">
              <Typography>{text}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
    // <Card className={styles.card}>
    //   <Card.Body>
    //     <Card.Title>Anonymous </Card.Title>
    //     <Rating rating={overallRating} />
    //     <Card.Subtitle className={`${styles.date} mb-2 text-muted`}>
    //       {dateToString(date)}
    //     </Card.Subtitle>
    //     <hr />
    //     <Card.Text>{text}</Card.Text>
    //   </Card.Body>
    // </Card>
  );
};

export default Review;

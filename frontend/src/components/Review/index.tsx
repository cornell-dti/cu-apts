import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Rating from './Rating';
import dateToString from '../../utils/date';

type Props = {
  readonly overallRating: number;
  readonly date: Date;
  readonly text: string;
};

const useStyles = makeStyles({
  root: {
    width: '60vw',
    '@media (max-width: 650px)': {
      width: '94vw',
    },
    borderRadius: '10px',
    marginLeft: '3vw',
    marginRight: '3vw',
    marginBottom: '3vh',
    boxShadow: 'none',
  },
  title: {
    display: 'inline-block',
    marginRight: '10px',
  },
  dateText: {
    '@media (min-width: 650px)': {
      position: 'relative',
      float: 'right',
      paddingTop: '8px',
    },
  },
});

const Review = ({ overallRating, date, text }: Props): ReactElement => {
  const { root, title, dateText } = useStyles();
  return (
    <Card variant="outlined" className={root}>
      <CardContent>
        <Typography className={title} variant="h5" component="h2">
          Anonymous
        </Typography>
        <Rating rating={overallRating} />
        <Typography className={dateText}>{dateToString(date)}</Typography>
        <hr />
        <Typography variant="body2" component="p">
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Review;

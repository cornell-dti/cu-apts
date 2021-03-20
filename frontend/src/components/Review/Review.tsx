import React, { ReactElement } from 'react';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Button,
  IconButton,
  Collapse,
} from '@material-ui/core';
import HeartRating from '../utils/HeartRating';
import { format } from 'date-fns';
import { makeStyles } from '@material-ui/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';
import DetailedRating, { Ratings } from './DetailedRating';
import ApartmentImg from '../../assets/apartment-sample.png';

type Props = {
  readonly overallRating: number;
  readonly date: Date;
  readonly text: string;
  readonly ratings: Ratings;
};

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: '10px',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    borderColor: 'black',
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  dateText: {
    color: '#5D5D5D',
  },
}));

const Review = ({ overallRating, date, text, ratings }: Props): ReactElement => {
  const formattedDate = format(date, 'MMM dd, yyyy').toUpperCase();
  const { root, expand, expandOpen, dateText } = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Grid item>
      <Card className={root} variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item container justify="space-between">
              <Grid container xs={10} spacing={2}>
                <Grid item>
                  <HeartRating value={overallRating} readOnly />
                </Grid>
                <Grid item>
                  <IconButton
                    className={clsx(expand, {
                      [expandOpen]: expanded,
                    })}
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                    size="small"
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </Grid>
              </Grid>
              <Grid item>
                <Typography className={dateText}>{formattedDate}</Typography>
              </Grid>
            </Grid>
            <Grid item>
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                  <DetailedRating ratings={ratings} />
                </CardContent>
              </Collapse>
            </Grid>
            <Grid item container alignContent="center">
              <Typography>{text}</Typography>
            </Grid>
            <Grid container alignItems="center" justify="center">
              <Grid item xs={12} sm={6}>
                <CardMedia component="img" alt="Apt image" image={ApartmentImg} title="Apt image" />
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Grid item container justify="space-between">
            <Grid item>
              <Button size="small">Helpful</Button>
            </Grid>
            <Grid item>
              <Button size="small">Report Abuse</Button>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    </Grid>
  );
};

export default Review;

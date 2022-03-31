import React, { ReactElement } from 'react';
import ApartmentImg from '../../assets/apartment-placeholder.png';
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { Apartment } from '../../../../common/types/db-types';
import HeartRating from '../utils/HeartRating';
import MessageImg from '../../assets/msg.png';

type Props = {
  buildingData: Apartment;
  numReviews: number;
  company?: string;
};
const useStyles = makeStyles({
  img: {
    borderRadius: '12%',
    height: '205px',
    width: '100%',
    padding: '17px',
  },
  msgImg: {
    height: '18px',
    width: '18px',
    marginLeft: '25px',
  },
  aptNameTxt: {
    fontWeight: 800,
    marginLeft: '25px',
  },
  marginTxt: {
    marginLeft: '25px',
  },
  card: {
    borderRadius: '10px',
    backgroundColor: '#FFF2F2',
  },
  reviewNum: {
    fontWeight: 700,
    marginLeft: '10px',
  },
  reviewText: {
    color: 'gray',
    marginLeft: '25px',
  },
  textStyle: {
    maxWidth: '100%',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginLeft: '25px',
    marginRight: '5px',
  },
});

const ApartmentCard = ({ buildingData, numReviews, company }: Props): ReactElement => {
  const { name, photos } = buildingData;
  const img = photos.length > 0 ? photos[0] : ApartmentImg;
  const classes = useStyles();
  const matches = useMediaQuery('(min-width:960px)');

  return (
    <Card className={classes.card}>
      <Grid container direction="row" alignItems="center">
        <Grid item md={2}>
          {matches && (
            <CardMedia className={classes.img} image={img} component="img" title={name} />
          )}
        </Grid>
        <Grid item md={10}>
          <CardContent>
            <Grid container spacing={1}>
              <Grid item>
                <Typography variant="h5" className={classes.aptNameTxt}>
                  {name}
                </Typography>
              </Grid>
              {company && (
                <Grid container item justify="space-between" className={classes.marginTxt}>
                  <Grid>
                    <Typography variant="subtitle1">{buildingData.address}</Typography>
                  </Grid>
                </Grid>
              )}
              <Grid container direction="row" alignItems="center" className={classes.marginTxt}>
                <HeartRating value={3} readOnly />
                <Typography variant="h6" className={classes.reviewNum}>
                  {numReviews + (numReviews !== 1 ? ' Reviews' : ' Review')}
                </Typography>
              </Grid>
              <Grid>
                <Typography variant="subtitle1" className={classes.textStyle}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum
                  dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                  labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                  ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ApartmentCard;

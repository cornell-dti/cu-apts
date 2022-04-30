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
import { LandlordWithLabel } from '../../../../common/types/db-types';
import { colors } from '../../colors';

type Props = {
  landlordData: LandlordWithLabel;
};
const useStyles = makeStyles({
  img: {
    paddingTop: '10.25%',
    borderRadius: '50%',
    paddingRight: '5px',
    margin: '10px',
    width: '100%',
  },
  landlordNameTxt: {
    color: colors.white,
    fontWeight: 600,
    marginLeft: '25px',
  },
  marginTxt: {
    marginLeft: '25px',
  },
  card: {
    height: '100%',
    borderRadius: '10px',
    backgroundColor: colors.landlordCardRed,
    paddingTop: '10px',
  },
});

const LandlordCard = ({ landlordData }: Props): ReactElement => {
  const classes = useStyles();
  //useMediaQuery here is for detecting whether the screen size wider than 960px
  // if so, matches is true; otherwise, it's false
  const matches = useMediaQuery('(min-width:960px)');

  return (
    <Card className={classes.card}>
      <Grid container direction="row" alignItems="center">
        <Grid item md={2}>
          {matches && (
            <CardMedia
              className={classes.img}
              image={landlordData.profilePhoto ? landlordData.profilePhoto : ApartmentImg}
              component="img"
              title={landlordData.name}
            />
          )}
        </Grid>
        <Grid item md={10}>
          <CardContent>
            <Typography variant="h5" className={classes.landlordNameTxt}>
              {landlordData.name}
            </Typography>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default LandlordCard;

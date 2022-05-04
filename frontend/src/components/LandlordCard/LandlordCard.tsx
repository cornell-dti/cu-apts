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
    // paddingRight: '10px',
    marginLeft: '60px',
    width: '100px',
    height: '95%',
  },
  smallImg: {
    paddingTop: '10.25%',
    borderRadius: '50%',
    width: '100px',
    marginLeft: '70px',
    // paddingLeft: '10px',
    // marginRight: '10px',
    height: '90%',
  },
  mobileImg: {
    paddingTop: '10.25%',
    borderRadius: '50%',
    width: '150px',
    height: '100%',
  },
  landlordNameTxt: {
    color: colors.white,
    fontWeight: 600,
    marginLeft: '50px',

    // paddingLeft: '50px',
    fontSize: '22px',
  },
  smallLandlordNameTxt: {
    color: colors.white,
    fontWeight: 600,
    // marginLeft: '40px',
    paddingLeft: '35%',
    paddingRight: '15px',
    fontSize: '15px',
  },
  mobileLandlordNameTxt: {
    color: colors.white,
    paddingTop: '10.25%',
    fontWeight: 600,
    fontSize: '16px',
  },
  card: {
    height: '100%',
    borderRadius: '10px',
    backgroundColor: colors.landlordCardRed,
    paddingTop: '10px',
  },
});

const LandlordCard = ({ landlordData }: Props): ReactElement => {
  const {
    img,
    smallImg,
    mobileImg,
    landlordNameTxt,
    card,
    mobileLandlordNameTxt,
    smallLandlordNameTxt,
  } = useStyles();
  //useMediaQuery here is for detecting whether the screen size wider than 960px
  // if so, matches is true; otherwise, it's false
  const matches1 = useMediaQuery('(min-width:900px)');
  const matches2 = useMediaQuery('(min-width:600px)');

  return (
    <Card className={card}>
      <Grid container direction="row">
        <Grid container sm={2} justify="center" alignItems="center">
          <CardMedia
            className={matches1 ? img : matches2 ? smallImg : mobileImg}
            image={landlordData.profilePhoto ? landlordData.profilePhoto : ApartmentImg}
            component="img"
            // title={landlordData.name}
          />
        </Grid>
        <Grid container sm={10} justify="center" alignItems="center">
          <CardContent>
            <Typography
              className={
                matches1 ? landlordNameTxt : matches2 ? smallLandlordNameTxt : mobileLandlordNameTxt
              }
            >
              {landlordData.name}
            </Typography>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default LandlordCard;

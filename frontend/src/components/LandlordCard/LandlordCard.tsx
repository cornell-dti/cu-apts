import React, { ReactElement, useState } from 'react';
import ApartmentImg from '../../assets/apartment-placeholder.png';
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  Typography,
  useMediaQuery,
  IconButton,
} from '@material-ui/core';
import { LandlordWithLabel } from '../../../../common/types/db-types';
import { colors } from '../../colors';
import savedIcon from '../../assets/filled-saved-icon.png';
import unsavedIcon from '../../assets/unfilled-saved-icon.png';

type Props = {
  landlordData: LandlordWithLabel;
};

const useStyles = makeStyles({
  img: {
    paddingTop: '8%',
    paddingBottom: '8%',
    borderRadius: '50%',
    marginLeft: '10%',
    width: '100px',
  },
  mobileImg: {
    margin: '10%',
    borderRadius: '50%',
    width: '80%',
  },
  landlordNameTxt: {
    color: colors.white,
    fontWeight: 600,
    marginLeft: '20px',
    paddingTop: '8%',
    fontSize: '22px',
  },
  mobileLandlordNameTxt: {
    color: colors.white,
    textAlign: 'center',
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
  const { img, mobileImg, landlordNameTxt, card, mobileLandlordNameTxt } = useStyles();
  //useMediaQuery here is for detecting whether the screen size wider than 960px
  // if so, matches is true; otherwise, it's false
  const matches = useMediaQuery('(min-width:960px)');
  const saved = savedIcon;
  const unsaved = unsavedIcon;
  const [isSaved, setIsSaved] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <Card className={card}>
      <Grid container direction="row">
        <Grid item xs={12} sm={12} md={4} justifyContent="center" alignItems="center">
          <CardMedia
            className={matches ? img : mobileImg}
            image={landlordData.profilePhoto ? landlordData.profilePhoto : ApartmentImg}
            component="img"
          />
        </Grid>
        <Grid item xs={12} sm={12} md={8} justifyContent="center" alignItems="center">
          <CardContent>
            <Typography className={matches ? landlordNameTxt : mobileLandlordNameTxt}>
              {landlordData.name}
            </Typography>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default LandlordCard;

import { Grid, Link, makeStyles, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Heart from '../../../assets/red-heart.svg';

const useStyles = makeStyles(() => ({
  footer: {
    marginTop: '8px',
    marginBottom: '8px',
    backgroundColor: '#F9F9F9',
    height: '94px',
    fontFamily: 'Work Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '24px',
    lineHeight: '28px',
    letterSpacing: '0.02em',
    color: '#000000',
    '@media only screen and (max-width: 992px) ': {
      paddingLeft: '1em',
      paddingRight: '1em',
    },
  },
  contact: {
    color: '#B94630',
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: '4px',
  },
  heart: {
    marginLeft: '4px',
  },
  item: {
    margin: '2px',
    alignItems: 'center',
  },
}));
const Footer = (): ReactElement => {
  const { footer, contact, heart, item } = useStyles();
  return (
    <footer>
      <Grid container alignItems="center" justify="center" className={footer} direction="row">
        <Grid item className={item} xs={12}>
          <Grid container alignItems="center" justify="center">
            <Grid item>
              <Typography>Got a question that isn’t answered? </Typography>
            </Grid>
            <Grid item>
              <Typography>
                <Link className={contact} href="mailto:hello@cornelldti.org">
                  Contact us!
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={item} xs={12}>
          <Grid container alignItems="center" justify="center">
            <Grid item>
              <Link
                {...{
                  to: `/policies`,
                  style: { color: 'black' },
                  component: RouterLink,
                }}
              >
                <Typography> Privacy Policy </Typography>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={item} xs={12}>
          <Grid container alignItems="stretch" justify="center">
            <Grid item>
              {' '}
              <Typography> Built With </Typography>
            </Grid>
            <Grid item>
              <img className={heart} src={Heart} alt="red heart" width="22" height="22"></img>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </footer>
  );
};
export default Footer;

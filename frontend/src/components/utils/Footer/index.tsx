import { Grid, Link, makeStyles, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles(() => ({
  footer: {
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
      paddingLeft: '4%',
      paddingRight: '4%',
      margin: '0 auto',
    },
  },
  link: {
    color: '#B94630',
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: '4px',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
}));
const Footer = (): ReactElement => {
  const { footer, link, text } = useStyles();
  return (
    <footer>
      <Grid container className={footer} alignItems="center" justify="center" direction="column">
        <Grid item xl={12}>
          <Grid container alignItems="center" justify="center">
            <Grid item>
              <Typography className={text}>Want to get in touch? </Typography>
            </Grid>
            <Grid item>
              <Typography className={text}>
                <Link className={link} href="mailto:hello@cornelldti.org">
                  Contact us!
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xl={12}>
          <Typography>
            <Link
              className={link}
              {...{
                to: `/policies`,
                component: RouterLink,
              }}
            >
              {' '}
              Privacy Policy
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </footer>
  );
};
export default Footer;

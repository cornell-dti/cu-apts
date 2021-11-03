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
}));
const Footer = (): ReactElement => {
  const { footer, contact } = useStyles();
  return (
    <footer>
      <Grid container alignItems="center" justify="center" className={footer} direction="column">
        <Grid item>
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
    </footer>
  );
};
export default Footer;

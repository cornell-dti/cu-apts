import { Grid, Link, makeStyles, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { colors } from '../../../colors';
import { useModal } from './ContactModalContext';

const useStyles = makeStyles(() => ({
  footer: {
    backgroundColor: colors.gray3,
    height: '94px',
    fontFamily: 'Work Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '24px',
    lineHeight: '28px',
    letterSpacing: '0.02em',
    color: colors.black,
    '@media only screen and (max-width: 992px) ': {
      paddingLeft: '4%',
      paddingRight: '4%',
      margin: '0 auto',
    },
  },
  link: {
    color: colors.red1,
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
  const { openModal } = useModal();

  return (
    <footer>
      <Grid
        container
        className={footer}
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        <Grid item xl={12}>
          <Grid container alignItems="center" justifyContent="center">
            <Grid item>
              <Typography className={text}>Want to get in touch? </Typography>
            </Grid>
            <Grid item>
              <Typography onClick={openModal} className={link} style={{ cursor: 'pointer' }}>
                Contact Us!
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

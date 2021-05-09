import { Grid, Link, makeStyles, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
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
  },
  link: {
    color: '#B94630',
    fontWeight: 'bold',
  },
}));
const Footer = (): ReactElement => {
  const { footer, link } = useStyles();
  return (
    <footer>
      <Grid container alignItems="center" justify="center" className={footer}>
        <Typography>
          Got a question that isn’t answered? <Link className={link} underline="none" href="/">Contact us!</Link>
        </Typography>
      </Grid>
    </footer>
  );
}
export default Footer;
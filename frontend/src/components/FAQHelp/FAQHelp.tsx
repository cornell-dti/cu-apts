import { Box, Grid, Typography } from '@material-ui/core';
import SearchBar from 'material-ui-search-bar';
import React, { ReactElement } from 'react';
import styles from './FAQHelp.module.scss';

const FAQHelp = (): ReactElement => {
  return (
    <Box bgcolor="#b94630" p={4}>
      <Grid container direction="column" alignItems="center" spacing={1}>
        <Grid item>
          <Typography color="initial" variant="h5">
            Need Help?
          </Typography>
        </Grid>
        <Grid item xs="auto">
          <SearchBar placeholder="Search by any location e.g. “301 College Ave" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FAQHelp;

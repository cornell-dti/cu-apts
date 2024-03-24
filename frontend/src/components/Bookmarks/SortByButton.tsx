import { Grid, makeStyles, Typography } from '@material-ui/core';
import DropDown from '../utils/DropDown';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  sortByButton: {
    background: '#E8E8E8',
    border: 'none',
    borderRadius: '10px',
    paddingRight: '5px',
    paddingLeft: '5px',
  },
}));

const SortByButton = ({ menuItems }: { menuItems: { item: string; callback: () => void }[] }) => {
  const { sortByButton } = useStyles();

  return (
    <Grid container spacing={1} direction="row" alignItems="center">
      <Grid item>
        <Typography>Sort by:</Typography>
      </Grid>
      <Grid item className={sortByButton}>
        <DropDown menuItems={menuItems} />
      </Grid>
    </Grid>
  );
};

export default SortByButton;

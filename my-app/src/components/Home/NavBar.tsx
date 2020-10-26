import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import icon from './home-icon.png'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  button: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const NavBar= (): ReactElement => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={8}>
        <div>
            
            <h1><img className='Logo'src={icon} alt='logo'/>CU Housing</h1>
            <h4>Search for off-campus housing, review apartments, and share feedback!</h4>
        </div>
        </Grid>
        <Grid item xs={4} >
            <div className={classes.button}> 
                <Button variant="outlined">FAQ</Button>
                <Button variant="outlined">Resources</Button>
            </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default NavBar;
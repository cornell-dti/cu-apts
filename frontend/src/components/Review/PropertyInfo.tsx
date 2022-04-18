import React, { ReactElement } from 'react';
import {
  Box,
  Typography,
  Grid,
  Link,
  Card,
  makeStyles,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { Apartment } from '../../../../common/types/db-types';
import HeartRating from '../utils/HeartRating';

// import { Apartment } from '@material-ui/icons';
import ApartmentCard from '../ApartmentCard/ApartmentCard';

type Props = {
  readonly info: Apartment[];
  readonly title: string;
};

const useStyles = makeStyles({
  aptNameTxt: {
    fontWeight: 500,
    // marginLeft: '15px',
  },
  card: {
    borderRadius: '20px',
    backgroundColor: '#FFF6F6',
  },
});

export default function PropertyInfo({ title, info }: Props): ReactElement {
  const classes = useStyles();

  return (
    <Box mt={2} mb={-1}>
      <Typography variant="h6">{title}</Typography>

      {/* <List dense component="ul">
        <Grid container spacing={0} direction="row">
          {info.length === 0 && <Typography>No information available.</Typography>}
          {info.map((apt, index) => (
            <Grid item xs={6} sm={12} md={6} key={index}>
              <ListItem disableGutters>
                <ListItemText primary={apt.name} />
              </ListItem>
            </Grid>
          ))}
        </Grid>
      </List> */}

      <Grid container spacing={3}>
        {info.length === 0 && <Typography>No information available</Typography>}
        {info.map((apt, index) => (
          <Grid item key={index}>
            {/* <Link
              {...{
                to: `/apartment/${apt.id}`,
                style: { textDecoration: 'none' },
                component: RouterLink,
              }}
            > */}
            <Card className={classes.card}>
              <Grid container direction="column">
                <Grid item>
                  <CardContent>
                    <Grid container spacing={1}>
                      <Grid item>
                        <Typography className={classes.aptNameTxt}>{apt.name}</Typography>
                      </Grid>
                      <Grid item>
                        <Typography>{apt.address}</Typography>
                      </Grid>
                      <Grid container direction="row" alignItems="center">
                        <HeartRating value={3} readOnly />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
            {/* </Link> */}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

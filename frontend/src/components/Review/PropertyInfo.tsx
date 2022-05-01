import React, { ReactElement } from 'react';
import Grid from '@material-ui/core/Grid';
import { Box, Typography, List, ListItem, ListItemText } from '@material-ui/core';
import { CardData } from '../../App';
import ApartmentCards from '../ApartmentCard/ApartmentCards';

type Props = {
  readonly info: CardData[];
  readonly title: string;
};

export default function PropertyInfo({ info, title }: Props): ReactElement {
  return (
    <Box mt={2} mb={-1}>
      <Typography variant="h6">{title}</Typography>
      <List dense component="ul">
        <Grid container spacing={0} direction="row">
          {info.length === 0 && <Typography variant="body1">No information available.</Typography>}
          <ApartmentCards data={info} />
        </Grid>
      </List>
    </Box>
  );
}

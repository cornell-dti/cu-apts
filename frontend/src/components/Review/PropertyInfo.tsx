import React, { ReactElement } from 'react';
import Grid from '@material-ui/core/Grid';
import { Box, Typography, List, ListItem, ListItemText } from '@material-ui/core';

type Props = {
  readonly info: readonly string[];
  readonly title: string;
};

export default function PropertyInfo({ info, title }: Props): ReactElement {
  return (
    <Box mt={2} mb={-1}>
      <Typography variant="h6">{title}</Typography>
      <List dense component="ul">
        <Grid container spacing={0} direction="row">
          {info.length === 0 && <Typography>No information available.</Typography>}
          {info.map((feature, index) => (
            <Grid item xs={6} sm={12} md={6} key={index}>
              <ListItem>
                <ListItemText primary={feature} />
              </ListItem>
            </Grid>
          ))}
        </Grid>
      </List>
    </Box>
  );
}

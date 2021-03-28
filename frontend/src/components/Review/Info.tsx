import { Box, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';

type Props = {
  readonly phone: string;
  readonly address: string;
};

const InfoItem = ({ text }: { text: string }) => (
  <ListItem disableGutters>
    <ListItemText primary={text} />
  </ListItem>
);

export default function Info({ phone, address }: Props): ReactElement {
  return (
    <Box mt={1}>
      <Typography variant="h5">Info</Typography>
      <List dense>
        <InfoItem text={phone} />
        <InfoItem text={address} />
      </List>
    </Box>
  );
}

import { Box, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';

type Props = {
  readonly contact: string | null;
  readonly address: string | null;
};

const InfoItem = ({ text }: { text: string }) => (
  <ListItem disableGutters>
    <ListItemText primary={text} />
  </ListItem>
);

export default function Info({ contact, address }: Props): ReactElement {
  return (
    <Box mt={1}>
      <Typography variant="h5">Info</Typography>
      <List dense>
        {contact && <InfoItem text={contact} />}
        {address && <InfoItem text={address} />}
      </List>
    </Box>
  );
}

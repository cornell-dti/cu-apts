import { Box, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';

type Props = {
  readonly landlord: string | null;
  readonly contact: string | null;
  readonly address: string | null;
};

const InfoItem = ({ text }: { text: string }) => (
  <ListItem disableGutters>
    <ListItemText primary={text} />
  </ListItem>
);

export default function Info({ landlord, contact, address }: Props): ReactElement {
  return (
    <Box mt={1}>
      <Typography variant="h5">Info</Typography>
      <List dense>
        {landlord && <InfoItem text={`Landlord/Renting Company: ${landlord}`} />}
        {contact && (
          <a href={contact} target="_blank" rel="noreferrer">
            <InfoItem text={`Contact: ${contact}`} />
          </a>
        )}
        {address && <InfoItem text={`Address: ${address}`} />}
      </List>
    </Box>
  );
}
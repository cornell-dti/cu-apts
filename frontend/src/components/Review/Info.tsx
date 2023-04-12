import { Box, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
  title: {
    fontWeight: 500,
  },
}));

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
  const { title } = useStyles();

  return (
    <Box mt={1}>
      <Typography variant="h6" className={title}>
        Info
      </Typography>
      <List dense>
        {contact && <InfoItem text={`Contact: ${contact}`} />}
        {address && <InfoItem text={`Address: ${address}`} />}
      </List>
    </Box>
  );
}

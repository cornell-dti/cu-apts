import { Box, Button, Link, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles(() => ({
  title: {
    fontWeight: 500,
  },
}));

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
  const { title } = useStyles();

  return (
    <Box mt={1}>
      <Typography variant="h5" className={title}>
        Information
      </Typography>
      <List dense>
        {landlord && <InfoItem text={`Landlord/Renting Company: ${landlord}`} />}
        {address && <InfoItem text={`Address: ${address}`} />}
        {contact && (
          <a href={contact} target="_blank" rel="noreferrer">
            <InfoItem text={`Contact: ${contact}`} />
          </a>
        )}
      </List>
      <Box display="flex" justifyContent="center" gridColumnGap={14} mb={4}>
        <Link
          {...{
            to: `/apartment`,
            style: { textDecoration: 'none' },
            component: RouterLink,
          }}
        >
          <Button color="primary" variant="outlined" disableElevation>
            Visit Landlord
          </Button>
        </Link>
        <Link
          {...{
            to: `/apartment`,
            style: { textDecoration: 'none' },
            component: RouterLink,
          }}
        >
          <Button color="primary" variant="contained" disableElevation>
            Contact
          </Button>
        </Link>
      </Box>
    </Box>
  );
}

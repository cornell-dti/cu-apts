import {
  Box,
  Button,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@material-ui/core';
import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles(() => ({
  title: {
    fontWeight: 500,
  },
}));

type Props = {
  readonly landlordId: string | null;
  readonly landlord: string | null;
  readonly contact: string | null;
  readonly address: string | null;
};

const InfoItem = ({ text }: { text: string }) => (
  <ListItem disableGutters>
    <ListItemText primary={text} />
  </ListItem>
);

export default function Info({ landlordId, landlord, contact, address }: Props): ReactElement {
  const { title } = useStyles();

  return (
    <Box mt={1} mb={2}>
      <Typography variant="h5" className={title}>
        Information
      </Typography>
      <List dense>
        {landlord && <InfoItem text={`Landlord/Renting Company: ${landlord}`} />}
        {address && <InfoItem text={`Address: ${address}`} />}
      </List>
      <Grid container justifyContent="center" spacing={2}>
        <Grid item xs={6} sm={12} md={6}>
          {landlord && (
            <Link
              {...{
                to: `/landlord/${landlordId}`,
                style: { textDecoration: 'none', display: 'inline-block', width: '100%' },
                component: RouterLink,
              }}
            >
              <Button color="primary" variant="outlined" fullWidth disableElevation>
                Visit Landlord
              </Button>
            </Link>
          )}
        </Grid>
        <Grid item xs={6} sm={12} md={6}>
          {contact && (
            <Link
              href={contact}
              target="_blank"
              rel="noreferrer"
              {...{
                style: { textDecoration: 'none', display: 'inline-block', width: '100%' },
              }}
            >
              <Button color="primary" variant="contained" fullWidth disableElevation>
                Contact
              </Button>
            </Link>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

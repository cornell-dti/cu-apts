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

/**
 * InfoItem – Renders a single list item displaying text information.
 *
 * @param {string} props.text – The text content to display.
 *
 * @return {JSX.Element} – A ListItem component with the text.
 */
const InfoItem = ({ text }: { text: string }) => (
  <ListItem disableGutters>
    <ListItemText primary={text} />
  </ListItem>
);

/**
 * Info – Displays landlord contact information with links to their page and contact.
 *
 * @remarks
 * This component shows the landlord name and address, with buttons to visit
 * the landlord's page or contact them directly.
 *
 * @param {string | null} props.landlordId – The unique identifier for the landlord.
 * @param {string | null} props.landlord – The name of the landlord or renting company.
 * @param {string | null} props.contact – Contact URL for the landlord.
 * @param {string | null} props.address – The address of the apartment.
 *
 * @return {ReactElement} – The rendered Info component.
 */
export default function Info({ landlordId, landlord, contact, address }: Props): ReactElement {
  const { title } = useStyles();

  return (
    <Box mt={1} mb={3}>
      <Typography variant="h6" className={title} style={{ fontWeight: 400 }}>
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

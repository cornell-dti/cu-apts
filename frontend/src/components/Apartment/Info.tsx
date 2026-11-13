import { Button, Grid, Link, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import { Link as RouterLink } from 'react-router-dom';
import { colors } from '../../colors';
import { ReactComponent as CalendarIcon } from '../../assets/calendar-icon.svg';
import { formatMonthsBeforeStart } from '../../utils/leaseDates';
import { LeaseSignedStats } from '../../../../common/types/db-types';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '28px',
    color: colors.black,
  },
  infoText: {
    fontSize: '16px',
    lineHeight: '24px',
    color: colors.black,
  },
  button: {
    borderRadius: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '24px',
    textTransform: 'none',
  },
  outlinedButton: {
    border: `2px solid ${colors.red1}`,
    '&:hover': {
      border: `2px solid ${colors.red1}`,
    },
  },
  leaseCallout: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    padding: '15px 15px 15px 18px',
    backgroundColor: colors.reviewBoxGray,
  },
  leaseCalloutIcon: {
    flexShrink: 0,
    width: '21px',
    height: '22px',
  },
  leaseCalloutHighlight: {
    fontWeight: 600,
    color: colors.red2,
  },
  contactButton: {
    textTransform: 'uppercase',
  },
}));

type Props = {
  readonly landlordId: string | null;
  readonly landlord: string | null;
  readonly contact: () => void;
  readonly address: string | null;
  readonly aptName?: string | null;
  readonly leaseSignedStats?: LeaseSignedStats;
};

/**
 * InfoItem – Renders a single line of text information.
 *
 * @param {string} props.text – The text content to display.
 *
 * @return {JSX.Element} – A Typography line with the text.
 */
const InfoItem = ({ text, className }: { text: string; className: string }) => (
  <Typography className={className}>{text}</Typography>
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
export default function Info({
  landlordId,
  landlord,
  contact,
  address,
  aptName,
  leaseSignedStats,
}: Props): ReactElement {
  const {
    root,
    textGroup,
    title,
    infoText,
    leaseCallout,
    leaseCalloutIcon,
    leaseCalloutHighlight,
    button,
    outlinedButton,
    contactButton,
  } = useStyles();
  // null (hide the callout) when there are too few reviews with both lease dates
  const monthsBeforeStart = formatMonthsBeforeStart(leaseSignedStats?.avgMonthsBeforeStart);

  return (
    <div className={root}>
      <div className={textGroup}>
        <Typography className={title}>Information</Typography>
        <div>
          {landlord && (
            <InfoItem className={infoText} text={`Landlord/Renting Company: ${landlord}`} />
          )}
          {address && <InfoItem className={infoText} text={`Address: ${address}`} />}
        </div>
        {aptName && monthsBeforeStart && (
          <div className={leaseCallout}>
            <CalendarIcon className={leaseCalloutIcon} aria-hidden="true" />
            <Typography className={infoText}>
              {'Renters at '}
              <span className={leaseCalloutHighlight}>{aptName}</span>
              {' typically sign their leases '}
              <span className={leaseCalloutHighlight}>{monthsBeforeStart}</span>
              {' before they start'}
            </Typography>
          </div>
        )}
      </div>
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
              <Button
                color="primary"
                variant="outlined"
                fullWidth
                disableElevation
                className={clsx(button, outlinedButton)}
              >
                Visit Landlord
              </Button>
            </Link>
          )}
        </Grid>
        <Grid item xs={6} sm={12} md={6}>
          {contact && (
            <Button
              onClick={contact}
              color="primary"
              variant="contained"
              fullWidth
              disableElevation
              className={clsx(button, contactButton)}
            >
              Contact
            </Button>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

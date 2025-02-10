import React, { ReactElement, useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { createAuthHeaders, getUser } from '../../utils/firebase';

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: '10px',
  },
  cardContent: {
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
  },
  image: {
    maxWidth: '30%',
    height: 'auto',
  },
}));

/**
 * Component Props for AdminCantFindApt.
 */
type Props = {
  /** The date of the question. */
  readonly date: Date;
  /** The name of the user. */
  readonly name: string;

  /** The email of the user. */
  readonly email: string;

  /** The message of the user. */
  readonly msg: string;
};

/**
 * AdminContactQuestion - Displays contact form submissions from users in the admin interface.
 *
 * @remarks
 * Renders a Material-UI Card containing the details of a contact form submission, including
 * the date, name, email and message from the user. Used in the admin dashboard to review
 * user questions and contact requests.
 *
 * @param {Date} props.date - The submission date/time of the contact form
 * @param {string} props.name - The name of the user who submitted the form
 * @param {string} props.email - The email address provided by the user
 * @param {string} props.msg - The message/question text submitted by the user
 *
 * @returns {ReactElement} - A Material-UI Card component displaying the contact form details
 */
const AdminContactQuestion = ({ date, name, email, msg }: Props): ReactElement => {
  const classes = useStyles();
  const formattedDate = new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
  return (
    <Card className={classes.root}>
      <CardContent className={classes.cardContent}>
        <Typography variant="body1">Date: {formattedDate}</Typography>
        <Typography variant="h6">Name: {name}</Typography>
        <Typography variant="body1">Email: {email}</Typography>
        <Typography variant="body1">Msg: {msg}</Typography>
      </CardContent>
    </Card>
  );
};

export default AdminContactQuestion;

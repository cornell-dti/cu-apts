import React, { ReactElement } from 'react';
import { Box, Button, Card, CardActions, CardContent, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { createAuthHeaders, getUser } from '../../utils/firebase';
import { colors } from '../../colors';
import axios from 'axios';

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
 * Component Props for AdminContactQuestion.
 */
type Props = {
  /** The ID of the contact question. */
  readonly question_id: string;

  /** The date of the question. */
  readonly date: Date;

  /** The name of the user. */
  readonly name: string;

  /** The email of the user. */
  readonly email: string;

  /** The message of the user. */
  readonly msg: string;

  /** Function to toggle the display. */
  readonly setToggle: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * AdminContactQuestion - Displays contact form submissions from users in the admin interface.
 *
 * @remarks
 * Renders a Material-UI Card containing the details of a contact form submission, including
 * the date, name, email and message from the user. Used in the admin dashboard to review
 * user questions and contact requests.
 *
 * @param {string} props.question_id - The ID of the contact question.
 * @param {Date} props.date - The submission date/time of the contact form
 * @param {string} props.name - The name of the user who submitted the form
 * @param {string} props.email - The email address provided by the user
 * @param {string} props.msg - The message/question text submitted by the user
 * @param {Function} props.setToggle - Function to toggle the display.
 *
 * @returns {ReactElement} - A Material-UI Card component displaying the contact form details
 */
const AdminContactQuestion = ({
  question_id,
  date,
  name,
  email,
  msg,
  setToggle,
}: Props): ReactElement => {
  const classes = useStyles();
  const formattedDate = new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  /**
   * Change the status of the contact question and trigger a re-render.
   *
   * @param question_id - The ID of the contact question.
   * @param newStatus - The new status for the contact question.
   * @returns A promise representing the completion of the operation.
   */
  const changeStatus = async (question_id: string, newStatus: string) => {
    const endpoint = `/api/update-contact-question-status/${question_id}/${newStatus}`;
    let user = await getUser(true);
    if (user) {
      const token = await user.getIdToken(true);
      await axios.put(endpoint, {}, createAuthHeaders(token));
      setToggle((cur) => !cur);
    }
  };

  return (
    <Card className={classes.root} variant="outlined">
      <Box minHeight="150px">
        <CardContent>
          <Typography variant="body1">Date: {formattedDate}</Typography>
          <Typography variant="h6">Name: {name}</Typography>
          <Typography variant="body1">Email: {email}</Typography>
          <Typography variant="body1">Message: {msg}</Typography>
        </CardContent>
      </Box>

      <CardActions>
        <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
          <Grid item>
            <Button
              onClick={() => changeStatus(question_id, 'DELETED')}
              variant="contained"
              style={{ color: colors.black }}
            >
              <strong>Delete</strong>
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => changeStatus(question_id, 'COMPLETED')}
              variant="outlined"
              style={{ backgroundColor: colors.green1 }}
            >
              <strong>Done</strong>
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default AdminContactQuestion;

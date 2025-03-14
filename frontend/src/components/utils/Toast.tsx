import React, { useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

type Props = {
  isOpen: boolean;
  severity: AlertProps['color'];
  message: string;
  time: number;
  link?: string;
  linkMessage?: string;
};

/**
 * Toast Component – Displays a notification or "toast" message.
 *
 * @remarks
 * The toast appears for a limited time and then disappears. The toast's
 * color depends on its severity (type of notification).
 *
 * @param {boolean} props.isOpen - Controls the initial visibility of the toast.
 * @param {AlertProps['color']} props.severity - The type of the alert which determines
 * color of the toast. Can be one of the following: 'success' (green), 'info' (blue),
 * 'warning' (orange/yellow), 'error' (red).
 * @param {string} props.message - The message content of the alert.
 * @param {number} props.time - The duration (in milliseconds) the toast is visible
 * for before it automatically closes.
 *
 * @return {JSX.Element} The rendered Toast component.
 */

const Toast = ({ isOpen, severity, message, time, link, linkMessage }: Props) => {
  const classes = useStyles();
  const [open, setOpen] = useState(isOpen);

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason !== 'clickaway') {
      setOpen(false);
    }
  };

  return (
    <div className={classes.root}>
      <Snackbar
        open={open}
        autoHideDuration={time}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Alert onClose={handleClose} severity={severity}>
          {message}
          <Link to={link ?? '/'}>{linkMessage}</Link> : null
        </Alert>
      </Snackbar>
    </div>
  );
};
export default Toast;

import React, { useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { makeStyles, Theme } from '@material-ui/core/styles';

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
};

const Toast = ({ isOpen, severity, message, time }: Props) => {
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
        </Alert>
      </Snackbar>
    </div>
  );
};
export default Toast;

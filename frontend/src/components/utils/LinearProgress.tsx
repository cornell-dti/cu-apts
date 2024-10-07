import React, { ReactElement } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '90%',
      marginTop: theme.spacing(3),
      justifyContent: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  })
);

/**
 * LinearIndeterminate Component – Displays a linear progress bar.
 *
 * @remarks
 * This component provides a visual indication of an indeterminate loading process.
 * It utilizes Material-UI's LinearProgress component.
 *
 * @return {ReactElement} The rendered LinearIndeterminate component with a centered linear progress bar.
 */

export default function LinearIndeterminate(): ReactElement {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <LinearProgress />
    </div>
  );
}

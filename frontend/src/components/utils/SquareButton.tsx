import React, { ReactElement, ReactNode } from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { colors } from '../../colors';

type Props = {
  children: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  startIcon?: ReactNode;
};

const useStyles = makeStyles({
  root: {
    backgroundColor: colors.red1,
    color: colors.white,
    borderRadius: '10px',
    padding: '10px 20px',
    height: '36px',
    width: 'fit-content',
    flexShrink: 0,
    boxSizing: 'border-box',
    textTransform: 'none',
    fontSize: '14px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: colors.red7,
      boxShadow: 'none',
    },
  },
  startIcon: {
    marginLeft: 0,
    marginRight: '10px',
  },
});

/**
 * SquareButton – the primary "SQUARE Button" from the design system: solid red, 10px radius,
 * width fits its content, with an optional leading icon separated by a 10px gap.
 */
const SquareButton = ({ children, onClick, startIcon }: Props): ReactElement => {
  const classes = useStyles();
  return (
    <Button classes={classes} onClick={onClick} startIcon={startIcon} disableRipple>
      {children}
    </Button>
  );
};

export default SquareButton;

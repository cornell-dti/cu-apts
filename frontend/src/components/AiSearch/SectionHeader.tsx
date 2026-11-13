import React, { ReactElement } from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { colors } from '../../colors';

const useStyles = makeStyles({
  heading: {
    fontSize: '22px',
    lineHeight: '32px',
    fontWeight: 600,
    color: colors.black,
  },
  intro: {
    fontSize: '18px',
    lineHeight: '28px',
    fontWeight: 400,
    color: colors.black,
  },
});

type Props = {
  readonly heading: string;
  readonly intro?: string;
};

/** SectionHeader – heading and optional intro shared by the AI search block sections. */
const SectionHeader = ({ heading, intro }: Props): ReactElement => {
  const { heading: headingClass, intro: introClass } = useStyles();
  return (
    <div>
      <Typography className={headingClass}>{heading}</Typography>
      {intro && <Typography className={introClass}>{intro}</Typography>}
    </div>
  );
};

export default SectionHeader;

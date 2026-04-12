import React from 'react';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import RemoveIcon from '@material-ui/icons/Remove';
import { colors } from '../../colors';

type Props = {
  value: boolean | null | undefined;
};

const AmenityIcon = ({ value }: Props) => {
  if (value === true) {
    return <CheckIcon style={{ color: '#4caf50', fontSize: 32 }} />;
  }
  if (value === false) {
    return <CloseIcon style={{ color: colors.red1, fontSize: 32 }} />;
  }
  return <RemoveIcon style={{ color: '#c4c4c4', fontSize: 32 }} />;
};

export default AmenityIcon;

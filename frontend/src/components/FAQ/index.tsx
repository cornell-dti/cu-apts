import React, { ReactElement } from 'react';
import CollapsibleHeader from './CollapsibleHeader';
import { FAQData } from '../../pages/FAQPage';
import { Container, Grid, Typography } from '@material-ui/core';

type Props = {
  readonly data: FAQData[];
};

export default function FAQs({ data }: Props): ReactElement {
  return (
    <Grid container direction="column" alignItems="stretch">
      {data.map((info, index) => (
        <CollapsibleHeader key={index} {...info} />
      ))}
    </Grid>
  );
}

import React, { ReactElement } from 'react';
import { FAQ } from '../../pages/FAQPage';
import { Grid } from '@material-ui/core';
import CollapsibleQuestion from './CollapsibleQuestion';

type Props = {
  readonly data: FAQ[];
};

export default function FAQs({ data }: Props): ReactElement {
  return (
    <Grid container direction="column" alignItems="stretch">
      <Grid container direction="column" alignItems="stretch">
        {data && data.map((faq, index) => <CollapsibleQuestion key={index} {...faq} />)}
      </Grid>
    </Grid>
  );
}

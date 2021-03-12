import React, { ReactElement } from 'react';
import CollapsibleQuestion from './CollapsibleQuestion';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { FAQ } from '../../pages/FAQPage';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Grid } from '@material-ui/core';

type Props = {
  readonly headerName: string;
  readonly faqs: FAQ[];
};

export default function CollapsibleHeader({ headerName, faqs }: Props): ReactElement {
  return (
    <Grid item>
      <Accordion variant="outlined" square>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{headerName}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container direction="column" alignItems="stretch">
            {faqs && faqs.map((faq, index) => <CollapsibleQuestion key={index} {...faq} />)}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}

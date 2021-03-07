import React, { ReactElement } from 'react';
import CollapsibleQuestion from './CollapsibleQuestion';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { FAQ } from '../../pages/FAQPage';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  withStyles,
} from '@material-ui/core';

type Props = {
  readonly headerName: string;
  readonly faqs: FAQ[];
};

const StyledAccordionSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
  },
})(AccordionSummary);

export default function CollapsibleHeader({ headerName, faqs }: Props): ReactElement {
  return (
    <Accordion>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{headerName}</Typography>
      </StyledAccordionSummary>
      <AccordionDetails>
        <Grid container>
          {faqs && faqs.map((faq, index) => <CollapsibleQuestion key={index} {...faq} />)}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
